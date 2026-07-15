import type { ApiDocument } from "@/lib/api/types";

export type UiDocStatus = "processed" | "processing" | "failed";

export interface UiDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: UiDocStatus;
  chunkCount: number;
  processingError?: string | null;
}

export function toUiDocument(doc: ApiDocument): UiDocument {
  const status: UiDocStatus =
    doc.status === "ready"
      ? "processed"
      : doc.status === "failed"
        ? "failed"
        : "processing";

  return {
    id: doc._id,
    name: doc.originalName,
    size: doc.sizeBytes,
    type: doc.extension.replace(".", "").toUpperCase(),
    uploadedAt: doc.createdAt,
    status,
    chunkCount: doc.chunkCount,
    processingError: doc.processingError,
  };
}
