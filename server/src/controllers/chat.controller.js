const { asyncHandler } = require("../middlewares/async-handler");
const { isSuperadminRole } = require("../middlewares/auth.middleware");
const {
  createChatSession,
  addDocumentsToChat,
  sendMessage,
  getChatMessages,
} = require("../services/chat.service");

const createChat = asyncHandler(async (req, res) => {
  const { title, documentIds } = req.body || {};
  const chat = await createChatSession({
    title,
    documentIds,
    userId: req.user._id,
    isAdmin: isSuperadminRole(req.user.role),
  });
  res.status(201).json({ success: true, data: chat });
});

const attachDocuments = asyncHandler(async (req, res) => {
  const { documentIds } = req.body || {};
  const chat = await addDocumentsToChat(
    req.params.chatId,
    documentIds || [],
    req.user._id,
    isSuperadminRole(req.user.role),
  );
  res.json({ success: true, data: chat });
});

const postMessage = asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  const result = await sendMessage(
    req.params.chatId,
    message,
    req.user._id,
    isSuperadminRole(req.user.role),
  );
  res.status(201).json({ success: true, data: result });
});

const getMessages = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const data = await getChatMessages(
    req.params.chatId,
    { page, limit },
    req.user._id,
    isSuperadminRole(req.user.role),
  );
  res.json({ success: true, ...data });
});

module.exports = { createChat, attachDocuments, postMessage, getMessages };
