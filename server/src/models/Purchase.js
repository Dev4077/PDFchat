const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    packId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditPack",
      default: null,
    },
    credits: { type: Number, required: true },
    amountCents: { type: Number, default: 0 },
    provider: {
      type: String,
      enum: ["superadmin"],
      required: true,
      default: "superadmin",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    note: { type: String, default: null },
  },
  { timestamps: true },
);

purchaseSchema.index({ userId: 1, createdAt: -1 });

const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = { Purchase };
