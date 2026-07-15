const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    order: { type: Number, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true },
);

chunkSchema.index({ documentId: 1, order: 1 }, { unique: true });

const Chunk = mongoose.model("Chunk", chunkSchema);

module.exports = { Chunk };
