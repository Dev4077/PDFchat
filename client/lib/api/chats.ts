import { apiRequest } from "./client";
import type {
  CreateChatResponse,
  ListMessagesResponse,
  SendMessageResponse,
} from "./types";

export async function createChatSession(documentId: string, title?: string) {
  return apiRequest<CreateChatResponse>("/api/chats", {
    method: "POST",
    json: {
      title: title || "Document Chat",
      documentIds: [documentId],
    },
  });
}

export async function sendChatMessage(chatId: string, message: string) {
  return apiRequest<SendMessageResponse>(`/api/chats/${chatId}/messages`, {
    method: "POST",
    json: { message },
  });
}

export async function getChatMessages(chatId: string, page = 1, limit = 100) {
  return apiRequest<ListMessagesResponse>(
    `/api/chats/${chatId}/messages?page=${page}&limit=${limit}`,
    { method: "GET", cache: "no-store" },
  );
}
