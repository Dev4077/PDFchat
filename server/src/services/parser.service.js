const fs = require("fs/promises");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const WordExtractor = require("word-extractor");
const { AppError } = require("../utils/app-error");
const { normalizeText } = require("./chunking.service");

const wordExtractor = new WordExtractor();

async function parsePdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);
  return normalizeText(parsed.text);
}

async function parseTxt(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  return normalizeText(text);
}

async function parseDocx(filePath) {
  const buffer = await fs.readFile(filePath);
  const parsed = await mammoth.extractRawText({ buffer });
  return normalizeText(parsed.value);
}

async function parseDoc(filePath) {
  const parsed = await wordExtractor.extract(filePath);
  return normalizeText(parsed.getBody());
}

async function extractTextFromFile(filePath, originalName) {
  const extension = path.extname(originalName || filePath).toLowerCase();

  try {
    if (extension === ".pdf") return await parsePdf(filePath);
    if (extension === ".txt") return await parseTxt(filePath);
    if (extension === ".docx") return await parseDocx(filePath);
    if (extension === ".doc") return await parseDoc(filePath);
  } catch (error) {
    throw new AppError(
      "Failed to parse file content. Check whether the file is valid and not corrupted.",
      400,
      { reason: error.message },
    );
  }

  throw new AppError(
    "Unsupported file type. Allowed: .pdf, .txt, .doc, .docx",
    400,
  );
}

module.exports = { extractTextFromFile };
