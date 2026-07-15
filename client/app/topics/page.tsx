"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Plus, Pencil, Trash2, BookOpen, FileText, Search, X, Check, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  docCount: number;
  createdAt: string;
}

const COLORS = [
  "bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500",
  "bg-red-500", "bg-pink-500", "bg-indigo-500", "bg-teal-500",
];

const INITIAL_TOPICS: Topic[] = [
  { id: "1", name: "Finance", description: "Financial reports, budgets, and accounting documents", color: "bg-blue-500", docCount: 14, createdAt: "Dec 10, 2024" },
  { id: "2", name: "Human Resources", description: "Employee policies, contracts, and HR guidelines", color: "bg-purple-500", docCount: 8, createdAt: "Dec 8, 2024" },
  { id: "3", name: "Product", description: "Product roadmaps, specifications, and release notes", color: "bg-green-500", docCount: 11, createdAt: "Dec 5, 2024" },
  { id: "4", name: "Legal", description: "Legal agreements, compliance documents, and contracts", color: "bg-orange-500", docCount: 6, createdAt: "Dec 3, 2024" },
  { id: "5", name: "Marketing", description: "Campaign plans, brand guidelines, and marketing content", color: "bg-red-500", docCount: 9, createdAt: "Dec 1, 2024" },
  { id: "6", name: "Research", description: "Market research, customer surveys, and industry analysis", color: "bg-pink-500", docCount: 5, createdAt: "Nov 28, 2024" },
];

interface ModalProps {
  topic?: Topic | null;
  onSave: (data: { name: string; description: string; color: string }) => void;
  onClose: () => void;
}

function TopicModal({ topic, onSave, onClose }: ModalProps) {
  const [name, setName] = useState(topic?.name || "");
  const [desc, setDesc] = useState(topic?.description || "");
  const [color, setColor] = useState(topic?.color || COLORS[0]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{topic ? "Edit Topic" : "Create New Topic"}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="label">Topic name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance, Legal, HR…" className="input" autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="What types of documents belong in this topic?" rows={3}
              className="input resize-none" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)}
                  className={cn("w-8 h-8 rounded-full transition-transform hover:scale-110", c,
                    color === c && "ring-2 ring-offset-2 ring-gray-400 scale-110")}>
                  {color === c && <Check className="w-4 h-4 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{name || "Topic Name"}</p>
              <p className="text-xs text-gray-400">{desc || "Topic description"}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => { if (name.trim()) { onSave({ name, description: desc, color }); } }}
            disabled={!name.trim()}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {topic ? "Save changes" : "Create topic"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (data: { name: string; description: string; color: string }) => {
    if (modal === "create") {
      setTopics((prev) => [...prev, {
        ...data, id: String(Date.now()), docCount: 0, createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      }]);
    } else if (editing) {
      setTopics((prev) => prev.map((t) => t.id === editing.id ? { ...t, ...data } : t));
    }
    setModal(null);
    setEditing(null);
  };

  return (
    <AppLayout title="Topics" subtitle={`${topics.length} topics total`}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search topics…" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
          </div>
          <button onClick={() => setModal("create")} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Topic
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No topics found</p>
            <p className="text-gray-400 text-sm mt-1">Create a topic to start organizing your documents</p>
            <button onClick={() => setModal("create")} className="btn-primary mx-auto mt-4 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Topic
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((topic) => (
              <div key={topic.id} className="card p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", topic.color)}>
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(topic); setModal("edit"); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteId(topic.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{topic.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{topic.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{topic.docCount} documents</span>
                  </div>
                  <span>Created {topic.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(modal === "create" || modal === "edit") && (
        <TopicModal
          topic={modal === "edit" ? editing : null}
          onSave={handleSave}
          onClose={() => { setModal(null); setEditing(null); }}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">Delete topic?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This will remove the topic. Documents assigned to it won&apos;t be deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => { setTopics((p) => p.filter((t) => t.id !== deleteId)); setDeleteId(null); }}
                className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
