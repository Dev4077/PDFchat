"use client";
import AppLayout from "@/components/layout/AppLayout";
import { FileText, BookOpen, MessageSquare, TrendingUp, Upload, Clock, ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total Documents", value: "48", change: "+12%", icon: FileText, color: "bg-blue-50 text-blue-600" },
  { label: "Active Topics", value: "12", change: "+3", icon: BookOpen, color: "bg-purple-50 text-purple-600" },
  { label: "Conversations", value: "127", change: "+24%", icon: MessageSquare, color: "bg-green-50 text-green-600" },
  { label: "Insights Generated", value: "89", change: "+18%", icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
];

const recentDocs = [
  { name: "Q4 Financial Report.pdf", size: "2.4 MB", topic: "Finance", date: "2 hours ago", status: "processed" },
  { name: "Product Roadmap 2025.docx", size: "1.1 MB", topic: "Product", date: "5 hours ago", status: "processed" },
  { name: "Legal Agreement Draft.pdf", size: "0.8 MB", topic: "Legal", date: "1 day ago", status: "processing" },
  { name: "HR Policy Manual.pdf", size: "3.2 MB", topic: "HR", date: "2 days ago", status: "processed" },
];

const recentConversations = [
  { doc: "Q4 Financial Report.pdf", msg: "What are the key revenue drivers?", time: "1h ago" },
  { doc: "Product Roadmap 2025.docx", msg: "Summarize Q1 goals", time: "3h ago" },
  { doc: "Legal Agreement Draft.pdf", msg: "What are the termination clauses?", time: "6h ago" },
];

const statusStyle: Record<string, string> = {
  processed: "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
};

export default function DashboardPage() {
  return (
    <AppLayout title="Dashboard" subtitle="Welcome back, John — here's what's happening">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, change, icon: Icon, color }) => (
            <div key={label} className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="card p-5 border-2 border-dashed border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Upload a document</p>
                <p className="text-sm text-gray-500">PDF, DOCX, TXT — up to 50MB per file</p>
              </div>
            </div>
            <Link href="/documents" className="btn-primary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Now
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900 text-sm">Recent Documents</h2>
              </div>
              <Link href="/documents" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentDocs.map((doc) => (
                <div key={doc.name} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.size} · {doc.date}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{doc.topic}</span>
                  <span className={`badge ${statusStyle[doc.status]}`}>{doc.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-gray-900 text-sm">Recent Conversations</h2>
              </div>
              <Link href="/conversation" className="text-xs text-brand-600 hover:text-brand-700 font-medium">View all</Link>
            </div>
            <div className="p-4 space-y-3">
              {recentConversations.map((c, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <p className="text-xs text-gray-400 mb-1 truncate">{c.doc}</p>
                  <p className="text-sm text-gray-700 font-medium">&ldquo;{c.msg}&rdquo;</p>
                  <p className="text-xs text-gray-400 mt-1">{c.time}</p>
                </div>
              ))}
              <Link href="/conversation" className="block text-center text-xs text-brand-600 hover:text-brand-700 font-medium py-1">
                Start new conversation →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
