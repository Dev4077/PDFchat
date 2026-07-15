const express = require("express");
const { upload } = require("../middlewares/upload.middleware");
const {
  uploadDocument,
  getDocuments,
} = require("../controllers/document.controller");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);

module.exports = { documentRoutes: router };
