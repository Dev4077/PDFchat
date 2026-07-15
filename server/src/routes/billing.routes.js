const express = require("express");
const { getPacks, getBalance } = require("../controllers/billing.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/packs", getPacks);
router.get("/balance", requireAuth, getBalance);

module.exports = { billingRoutes: router };
