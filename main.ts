// gta6-meme-x-01 entry program (Node 22, standard library only).
//
// It copies POST.json from the repository root to the output directory,
// where the house reads the X post's address from it. The post itself is
// the entry: the house reads the post from X (its first picture, the meme,
// then its text) and hands that to the judge. Nothing this program writes
// about the post is judged.
//
// Before submitting, POST.json must name the real post:
//   {"url": "https://x.com/<handle>/status/<id>"}
// As shipped it holds a placeholder address, which the gate refuses.
//
// The program validates POST.json before copying: it must parse as a JSON
// object with a "url" string, and it must be at most 16384 bytes (the
// gate's post_file limit). It then copies the file's original bytes, so
// two runs write exactly the same output.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const MAX_POST_BYTES = 16384;

function fail(message) {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

const sourcePath = join(BOT_DIR, "POST.json");

let raw;
try {
  raw = readFileSync(sourcePath);
} catch (err) {
  fail(`could not read ${sourcePath}: ${err.message}`);
}

if (raw.length > MAX_POST_BYTES) {
  fail(`POST.json is ${raw.length} bytes, over the ${MAX_POST_BYTES} byte limit`);
}

let parsed;
try {
  parsed = JSON.parse(raw.toString("utf8"));
} catch (err) {
  fail(`POST.json is not valid JSON: ${err.message}`);
}

if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
  fail("POST.json must be a JSON object, not an array or a bare value");
}
if (typeof parsed.url !== "string" || parsed.url.length === 0) {
  fail('POST.json must be an object with a "url" string');
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  writeFileSync(join(OUTPUT_DIR, "POST.json"), raw);
} catch (err) {
  fail(`could not write POST.json to ${OUTPUT_DIR}: ${err.message}`);
}
