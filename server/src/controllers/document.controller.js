const { asyncHandler } = require("../middlewares/async-handler");
const { isSuperadminRole } = require("../middlewares/auth.middleware");
const {
  createDocumentFromUpload,
  listDocuments,
} = require("../services/document.service");

const uploadDocument = asyncHandler(async (req, res) => {
  const document = await createDocumentFromUpload(req.file, req.user._id);
  res.status(201).json({
    success: true,
    data: document,
  });
});

const getDocuments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const data = await listDocuments({
    userId: req.user._id,
    isAdmin: isSuperadminRole(req.user.role),
    page,
    limit,
  });

  res.json({
    success: true,
    ...data,
  });
});

module.exports = { uploadDocument, getDocuments };
