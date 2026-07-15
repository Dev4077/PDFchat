const mongoose = require("mongoose");
const { env } = require("../config/env");
const { ChatSession } = require("../models/ChatSession");
const { Message } = require("../models/Message");
const { Document } = require("../models/Document");
const { AppError } = require("../utils/app-error");
const { createChatCompletion } = require("./ai.service");
const { getTopRelevantChunks } = require("./retrieval.service");
const {
  ensureHasCredits,
  chargeUsage,
} = require("./credits.service");

function parseObjectIdList(input = []) {
  return input
    .filter(Boolean)
    .map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(`Invalid id: ${id}`, 400);
      }
      return new mongoose.Types.ObjectId(id);
    });
}

async function assertOwnedDocuments(userId, documentIds, isAdmin = false) {
  if (!documentIds.length) return;
  const filter = {
    _id: { $in: documentIds },
    status: "ready",
    openAiVectorStoreId: { $exists: true, $ne: null },
  };
  if (!isAdmin) filter.userId = userId;

  const count = await Document.countDocuments(filter);
  if (count !== documentIds.length) {
    throw new AppError("Some documentIds are missing, not ready, or not yours", 400);
  }
}

async function getOwnedChat(chatId, userId, isAdmin = false) {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new AppError("Invalid chatId", 400);
  }
  const chat = await ChatSession.findById(chatId);
  if (!chat) throw new AppError("Chat session not found", 404);
  if (!isAdmin && chat.userId.toString() !== userId.toString()) {
    throw new AppError("Chat session not found", 404);
  }
  return chat;
}

async function createChatSession({
  title,
  documentIds = [],
  userId,
  isAdmin = false,
}) {
  if (!userId) throw new AppError("Authentication required", 401);

  const normalizedDocIds = parseObjectIdList(documentIds);
  await assertOwnedDocuments(userId, normalizedDocIds, isAdmin);

  return ChatSession.create({
    userId,
    title: title || "New chat",
    documentIds: normalizedDocIds,
  });
}

async function addDocumentsToChat(
  chatId,
  documentIds = [],
  userId,
  isAdmin = false,
) {
  const chat = await getOwnedChat(chatId, userId, isAdmin);
  const normalizedDocIds = parseObjectIdList(documentIds);
  await assertOwnedDocuments(userId, normalizedDocIds, isAdmin);

  const merged = new Set(chat.documentIds.map((id) => id.toString()));
  normalizedDocIds.forEach((id) => merged.add(id.toString()));
  chat.documentIds = [...merged].map((id) => new mongoose.Types.ObjectId(id));
  await chat.save();

  return chat;
}

function buildContextChunks(chunks) {
  if (!chunks.length) return "No relevant context found.";

  return chunks
    .map(
      (chunk, idx) =>
        `[Snippet ${idx + 1}] Doc:${chunk.documentId.toString()} File:${
          chunk.filename || "unknown"
        }\n${chunk.content}`,
    )
    .join("\n\n");
}

async function sendMessage(chatId, userMessage, userId, isAdmin = false) {
  if (!userMessage || !userMessage.trim()) {
    throw new AppError("message is required", 400);
  }

  const chat = await getOwnedChat(chatId, userId, isAdmin);
  await ensureHasCredits(userId);

  const [linkedDocuments, recentMessages] = await Promise.all([
    Document.find(
      {
        _id: { $in: chat.documentIds },
        status: "ready",
        openAiVectorStoreId: { $exists: true, $ne: null },
      },
      { _id: 1, originalName: 1, openAiVectorStoreId: 1 },
    ).lean(),
    Message.find({ chatId }).sort({ createdAt: -1 }).limit(8).lean(),
  ]);

  if (!linkedDocuments.length) {
    throw new AppError(
      "No vector-indexed documents are attached to this chat. Upload or attach ready documents first.",
      400,
    );
  }

  const relevantChunks = await getTopRelevantChunks({
    documents: linkedDocuments,
    query: userMessage,
    topK: 6,
  });

  const contextBlock = buildContextChunks(relevantChunks);
  const history = recentMessages.reverse().map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const systemPrompt = [
    "You are a document QA assistant.",
    "Answer ONLY from provided context snippets whenever possible.",
    "If answer is not in context, clearly say it is not found in uploaded documents.",
    "Be concise and accurate.",
  ].join(" ");

  const { content: aiAnswer, usage } = await createChatCompletion([
    { role: "system", content: systemPrompt },
    ...history,
    {
      role: "user",
      content: `Context snippets:\n${contextBlock}\n\nQuestion:\n${userMessage}`,
    },
  ]);

  const charge = await chargeUsage({
    userId,
    chatId: chat._id,
    model: env.openAiChatModel,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
  });

  const citations = relevantChunks.map((chunk) => ({
    documentId: chunk.documentId,
  }));

  const [savedUser, savedAssistant] = await Promise.all([
    Message.create({
      chatId: chat._id,
      role: "user",
      content: userMessage.trim(),
    }),
    Message.create({
      chatId: chat._id,
      role: "assistant",
      content: aiAnswer,
      citations,
    }),
  ]);

  return {
    chat,
    userMessage: savedUser,
    assistantMessage: savedAssistant,
    usage: {
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      creditsCharged: charge.creditsCharged,
      balanceAfter: charge.user.creditBalance,
    },
  };
}

async function getChatMessages(
  chatId,
  { page = 1, limit = 50 },
  userId,
  isAdmin = false,
) {
  const chat = await getOwnedChat(chatId, userId, isAdmin);
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Message.find({ chatId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Message.countDocuments({ chatId }),
  ]);

  return {
    chat: chat.toObject ? chat.toObject() : chat,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

module.exports = {
  createChatSession,
  addDocumentsToChat,
  sendMessage,
  getChatMessages,
};
