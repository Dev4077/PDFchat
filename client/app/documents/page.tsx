"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Upload,
  FileText,
  File,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { cn, formatDate, formatFileSize } from "@/lib/utils";
import { getDocuments, uploadDocument } from "@/lib/api/documents";
import type { ApiDocument } from "@/lib/api/types";
import { toUiDocument, type UiDocStatus } from "@/lib/document-mappers";

const statusConfig: Record<
  UiDocStatus,
  { icon: React.ComponentType<{ className?: string }>; label: string; style: string }
> = {
  processed: { icon: CheckCircle, label: "Processed", style: "text-green-600 bg-green-50" },
  processing: { icon: Clock, label: "Processing", style: "text-yellow-600 bg-yellow-50" },
  failed: { icon: AlertCircle, label: "Failed", style: "text-red-600 bg-red-50" },
};

const fileTypeColor: Record<string, string> = {
  PDF: "bg-red-100 text-red-600",
  DOCX: "bg-blue-100 text-blue-600",
  PPTX: "bg-orange-100 text-orange-600",
  TXT: "bg-gray-100 text-gray-600",
};

export default function DocumentsPage() {
  const [docs, setDocs] = useState<ApiDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UiDocStatus>("all");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uiDocs = useMemo(() => docs.map(toUiDocument), [docs]);

  const filtered = uiDocs.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function loadDocuments() {
    setLoading(true);
    setError(null);
    try {
      const response = await getDocuments(1, 200);
      setDocs(response.items);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to fetch documents",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDocuments();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file);
      }
      await loadDocuments();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to upload file(s)",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout title="Documents" subtitle={`${docs.length} documents in server`}>
      <div className="space-y-5">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
            isDragging ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-brand-300 hover:bg-gray-50"
          )}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => {
              void handleFiles(e.target.files);
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
              isDragging ? "bg-brand-100" : "bg-gray-100")}>
              <Upload className={cn("w-7 h-7", isDragging ? "text-brand-600" : "text-gray-400")} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Drop files here or <span className="text-brand-600">browse</span>
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                PDF, DOC, DOCX, TXT
              </p>
            </div>
            <button type="button"
              disabled={uploading}
              className="btn-primary flex items-center gap-2 mt-1 disabled:opacity-70"
              onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
              <Plus className="w-4 h-4" />
              {uploading ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="input pl-10" />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {(["all", "processed", "processing", "failed"] as const).map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className={cn("px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  statusFilter === status ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
                {status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              void loadDocuments();
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="card p-3 text-sm text-red-600 border-red-200 bg-red-50">
            {error}
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Uploaded</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Chunks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((doc) => {
                const { icon: StatusIcon, label, style } = statusConfig[doc.status];
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-50">
                          <FileText className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", fileTypeColor[doc.type] || "bg-gray-100 text-gray-600")}>{doc.type}</span>
                            <span className="text-xs text-gray-400">{formatFileSize(doc.size)}</span>
                          </div>
                          {doc.processingError && (
                            <p className="text-xs text-red-500 mt-1">{doc.processingError}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-full font-medium">{doc.type}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">{formatDate(doc.uploadedAt)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", style)}>
                        <StatusIcon className="w-3 h-3" /> {label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-500">{doc.chunkCount}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <File className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No documents found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or upload a new document</p>
            </div>
          )}
          {loading && (
            <div className="text-center py-16">
              <RefreshCw className="w-5 h-5 text-gray-400 mx-auto mb-2 animate-spin" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
