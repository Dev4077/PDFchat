const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sop_ai",
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiChatModel: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
  openAiEmbeddingModel:
    process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 25),
  chunkSize: Number(process.env.CHUNK_SIZE || 1200),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP || 200),
  openAiVectorSearchMaxResults: Number(
    process.env.OPENAI_VECTOR_SEARCH_MAX_RESULTS || 6,
  ),
  openAiVectorStoreExpiresDays: Number(
    process.env.OPENAI_VECTOR_STORE_EXPIRES_DAYS || 30,
  ),
  jwtSecret: process.env.JWT_SECRET || "dev-jwt-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  // Prefer SUPERADMIN_EMAIL; ADMIN_EMAIL kept as alias for existing .env files
  superadminEmail: (
    process.env.SUPERADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    ""
  )
    .toLowerCase()
    .trim(),
  creditsPer1kTokens: Number(process.env.CREDITS_PER_1K_TOKENS || 1),
};

module.exports = { env };
