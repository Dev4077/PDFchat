const { env } = require("../config/env");
const { CreditPack } = require("../models/CreditPack");
const { Purchase } = require("../models/Purchase");
const { UsageEvent } = require("../models/UsageEvent");
const { User } = require("../models/User");
const { AppError } = require("../utils/app-error");

async function listActivePacks() {
  return CreditPack.find({ active: true }).sort({ sortOrder: 1 }).lean();
}

async function getBalanceAndUsage(userId, { usageLimit = 20 } = {}) {
  const [user, usage, purchases] = await Promise.all([
    User.findById(userId).select("creditBalance name email role"),
    UsageEvent.find({ userId })
      .sort({ createdAt: -1 })
      .limit(usageLimit)
      .lean(),
    Purchase.find({ userId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("packId", "name")
      .lean(),
  ]);

  if (!user) throw new AppError("User not found", 404);

  return {
    creditBalance: user.creditBalance,
    creditsPer1kTokens: env.creditsPer1kTokens,
    usage,
    purchases,
  };
}

module.exports = {
  listActivePacks,
  getBalanceAndUsage,
};
