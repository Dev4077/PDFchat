# 📄 PDFChat

> AI-powered PDF Chat application built with **OpenAI API**. Upload PDF documents, ask questions in natural language, and receive intelligent answers based on your documents.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-green)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Node.js](https://img.shields.io/badge/Backend-Node.js-success)
![React](https://img.shields.io/badge/Frontend-React-61DAFB)

---

# ✨ Features

- 📄 Upload one or multiple PDF documents
- 🤖 AI-powered document chat using OpenAI
- 🔍 Semantic document search
- 💬 Multi-turn conversations
- 📚 Multiple document support
- ⚡ Fast document indexing
- 🔐 JWT Authentication
- 👥 Role-based access (User / Admin)
- 💳 Prepaid Credit System
- 📊 Token Usage Tracking
- 📈 Credit History
- 💰 Purchase Credit Packs
- 🛡️ Secure API with Bearer Authentication
- 📱 Responsive Dashboard

---

# How it Works

1. User registers or logs in.
2. Upload one or more PDF files.
3. PDFs are processed and indexed.
4. Ask questions in natural language.
5. OpenAI generates answers using the uploaded document context.
6. Token usage is calculated.
7. Credits are deducted automatically.

---

# Authentication

Authentication uses:

- Email & Password
- JWT Access Token

All protected APIs require:

```
Authorization: Bearer <JWT_TOKEN>
```

---

# User Roles

| Role | Permissions |
|-------|-------------|
| User | Upload PDFs, Chat, View Usage, Buy Packs |
| Admin | Manage Users, Credit Packs, Credit Grants, Billing |

---

# Credit System

The platform uses a **prepaid credit model**.

## Billing Unit

```
1 Credit = 1,000 OpenAI Tokens
```

Tokens include:

- Prompt Tokens
- Completion Tokens

Every chat request calculates:

```
Total Tokens = Prompt Tokens + Completion Tokens
```

Credits deducted:

```
Credits Used = ceil(Total Tokens / 1000)
```

### Example

| Prompt | Completion | Total | Credits |
|---------|------------|-------|----------|
| 450 | 300 | 750 | 1 |
| 900 | 800 | 1700 | 2 |
| 1500 | 2400 | 3900 | 4 |

---

# Credit Packs

| Pack | Price | Credits |
|------|-------|----------|
| Starter | **$9** | **1,000 Credits** |
| Pro | **$29** | **3,500 Credits** |
| Business | **$99** | **13,000 Credits** |

Credits are prepaid and deducted automatically after every chat.

---

# Account Dashboard

Users can view:

- Current Credit Balance
- Token Usage
- Credit History
- Billing Rate
- Purchased Packs
- Recent Chat Usage

Example:

```
Credit Balance

995 Credits

Rate

1 Credit = 1,000 Tokens

Recent Usage

Prompt Tokens
Completion Tokens
Total Tokens
Credits Used
Remaining Credits
```

---

# OpenAI Integration

PDFChat is powered by the OpenAI API.

Requirements:

- OpenAI API Key
- Supported GPT Models
- Token Usage API

Example:

```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

---

# Tech Stack

## Frontend

- Next/React
- TypeScript
- Tailwind CSS
- Axios

## Backend

- Node.js
- Express.js
- TypeScript
- JWT Authentication
- Multer
- OpenAI SDK

## Database

- MongoDB
- Mongoose

---

# Environment Variables

Create a `.env` file.

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

OPENAI_API_KEY=

OPENAI_MODEL=

CLIENT_URL=http://localhost:3000
```

---

# Installation

Clone the repository

```bash
git clone https://github.com/Dev4077/PDFchat.git

cd pdfchat
```

Install dependencies

```bash
npm install
```

Configure environment variables

```bash
cp .env.example .env
```

Start development server

```bash
npm run dev
```

---

# Folder Structure

```
pdfchat/

├── client/
│
├── server/
│
├── uploads/
│
├── src/
│
├── routes/
│
├── controllers/
│
├── middleware/
│
├── services/
│
├── models/
│
├── utils/
│
├── config/
│
└── README.md
```

---

# API Overview

## Authentication

```
POST /auth/register

POST /auth/login

POST /auth/logout

GET /auth/profile
```

---

## PDF

```
POST /documents/upload

GET /documents

DELETE /documents/:id
```

---

## Chat

```
POST /chat

GET /chat/history

GET /chat/:conversationId
```

---

## Billing

```
GET /account

GET /account/usage

GET /account/grants

GET /packs

POST /packs/purchase
```

---

## Admin

```
GET /admin/users

POST /admin/grant-credits

POST /admin/create-pack

PUT /admin/update-pack
```

---

# Credit Deduction Flow

```
User Sends Message
        │
        ▼
OpenAI Processes Request
        │
        ▼
Prompt Tokens
+
Completion Tokens
        │
        ▼
Total Tokens
        │
        ▼
ceil(totalTokens / 1000)
        │
        ▼
Credits Deducted
        │
        ▼
Usage Logged
        │
        ▼
Updated Balance
```

---

# Security

- JWT Authentication
- Password Hashing
- Role-Based Authorization
- Protected API Routes
- Input Validation
- Secure File Upload
- Rate Limiting
- CORS Protection

---

# Future Roadmap

- OCR Support
- DOCX Support
- Excel Support
- Team Workspaces
- Shared Knowledge Base
- Streaming Responses
- AI Summaries
- Citation References
- Vector Database Integration
- Stripe Payment Gateway
- Subscription Plans
- Usage Analytics
- Multi-language Support

---

# Screenshots

- Login
- Dashboard
- Upload PDF/Docs
- Chat Interface
- Billing
- Credit Usage
- Admin Panel

---

# Acknowledgements

- OpenAI
- React-Next
- Express
- MongoDB
- Tailwind CSS

---

# Support

For support or business inquiries, please contact the project administrator.

---