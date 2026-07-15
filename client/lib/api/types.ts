export type DocumentStatus = "processing" | "ready" | "failed";

export interface ApiDocument {
  _id: string;
  name: string;
  originalName: string;
  mimeType?: string;
  extension: string;
  sizeBytes: number;
  storagePath: string;
  openAiVectorStoreId?: string | null;
  openAiVectorFileId?: string | null;
  textLength: number;
  chunkCount: number;
  status: DocumentStatus;
  processingError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListDocumentsResponse {
  success: boolean;
  items: ApiDocument[];
  pagination: Pagination;
}

export interface UploadDocumentResponse {
  success: boolean;
  data: ApiDocument;
}

export interface ChatSession {
  _id: string;
  title: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageCitation {
  documentId: string;
  chunkOrder: number;
}

export interface ChatMessage {
  _id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  citations?: MessageCitation[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateChatResponse {
  success: boolean;
  data: ChatSession;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    chat: ChatSession;
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      creditsCharged: number;
      balanceAfter: number;
    };
  };
}

export interface ListMessagesResponse {
  success: boolean;
  chat: ChatSession;
  items: ChatMessage[];
  pagination: Pagination;
}
