import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".superloopy",
  "coverage",
  "node_modules",
  "out",
]);
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const audioExtensions = new Set([
  ".aac",
  ".flac",
  ".m4a",
  ".mp3",
  ".ogg",
  ".wav",
]);
const secretPatterns = [
  { label: "Gemini-style AQ key", pattern: /\bAQ\.[A-Za-z0-9_-]{20,}\b/u },
  { label: "Google API key", pattern: /\bAIza[A-Za-z0-9_-]{20,}\b/u },
  { label: "OpenAI-style key", pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/u },
  {
    label: "assigned API key",
    pattern: /\b(?:GEMINI_)?API_KEY\s*[:=]\s*["']?[A-Za-z0-9._-]{16,}/iu,
  },
  {
    label: "private key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u,
  },
];

async function listFiles(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...(await listFiles(absolute)));
    } else if (entry.isFile()) {
      result.push(absolute);
    }
  }
  return result;
}

function relative(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function zipEntries(buffer) {
  const eocdSignature = 0x06054b50;
  const centralSignature = 0x02014b50;
  const searchStart = Math.max(0, buffer.length - 65_557);
  let eocd = -1;

  for (let offset = buffer.length - 22; offset >= searchStart; offset -= 1) {
    if (buffer.readUInt32LE(offset) === eocdSignature) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error("ZIP end-of-central-directory record is missing.");

  const expectedCount = buffer.readUInt16LE(eocd + 10);
  let offset = buffer.readUInt32LE(eocd + 16);
  const entries = [];

  while (entries.length < expectedCount) {
    if (buffer.readUInt32LE(offset) !== centralSignature) {
      throw new Error(`Invalid ZIP central-directory record at byte ${offset}.`);
    }
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    entries.push(buffer.toString("utf8", offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

const files = await listFiles(root);
const failures = [];

for (const file of files) {
  const rel = relative(file);
  const extension = path.extname(file).toLowerCase();

  if (audioExtensions.has(extension)) {
    failures.push(`${rel}: public source contains an audio file`);
  }
  if (!textExtensions.has(extension)) continue;

  const text = await readFile(file, "utf8");
  for (const { label, pattern } of secretPatterns) {
    if (pattern.test(text)) failures.push(`${rel}: possible ${label}`);
  }
  if (/C:\\Users\\slamp/iu.test(text)) {
    failures.push(`${rel}: contains an absolute local user path`);
  }
}

const requiredFiles = [
  "public/aria-logo.png",
  "public/og.jpg",
  "public/downloads/ARIA-example-collection.zip",
  "demo-files/PROVENANCE.md",
  "LICENSE",
  "PRIVACY.md",
  "SECURITY.md",
];
for (const rel of requiredFiles) {
  try {
    const info = await stat(path.join(root, rel));
    if (!info.isFile() || info.size === 0) failures.push(`${rel}: empty or not a file`);
  } catch {
    failures.push(`${rel}: required file is missing`);
  }
}

for (const rel of ["public/dalgu.png", "public/og.png"]) {
  try {
    await stat(path.join(root, rel));
    failures.push(`${rel}: retired public asset is still present`);
  } catch {
    // Expected: retired asset is absent.
  }
}

const directorySource = await readFile(
  path.join(root, "src/lib/lab-directory.ts"),
  "utf8",
);
if (/[가-힣]{2,4}\s*교수/u.test(directorySource)) {
  failures.push("src/lib/lab-directory.ts: contains a real-looking professor name");
}

const bundlePath = path.join(
  root,
  "public/downloads/ARIA-example-collection.zip",
);
const bundleEntries = zipEntries(await readFile(bundlePath));
const expectedEntries = new Set([
  "PROVENANCE.md",
  "README-DEMO-FILES.md",
  "handwritten-transfer-note.png",
  "latest-direct-note.txt",
  "neural-systems-lab-reference-protocol.pdf",
  "transfer-handover-transcript.txt",
  "troubleshooting-experience.md",
]);
if (
  bundleEntries.length !== expectedEntries.size ||
  bundleEntries.some((entry) => !expectedEntries.has(entry))
) {
  failures.push(
    `public/downloads/ARIA-example-collection.zip: unexpected entries (${bundleEntries.join(", ")})`,
  );
}
if (bundleEntries.some((entry) => audioExtensions.has(path.extname(entry).toLowerCase()))) {
  failures.push("public/downloads/ARIA-example-collection.zip: contains audio");
}

if (failures.length > 0) {
  console.error("Public release checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `Public release checks passed (${files.length} files; ${bundleEntries.length} ZIP entries).`,
  );
}
