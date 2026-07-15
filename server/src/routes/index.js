const express = require("express");
const { documentRoutes } = require("./document.routes");
const { chatRoutes } = require("./chat.routes");
const { authRoutes } = require("./auth.routes");
const { billingRoutes } = require("./billing.routes");
const { adminRoutes } = require("./admin.routes");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is healthy" });
});

router.use("/auth", authRoutes);
router.use("/billing", billingRoutes);
router.use("/admin", adminRoutes);
router.use("/documents", requireAuth, documentRoutes);
router.use("/chats", requireAuth, chatRoutes);

module.exports = { apiRoutes: router };
