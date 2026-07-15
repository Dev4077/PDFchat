const { env } = require("../config/env");
const { User } = require("../models/User");
const { UsageEvent } = require("../models/UsageEvent");
const { AppError } = require("../utils/app-error");

function tokensToCredits(totalTokens) {
  const per1k = env.creditsPer1kTokens || 1;
  return Math.max(1, Math.ceil((Number(totalTokens) || 0) / 1000) * per1k);
}

async function ensureHasCredits(userId) {
  const user = await User.findById(userId).select("creditBalance");
  if (!user) throw new AppError("User not found", 404);
  if (user.creditBalance <= 0) {
    throw new AppError(
      "Insufficient credits. Ask a superadmin to top up your balance.",
      402,
    );
  }
  return user;
}

async function chargeUsage({
  userId,
  chatId = null,
  model,
  promptTokens = 0,
  completionTokens = 0,
  totalTokens = 0,
}) {
  const tokens =
    Number(totalTokens) ||
    Number(promptTokens) + Number(completionTokens) ||
    0;
  const creditsCharged = tokensToCredits(tokens);

  const user = await User.findOneAndUpdate(
    { _id: userId, creditBalance: { $gte: creditsCharged } },
    { $inc: { creditBalance: -creditsCharged } },
    { new: true },
  );

  if (!user) {
    const current = await User.findById(userId).select("creditBalance");
    if (!current) throw new AppError("User not found", 404);
    throw new AppError(
      `Insufficient credits. This request needs ${creditsCharged} credit(s); you have ${current.creditBalance}.`,
      402,
    );
  }

  const usage = await UsageEvent.create({
    userId,
    chatId,
    model,
    promptTokens,
    completionTokens,
    totalTokens: tokens,
    creditsCharged,
    balanceAfter: user.creditBalance,
  });

  return { user, usage, creditsCharged };
}

async function grantCredits({
  userId,
  credits,
  amountCents = 0,
  packId = null,
  note = null,
  status = "completed",
}) {
  if (!Number.isFinite(credits) || credits === 0) {
    throw new AppError("credits must be a non-zero number", 400);
  }

  const updated = await User.findByIdAndUpdate(
    userId,
    { $inc: { creditBalance: credits } },
    { new: true },
  );

  if (!updated) throw new AppError("User not found", 404);
  if (updated.creditBalance < 0) {
    updated.creditBalance = 0;
    await updated.save();
  }

  const { Purchase } = require("../models/Purchase");
  const purchase = await Purchase.create({
    userId,
    packId,
    credits,
    amountCents,
    provider: "superadmin",
    status,
    note,
  });

  return { user: updated, purchase };
}

async function setCreditBalance({ userId, creditBalance, note = null }) {
  if (!Number.isFinite(creditBalance) || creditBalance < 0) {
    throw new AppError("creditBalance must be a non-negative number", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const previous = user.creditBalance;
  const delta = Number(creditBalance) - previous;
  user.creditBalance = Number(creditBalance);
  await user.save();

  let purchase = null;
  if (delta !== 0) {
    const { Purchase } = require("../models/Purchase");
    purchase = await Purchase.create({
      userId,
      credits: delta,
      amountCents: 0,
      provider: "superadmin",
      status: "completed",
      note: note || `Set balance to ${creditBalance} (was ${previous})`,
    });
  }

  return { user, purchase };
}

module.exports = {
  tokensToCredits,
  ensureHasCredits,
  chargeUsage,
  grantCredits,
  setCreditBalance,
};
