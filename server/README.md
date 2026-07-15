# SOP AI Document Chat Backend

Scalable Node.js + Express + MongoDB backend for:

- Uploading `.pdf`, `.doc`, `.docx`, `.txt`
- Indexing documents in **OpenAI Vector Store**
- Chatting with context retrieved from OpenAI vector search

## 1) Setup

```bash
npm install
copy .env.example .env
```

Fill `.env` values:

- `MONGODB_URI`
- `OPENAI_API_KEY`
- `OPENAI_VECTOR_SEARCH_MAX_RESULTS`

## 2) Run

```bash
npm run dev
```

Base URL: `http://localhost:5000/api`

## Vector DB Mode (OpenAI Vector Store)

This backend uses **OpenAI Vector Store** as the vector database.

How it works:

1. On upload, server creates an OpenAI vector store for that document.
2. File is uploaded and indexed using `vectorStores.files.uploadAndPoll`.
3. In chat, relevant snippets are fetched via `vectorStores.search`.
4. LLM answer is generated from retrieved snippets.

## 3) API Endpoints

### Health

- `GET /api/health`

### Documents

- `POST /api/documents/upload`
  - form-data key: `file`
- `GET /api/documents?page=1&limit=20`

### Chats

- `POST /api/chats`
  - body:
    ```json
    {
      "title": "SOP discussion",
      "documentIds": ["<documentId>"]
    }
    ```
- `PATCH /api/chats/:chatId/documents`
  - body:
    ```json
    {
      "documentIds": ["<documentId>", "<documentId2>"]
    }
    ```
- `POST /api/chats/:chatId/messages`
  - body:
    ```json
    {
      "message": "What does the SOP say about escalation?"
    }
    ```
- `GET /api/chats/:chatId/messages?page=1&limit=50`

## Architecture

`controllers -> services -> models` with isolated modules for:

- OpenAI vector ingestion + chat (`ai.service.js`)
- vector retrieval orchestration (`retrieval.service.js`)

This keeps the system easy to scale (queue workers, vector DB, auth, tenancy) without changing API shape.

## Postman

Import:

- `postman/SOP_AI.postman_collection.json`
