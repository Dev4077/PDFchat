const fs = require("fs");
const { File: NodeFile } = require("node:buffer");

if (typeof globalThis.File === "undefined") {
  globalThis.File = NodeFile;
}

const OpenAI = require("openai");
const { env } = require("../config/env");
const { AppError } = require("../utils/app-error");

if (!env.openAiApiKey) {
  // App can still boot to allow setup; requests that need AI will fail with clear message.
  // eslint-disable-next-line no-console
  console.warn("OPENAI_API_KEY is not set. AI routes will fail until configured.");
}

const openaiClient = new OpenAI({
  apiKey: env.openAiApiKey || "missing-key",
});

function ensureAiConfigured() {
  if (!env.openAiApiKey) {
    throw new AppError(
      "OPENAI_API_KEY is missing. Add it to .env before using AI APIs.",
      500,
    );
  }
}

async function createEmbedding(text) {
  ensureAiConfigured();
  const response = await openaiClient.embeddings.create({
    model: env.openAiEmbeddingModel,
    input: text,
  });
  return response.data[0].embedding;
}

async function createChatCompletion(messages) {
  ensureAiConfigured();
  const response = await openaiClient.chat.completions.create({
    model: env.openAiChatModel,
    temperature: 0.2,
    messages,
  });

  const usage = response.usage || {};
  return {
    content: response.choices[0]?.message?.content || "",
    usage: {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
    },
  };
}

async function uploadFileToOpenAiVectorStore({
  filePath,
  originalName,
  documentId,
}) {
  ensureAiConfigured();

  const vectorStore = await openaiClient.vectorStores.create({
    name: `doc-${documentId}-${originalName}`,
    expires_after: {
      anchor: "last_active_at",
      days: env.openAiVectorStoreExpiresDays,
    },
  });

  const vectorFile = await openaiClient.vectorStores.files.uploadAndPoll(
    vectorStore.id,
    fs.createReadStream(filePath),
  );

  if (vectorFile.status !== "completed") {
    throw new AppError(
      "OpenAI vector ingestion failed for uploaded document",
      500,
      { lastError: vectorFile.last_error || null },
    );
  }

  return {
    vectorStoreId: vectorStore.id,
    vectorFileId: vectorFile.id,
  };
}

async function searchOpenAiVectorStore({ vectorStoreId, query, maxResults }) {
  ensureAiConfigured();
  const response = await openaiClient.vectorStores.search(vectorStoreId, {
    query,
    max_num_results: maxResults,
  });
  return response.data || [];
}

module.exports = {
  createEmbedding,
  createChatCompletion,
  uploadFileToOpenAiVectorStore,
  searchOpenAiVectorStore,
};
