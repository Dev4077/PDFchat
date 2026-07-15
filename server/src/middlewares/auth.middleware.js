const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { User } = require("../models/User");
const { AppError } = require("../utils/app-error");
const { asyncHandler } = require("./async-handler");

function isSuperadminRole(role) {
  return role === "superadmin" || role === "admin";
}

const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authentication required", 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  const user = await User.findById(payload.sub).select("-passwordHash");
  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});

function requireSuperadmin(req, res, next) {
  if (!req.user || !isSuperadminRole(req.user.role)) {
    return next(new AppError("Superadmin access required", 403));
  }
  return next();
}

module.exports = {
  requireAuth,
  requireSuperadmin,
  // Alias used by older imports
  requireAdmin: requireSuperadmin,
  isSuperadminRole,
};
