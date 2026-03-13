import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

interface DocChunk {
  text: string;
  file: string;
  section: string;
  url_path: string;
  embedding: number[];
}

let cachedIndex: DocChunk[] | null = null;

async function loadIndex(): Promise<DocChunk[]> {
  if (cachedIndex) return cachedIndex;

  try {
    const indexPath = join(process.cwd(), "data", "search-index.json");
    const data = await readFile(indexPath, "utf-8");
    cachedIndex = JSON.parse(data);
    return cachedIndex!;
  } catch {
    return [];
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Rate limiter (in-memory, per IP) ──
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per window
const MAX_TRACKED_IPS = 10_000;
const ipRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Prune stale IPs to prevent unbounded growth
  if (ipRequests.size > MAX_TRACKED_IPS) {
    for (const [key, timestamps] of ipRequests) {
      if (timestamps.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
        ipRequests.delete(key);
      }
    }
  }

  const timestamps = (ipRequests.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    ipRequests.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return false;
}

// ── Origin check ──
const ALLOWED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "docs.hybro.ai",
  "hybro-documents.vercel.app",
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return true; // Same-origin requests have no Origin header
  try {
    const hostname = new URL(origin).hostname;
    return ALLOWED_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

// ── Similarity threshold ──
const MIN_SIMILARITY = 0.3;

async function findRelevantChunks(
  query: string,
  topK: number = 5
): Promise<{ chunks: DocChunk[]; bestScore: number }> {
  const index = await loadIndex();
  if (index.length === 0) return { chunks: [], bestScore: 0 };

  const openaiClient = new OpenAI();
  const response = await openaiClient.embeddings.create({
    model: "text-embedding-3-small",
    input: query,
  });
  const queryEmbedding = response.data[0].embedding;

  const scored = index.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  const bestScore = scored[0]?.score ?? 0;

  // Only return chunks above the similarity threshold
  const relevant = scored
    .filter((s) => s.score >= MIN_SIMILARITY)
    .slice(0, topK);

  return { chunks: relevant.map((s) => s.chunk), bestScore };
}

// Convert UIMessage format (parts array) to ModelMessage format (content string)
function toModelMessages(
  uiMessages: Array<{
    role: string;
    parts?: Array<{ type: string; text?: string }>;
    content?: string;
  }>
) {
  return uiMessages.map((msg) => {
    const content =
      msg.content ??
      msg.parts
        ?.filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("") ??
      "";
    return { role: msg.role as "user" | "assistant", content };
  });
}

function textStreamResponse(text: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  // ── Origin check ──
  const origin = req.headers.get("origin") ?? "";
  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── Rate limiting ──
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait a minute before asking again.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }
    );
  }

  const { messages: rawMessages } = await req.json();
  const modelMessages = toModelMessages(rawMessages);

  const lastMessage =
    modelMessages[modelMessages.length - 1]?.content || "";

  const { chunks: relevantChunks, bestScore } =
    await findRelevantChunks(lastMessage);

  // ── No relevant docs → refuse to hallucinate (return as text stream) ──
  if (relevantChunks.length === 0 || bestScore < MIN_SIMILARITY) {
    return textStreamResponse(
      "I couldn't find relevant information in the Hybro documentation for your question. " +
        "Try rephrasing, or browse the docs directly:\n\n" +
        "- [Getting Started](/hybro-platform/agent-users/getting-started)\n" +
        "- [For Agent Developers](/hybro-platform/agent-developers)\n" +
        "- [Gateway](/hybro-hub/gateway)\n" +
        "- [A2A Adapter](/a2a-adapter)"
    );
  }

  const contextText = relevantChunks
    .map(
      (chunk) =>
        `[Source: ${chunk.url_path}${chunk.section ? " > " + chunk.section : ""}]\n${chunk.text}`
    )
    .join("\n\n---\n\n");

  const sourcePages = [
    ...new Set(relevantChunks.map((c) => c.url_path)),
  ];

  const systemPrompt = `You are a documentation assistant for Hybro AI. You ONLY answer questions using the documentation excerpts provided below. Do not use any outside knowledge.

Rules:
- If the excerpts do not contain enough information, say "I don't have enough information in the docs to answer that" and suggest relevant pages.
- Always cite the source page when referencing information, using markdown links like [Page Name](url_path).
- Be concise and direct. Use short paragraphs or bullet points.
- At the end of your answer, include a "Sources" section listing the pages you referenced.

Documentation excerpts:

${contextText}

Available source pages: ${sourcePages.join(", ")}`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: modelMessages,
  });

  return result.toTextStreamResponse();
}
