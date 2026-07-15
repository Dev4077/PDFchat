const mongoose = require("mongoose");
const { User } = require("../models/User");
const { CreditPack } = require("../models/CreditPack");
const { UsageEvent } = require("../models/UsageEvent");
const { AppError } = require("../utils/app-error");
const {
  grantCredits,
  setCreditBalance,
} = require("./credits.service");
const { toPublicUser } = require("./auth.service");

async function listUsers({ q = "", page = 1, limit = 50 } = {}) {
  const filter = {};
  if (q && String(q).trim()) {
    const term = String(q).trim();
    filter.$or = [
      { email: new RegExp(term, "i") },
      { name: new RegExp(term, "i") },
    ];
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map((u) => toPublicUser(u)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function updateUser(
  userId,
  { role, creditDelta, creditBalance, packId, note } = {},
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  let purchase = null;

  if (typeof role !== "undefined") {
    if (!["user", "superadmin"].includes(role)) {
      throw new AppError("role must be user or superadmin", 400);
    }
    user.role = role;
    await user.save();
  }

  if (typeof packId !== "undefined" && packId) {
    if (!mongoose.Types.ObjectId.isValid(packId)) {
      throw new AppError("Invalid pack id", 400);
    }
    const pack = await CreditPack.findById(packId);
    if (!pack || !pack.active) {
      throw new AppError("Credit pack not found or inactive", 404);
    }
    const result = await grantCredits({
      userId,
      credits: pack.credits,
      amountCents: pack.priceCents,
      packId: pack._id,
      note: note || `Assigned pack: ${pack.name}`,
    });
    return { user: toPublicUser(result.user), purchase: result.purchase };
  }

  if (typeof creditBalance !== "undefined") {
    const result = await setCreditBalance({
      userId,
      creditBalance: Number(creditBalance),
      note: note || "Superadmin set balance",
    });
    return { user: toPublicUser(result.user), purchase: result.purchase };
  }

  if (typeof creditDelta !== "undefined" && Number(creditDelta) !== 0) {
    const result = await grantCredits({
      userId,
      credits: Number(creditDelta),
      note: note || "Superadmin credit adjustment",
    });
    return { user: toPublicUser(result.user), purchase: result.purchase };
  }

  const fresh = await User.findById(userId);
  return { user: toPublicUser(fresh), purchase };
}

async function getUserUsage(userId, { page = 1, limit = 50 } = {}) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError("Invalid user id", 400);
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    UsageEvent.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    UsageEvent.countDocuments({ userId }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function listAllUsage({ userId, page = 1, limit = 50 } = {}) {
  const filter = {};
  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user id", 400);
    }
    filter.userId = userId;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    UsageEvent.find(filter)
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    UsageEvent.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function listPacksAdmin() {
  return CreditPack.find().sort({ sortOrder: 1 }).lean();
}

async function createPack(payload) {
  const { name, priceCents, credits, active = true, sortOrder = 0 } = payload;
  if (!name || !Number.isFinite(Number(priceCents)) || !Number.isFinite(Number(credits))) {
    throw new AppError("name, priceCents, and credits are required", 400);
  }
  return CreditPack.create({
    name: String(name).trim(),
    priceCents: Number(priceCents),
    credits: Number(credits),
    active: Boolean(active),
    sortOrder: Number(sortOrder) || 0,
  });
}

async function updatePack(packId, payload) {
  if (!mongoose.Types.ObjectId.isValid(packId)) {
    throw new AppError("Invalid pack id", 400);
  }

  const pack = await CreditPack.findById(packId);
  if (!pack) throw new AppError("Pack not found", 404);

  const fields = ["name", "priceCents", "credits", "active", "sortOrder"];
  for (const key of fields) {
    if (typeof payload[key] !== "undefined") {
      pack[key] = payload[key];
    }
  }
  await pack.save();
  return pack;
}

module.exports = {
  listUsers,
  updateUser,
  getUserUsage,
  listAllUsage,
  listPacksAdmin,
  createPack,
  updatePack,
};
