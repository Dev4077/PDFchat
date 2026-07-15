const mongoose = require("mongoose");

const usageEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      default: null,
    },
    model: { type: String, required: true },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    creditsCharged: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
  },
  { timestamps: true },
);

usageEventSchema.index({ userId: 1, createdAt: -1 });
usageEventSchema.index({ createdAt: -1 });

const UsageEvent = mongoose.model("UsageEvent", usageEventSchema);

module.exports = { UsageEvent };
