const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      // `admin` kept for legacy rows; treat as superadmin in access checks
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    creditBalance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

userSchema.index({ role: 1, createdAt: -1 });

const User = mongoose.model("User", userSchema);

module.exports = { User };
