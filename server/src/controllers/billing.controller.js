const { asyncHandler } = require("../middlewares/async-handler");
const {
  listActivePacks,
  getBalanceAndUsage,
} = require("../services/billing.service");

const getPacks = asyncHandler(async (req, res) => {
  const packs = await listActivePacks();
  res.json({ success: true, items: packs });
});

const getBalance = asyncHandler(async (req, res) => {
  const data = await getBalanceAndUsage(req.user._id);
  res.json({ success: true, data });
});

module.exports = { getPacks, getBalance };
