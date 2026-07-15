const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "New chat" },
    documentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  { timestamps: true },
);

chatSessionSchema.index({ userId: 1, createdAt: -1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

module.exports = { ChatSession };
