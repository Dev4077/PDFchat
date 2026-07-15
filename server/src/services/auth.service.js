const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { User } = require("../models/User");
const { AppError } = require("../utils/app-error");

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );
}

function toPublicUser(user) {
  const role =
    user.role === "admin" ? "superadmin" : user.role;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role,
    creditBalance: user.creditBalance,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function registerUser({ name, email, password }) {
  if (!name || !String(name).trim()) {
    throw new AppError("name is required", 400);
  }
  if (!email || !String(email).trim()) {
    throw new AppError("email is required", 400);
  }
  if (!password || String(password).length < 8) {
    throw new AppError("password must be at least 8 characters", 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const role =
    env.superadminEmail && normalizedEmail === env.superadminEmail
      ? "superadmin"
      : "user";

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    creditBalance: 0,
  });

  const token = signToken(user);
  return { token, user: toPublicUser(user) };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new AppError("email and password are required", 400);
  }

  const user = await User.findOne({
    email: String(email).toLowerCase().trim(),
  });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new AppError("Invalid email or password", 401);
  }

  // Upgrade legacy admin → superadmin on login
  if (user.role === "admin") {
    user.role = "superadmin";
    await user.save();
  }

  const token = signToken(user);
  return { token, user: toPublicUser(user) };
}

async function getMe(userId) {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin") {
    user.role = "superadmin";
    await user.save();
  }
  return toPublicUser(user);
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  toPublicUser,
  signToken,
};
