const express = require("express");
const {
  createChat,
  attachDocuments,
  postMessage,
  getMessages,
} = require("../controllers/chat.controller");

const router = express.Router();

router.post("/", createChat);
router.patch("/:chatId/documents", attachDocuments);
router.post("/:chatId/messages", postMessage);
router.get("/:chatId/messages", getMessages);

module.exports = { chatRoutes: router };
