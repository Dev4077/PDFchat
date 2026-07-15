const { asyncHandler } = require("../middlewares/async-handler");
const {
  registerUser,
  loginUser,
  getMe,
} = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  const data = await registerUser({ name, email, password });
  res.status(201).json({ success: true, data });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const data = await loginUser({ email, password });
  res.json({ success: true, data });
});

const me = asyncHandler(async (req, res) => {
  const data = await getMe(req.user._id);
  res.json({ success: true, data });
});

module.exports = { register, login, me };
