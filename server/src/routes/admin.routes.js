const express = require("express");
const {
  getUsers,
  patchUser,
  getUsageForUser,
  getUsage,
  getPacks,
  postPack,
  patchPack,
} = require("../controllers/admin.controller");
const {
  requireAuth,
  requireSuperadmin,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(requireAuth, requireSuperadmin);

router.get("/users", getUsers);
router.patch("/users/:id", patchUser);
router.get("/users/:id/usage", getUsageForUser);
router.get("/usage", getUsage);
router.get("/packs", getPacks);
router.post("/packs", postPack);
router.patch("/packs/:id", patchPack);

module.exports = { adminRoutes: router };
