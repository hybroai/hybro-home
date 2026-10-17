/**
 * Build-time documentation indexing script.
 *
 * Reads all MDX files, chunks them, generates OpenAI embeddings,
 * and saves the index to public/search-index.json.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/index-docs.mjs
 */

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";
import OpenAI from "openai";

const CONTENT_DIR = join(import.meta.dirname, "..", "content");
const OUTPUT_PATH = join(
  import.meta.dirname,
  "..",
  "data",
  "search-index.json"
);
const CHUNK_SIZE = 500; // approximate tokens per chunk
const CHUNK_OVERLAP = 50; // overlap tokens between chunks
const EMBEDDING_MODEL = "text-embedding-3-small";

async function getAllMdxFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".mdx"))
    .map((e) => join(e.parentPath || e.path, e.name));
}

function stripMdxSyntax(content) {
  return (
    content
      // Remove import statements
      .replace(/^import\s+.*$/gm, "")
      // Remove JSX tags but keep text content
      .replace(/<[^>]+>/g, "")
      // Remove frontmatter
      .replace(/^---[\s\S]*?---/m, "")
      // Collapse multiple newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// Docs are served under this prefix (nextra contentDirBasePath in next.config.mjs).
const DOCS_BASE_PATH = "/docs";

function filePathToUrlPath(filePath) {
  let rel = relative(CONTENT_DIR, filePath)
    .replace(/\.mdx$/, "")
    .replace(/\\/g, "/");
  if (rel === "index") return DOCS_BASE_PATH;
  if (rel.endsWith("/index")) rel = rel.replace(/\/index$/, "");
  return DOCS_BASE_PATH + "/" + rel;
}

function chunkText(text, filePath) {
  const urlPath = filePathToUrlPath(filePath);
  const lines = text.split("\n");
  const chunks = [];
  let currentChunk = [];
  let currentSection = "";
  let tokenEstimate = 0;

  for (const line of lines) {
    // Track section headers
    const headerMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headerMatch) {
      currentSection = headerMatch[1];
    }

    const lineTokens = Math.ceil(line.split(/\s+/).length * 1.3);

    if (tokenEstimate + lineTokens > CHUNK_SIZE && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.join("\n").trim(),
        file: relative(CONTENT_DIR, filePath),
        section: currentSection,
        url_path: urlPath,
      });

      // Keep overlap
      const overlapLines = [];
      let overlapTokens = 0;
      for (let i = currentChunk.length - 1; i >= 0; i--) {
        const lt = Math.ceil(currentChunk[i].split(/\s+/).length * 1.3);
        if (overlapTokens + lt > CHUNK_OVERLAP) break;
        overlapLines.unshift(currentChunk[i]);
        overlapTokens += lt;
      }
      currentChunk = overlapLines;
      tokenEstimate = overlapTokens;
    }

    currentChunk.push(line);
    tokenEstimate += lineTokens;
  }

  if (currentChunk.length > 0) {
    const text = currentChunk.join("\n").trim();
    if (text.length > 20) {
      chunks.push({
        text,
        file: relative(CONTENT_DIR, filePath),
        section: currentSection,
        url_path: urlPath,
      });
    }
  }

  return chunks;
}

async function generateEmbeddings(openai, texts) {
  const batchSize = 100;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(
      `  Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} chunks)`
    );

    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    });

    for (const item of response.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable is required");
    console.error("Usage: OPENAI_API_KEY=sk-... node scripts/index-docs.mjs");
    process.exit(1);
  }

  const openai = new OpenAI();

  console.log("Scanning MDX files...");
  const files = await getAllMdxFiles(CONTENT_DIR);
  console.log(`Found ${files.length} MDX files`);

  console.log("Chunking content...");
  const allChunks = [];
  for (const file of files) {
    const raw = await readFile(file, "utf-8");
    const clean = stripMdxSyntax(raw);
    const chunks = chunkText(clean, file);
    allChunks.push(...chunks);
  }
  console.log(`Created ${allChunks.length} chunks`);

  console.log("Generating embeddings...");
  const texts = allChunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(openai, texts);

  const index = allChunks.map((chunk, i) => ({
    ...chunk,
    embedding: embeddings[i],
  }));

  await mkdir(join(OUTPUT_PATH, ".."), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(index));
  console.log(`Index saved to ${OUTPUT_PATH} (${index.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
