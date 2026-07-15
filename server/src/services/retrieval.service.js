const { env } = require("../config/env");
const { searchOpenAiVectorStore } = require("./ai.service");

async function getTopRelevantChunks({ documents, query, topK = 6 }) {
  if (!documents.length) return [];

  const perDocumentLimit = Math.max(
    1,
    Math.ceil(env.openAiVectorSearchMaxResults / documents.length),
  );

  const responses = await Promise.all(
    documents
      .filter((doc) => doc.openAiVectorStoreId)
      .map(async (doc) => {
        const results = await searchOpenAiVectorStore({
          vectorStoreId: doc.openAiVectorStoreId,
          query,
          maxResults: Math.max(1, perDocumentLimit),
        });

        return results.map((item) => ({
          documentId: doc._id,
          fileId: item.file_id,
          filename: item.filename || doc.originalName,
          content: (item.content || []).map((entry) => entry.text).join("\n"),
          score: item.score || 0,
        }));
      }),
  );

  return responses
    .flat()
    .filter((item) => item.content)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

module.exports = { getTopRelevantChunks };
