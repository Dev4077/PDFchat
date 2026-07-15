import { apiRequest } from "./client";
import type {
  ListDocumentsResponse,
  UploadDocumentResponse,
} from "./types";

export async function getDocuments(page = 1, limit = 100) {
  return apiRequest<ListDocumentsResponse>(
    `/api/documents?page=${page}&limit=${limit}`,
    { method: "GET", cache: "no-store" },
  );
}

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadDocumentResponse>("/api/documents/upload", {
    method: "POST",
    body: formData,
  });
}
