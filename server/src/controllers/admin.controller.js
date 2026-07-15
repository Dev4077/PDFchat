const { asyncHandler } = require("../middlewares/async-handler");
const {
  listUsers,
  updateUser,
  getUserUsage,
  listAllUsage,
  listPacksAdmin,
  createPack,
  updatePack,
} = require("../services/admin.service");

const getUsers = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const data = await listUsers({
    q: req.query.q || "",
    page,
    limit,
  });
  res.json({ success: true, ...data });
});

const patchUser = asyncHandler(async (req, res) => {
  const { role, creditDelta, creditBalance, packId, note } = req.body || {};
  const data = await updateUser(req.params.id, {
    role,
    creditDelta,
    creditBalance,
    packId,
    note,
  });
  res.json({ success: true, data });
});

const getUsageForUser = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const data = await getUserUsage(req.params.id, { page, limit });
  res.json({ success: true, ...data });
});

const getUsage = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const data = await listAllUsage({
    userId: req.query.userId,
    page,
    limit,
  });
  res.json({ success: true, ...data });
});

const getPacks = asyncHandler(async (req, res) => {
  const items = await listPacksAdmin();
  res.json({ success: true, items });
});

const postPack = asyncHandler(async (req, res) => {
  const pack = await createPack(req.body || {});
  res.status(201).json({ success: true, data: pack });
});

const patchPack = asyncHandler(async (req, res) => {
  const pack = await updatePack(req.params.id, req.body || {});
  res.json({ success: true, data: pack });
});

module.exports = {
  getUsers,
  patchUser,
  getUsageForUser,
  getUsage,
  getPacks,
  postPack,
  patchPack,
};
