const mongoose = require("mongoose");

const creditPackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    priceCents: { type: Number, required: true, min: 0 },
    credits: { type: Number, required: true, min: 1 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

creditPackSchema.index({ active: 1, sortOrder: 1 });

const CreditPack = mongoose.model("CreditPack", creditPackSchema);

module.exports = { CreditPack };
