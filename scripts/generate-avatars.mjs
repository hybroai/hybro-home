/**
 * Generates the DiceBear "bottts" avatars used on the home page.
 *
 * Same style and options as the Hybro app (frontend/src/lib/agent-avatar.ts),
 * written as static files so the page does not ship DiceBear to the browser.
 *
 * Usage:
 *   node scripts/generate-avatars.mjs
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createAvatar } from "@dicebear/core";
import { bottts } from "@dicebear/collection";

// Keep in sync with components/site/avatars.ts.
const SEEDS = {
  weather: "Weather Agent",
  travel: "Travel Planner Agent",
  doc: "Document Agent",
  buyer: "Buyer's agent",
  story: "Story Agent",
  image: "Image Generator Agent",
  finance: "Finance Agent",
  sales: "Sales Agent",
  legal: "Legal Agent",
  data: "Data Agent",
};

const OUTPUT_DIR = join(import.meta.dirname, "..", "public", "avatars");

await mkdir(OUTPUT_DIR, { recursive: true });
for (const [name, seed] of Object.entries(SEEDS)) {
  const svg = createAvatar(bottts, { seed, size: 128, radius: 10 }).toString();
  await writeFile(join(OUTPUT_DIR, `${name}.svg`), svg);
}
console.log(`Wrote ${Object.keys(SEEDS).length} avatars to ${OUTPUT_DIR}`);
