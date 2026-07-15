# DocFlow Frontend (Next.js)

Next.js app integrated with the Node/Express/Mongo backend in the parent folder.

## Backend Integration

The following pages are now connected to live APIs:

- `/documents`
  - Upload files (`POST /api/documents/upload`)
  - List documents (`GET /api/documents`)
- `/conversation`
  - List ready documents
  - Create chat session (`POST /api/chats`)
  - Send message (`POST /api/chats/:chatId/messages`)

## Folder Structure

Core integration modules:

- `lib/api/client.ts` - shared API request helper
- `lib/api/types.ts` - API response/request types
- `lib/api/documents.ts` - document endpoints
- `lib/api/chats.ts` - chat endpoints
- `lib/document-mappers.ts` - backend-to-UI data mapping

UI pages using the APIs:

- `app/documents/page.tsx`
- `app/conversation/page.tsx`

## Environment

Create `.env.local` from `.env.example`:

```bash
copy .env.example .env.local
```

Set:

- `NEXT_PUBLIC_DOC_API_BASE_URL=http://localhost:5000`

## Run

```bash
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
