const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    extension: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true },
    openAiVectorStoreId: { type: String, default: null },
    openAiVectorFileId: { type: String, default: null },
    textLength: { type: Number, default: 0 },
    chunkCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    processingError: { type: String, default: null },
  },
  { timestamps: true },
);

documentSchema.index({ userId: 1, status: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

module.exports = { Document };
