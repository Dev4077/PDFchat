"use client";
import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Send,
  FileText,
  Bot,
  User,
  Plus,
  Sparkles,
  Paperclip,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getDocuments } from "@/lib/api/documents";
import { createChatSession, sendChatMessage } from "@/lib/api/chats";
import type { ApiDocument } from "@/lib/api/types";
import { toUiDocument } from "@/lib/document-mappers";
import { useAuth } from "@/components/auth/AuthProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "Summarize this document",
  "What are the key highlights?",
  "List all action items",
  "What risks are mentioned?",
];

export default function ConversationPage() {
  const { refreshUser } = useAuth();
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [chatId, setChatId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUsage, setLastUsage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadDocs() {
      setDocumentsLoading(true);
      setError(null);
      try {
        const response = await getDocuments(1, 200);
        setDocuments(
          response.items.filter(
            (item) => item.status === "ready" && !!item.openAiVectorStoreId,
          ),
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load documents",
        );
      } finally {
        setDocumentsLoading(false);
      }
    }

    void loadDocs();
  }, []);

  async function startConversationForDocument(documentId: string) {
    setSelectedDocId(documentId);
    setMessages([]);
    setError(null);
    setLoading(true);
    try {
      const selectedDoc = documents.find((doc) => doc._id === documentId);
      const response = await createChatSession(
        documentId,
        selectedDoc?.originalName ? `Chat - ${selectedDoc.originalName}` : undefined,
      );
      setChatId(response.data._id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to create chat session",
      );
    } finally {
      setLoading(false);
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || !selectedDocId || !chatId || loading) return;
    setError(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(chatId, text);
      const aiMsg: Message = {
        id: response.data.assistantMessage._id,
        role: "assistant",
        content: response.data.assistantMessage.content,
        timestamp: new Date(response.data.assistantMessage.createdAt),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (response.data.usage) {
        const u = response.data.usage;
        setLastUsage(
          `${u.totalTokens.toLocaleString()} tokens · −${u.creditsCharged} credit(s) · balance ${u.balanceAfter.toLocaleString()}`,
        );
        void refreshUser();
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to send message",
      );
      setMessages((prev) => prev.filter((item) => item.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const newConversation = () => {
    setMessages([]);
    setSelectedDocId("");
    setChatId("");
    setError(null);
  };

  const selectedDocument = documents.find((doc) => doc._id === selectedDocId);
  const selectedUiDoc = selectedDocument ? toUiDocument(selectedDocument) : null;

  return (
    <AppLayout title="Conversation" subtitle="Ask questions about your documents">
      <div className="flex h-[calc(100vh-8rem)] gap-5">
        <div className="w-64 flex-shrink-0 flex flex-col gap-3">
          <button onClick={newConversation}
            className="btn-primary flex items-center justify-center gap-2 w-full">
            <Plus className="w-4 h-4" /> New Conversation
          </button>
          <div className="card flex-1 p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 mb-2">Documents</p>
            <div className="space-y-1">
              {documentsLoading && (
                <div className="px-2 py-2 text-sm text-gray-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Loading...
                </div>
              )}
              {!documentsLoading &&
                documents.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => {
                      void startConversationForDocument(doc._id);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors flex items-center gap-2.5",
                      selectedDocId === doc._id
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{doc.originalName}</span>
                  </button>
                ))}
              {!documentsLoading && documents.length === 0 && (
                <div className="px-2 py-2 text-sm text-gray-400">
                  No ready documents. Upload first.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 card flex flex-col overflow-hidden">
          {!selectedDocId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-brand-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select a document to begin</h3>
              <p className="text-sm text-gray-500 max-w-sm">Choose a document from the left panel, then ask any question about its content.</p>
              <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-sm">
                {SUGGESTIONS.map((s) => (
                  <div key={s} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-500 text-left">
                    &ldquo;{s}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedDocument?.originalName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedUiDoc?.type} · {selectedUiDoc?.chunkCount ?? 0} chunks
                  </p>
                </div>
                {loading && (
                  <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
                    {error}
                  </div>
                )}
                {lastUsage && (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600">
                    Last reply: {lastUsage}
                  </div>
                )}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 mb-4">Ask anything about this document</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => { void sendMessage(s); }}
                          className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-sm text-gray-600 transition-colors border border-gray-200 hover:border-brand-200">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-3", msg.role === "user" && "justify-end")}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-brand-600 text-white rounded-tr-sm"
                        : "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                    )}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <p className={cn("text-xs mt-1.5", msg.role === "user" ? "text-brand-200" : "text-gray-400")}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1.5 items-center h-5">
                        {[0,1,2].map((i) => (
                          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-gray-100">
                <form onSubmit={(e) => { e.preventDefault(); void sendMessage(input); }}
                  className="flex gap-2 items-end">
                  <button type="button" className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage(input);
                      }
                    }}
                    placeholder="Ask a question about this document…"
                    rows={1}
                    className="flex-1 input resize-none py-2.5"
                  />
                  <button type="submit" disabled={!input.trim() || loading || !chatId}
                    className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-xs text-gray-400 text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
