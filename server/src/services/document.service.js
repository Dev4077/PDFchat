const path = require("path");
const { Document } = require("../models/Document");
const { AppError } = require("../utils/app-error");
const { uploadFileToOpenAiVectorStore } = require("./ai.service");

async function createDocumentFromUpload(file, userId) {
  if (!file) throw new AppError("File is required", 400);
  if (!userId) throw new AppError("Authentication required", 401);

  const extension = path.extname(file.originalname || "").toLowerCase();

  const document = await Document.create({
    userId,
    name: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    extension,
    sizeBytes: file.size,
    storagePath: file.path,
    status: "processing",
  });

  try {
    const vectorIndex = await uploadFileToOpenAiVectorStore({
      filePath: file.path,
      originalName: file.originalname,
      documentId: document._id.toString(),
    });

    document.openAiVectorStoreId = vectorIndex.vectorStoreId;
    document.openAiVectorFileId = vectorIndex.vectorFileId;
    document.status = "ready";
    await document.save();

    return document;
  } catch (error) {
    document.status = "failed";
    document.processingError = error.message;
    await document.save();
    throw error;
  }
}

async function listDocuments({ userId, isAdmin = false, page = 1, limit = 20 }) {
  const filter = isAdmin ? {} : { userId };
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Document.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Document.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = { createDocumentFromUpload, listDocuments };
