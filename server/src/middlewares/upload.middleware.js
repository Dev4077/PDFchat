const path = require("path");
const multer = require("multer");
const { env } = require("../config/env");
const { AppError } = require("../utils/app-error");

const allowedExtensions = new Set([".pdf", ".txt", ".doc", ".docx"]);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname.replace(
      /\s+/g,
      "_",
    )}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname || "").toLowerCase();
    if (!allowedExtensions.has(extension)) {
      return cb(
        new AppError(
          "Unsupported file type. Allowed: .pdf, .txt, .doc, .docx",
          400,
        ),
      );
    }
    cb(null, true);
  },
});

module.exports = { upload, allowedExtensions };
