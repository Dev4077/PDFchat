const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: { type: String, required: true },
    citations: [
      {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
        chunkOrder: Number,
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({ chatId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

module.exports = { Message };
