const { env } = require("../config/env");

function normalizeText(input) {
  return (input || "").replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function splitIntoChunks(text) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  const chunkSize = Math.max(200, env.chunkSize);
  const overlap = Math.max(0, Math.min(env.chunkOverlap, chunkSize - 1));

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const chunkText = normalized.slice(start, end).trim();
    if (chunkText) {
      chunks.push(chunkText);
    }
    if (end >= normalized.length) {
      break;
    }
    start = end - overlap;
  }

  return chunks;
}

module.exports = { splitIntoChunks, normalizeText };
