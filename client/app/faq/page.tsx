"use client";
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { ChevronDown, Search, HelpCircle, MessageSquare, FileText, BookOpen, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const CATEGORIES = [
  { id: "all", label: "All topics", icon: HelpCircle },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "topics", label: "Topics", icon: BookOpen },
  { id: "conversation", label: "Conversation AI", icon: MessageSquare },
  { id: "security", label: "Security", icon: Shield },
  { id: "account", label: "Account", icon: Zap },
];

const FAQS: FAQ[] = [
  {
    id: "1", category: "documents", question: "What file formats are supported for upload?",
    answer: "DocFlow supports PDF, DOCX, DOC, PPTX, PPT, TXT, and CSV files. Each file can be up to 50MB in size. We're continuously working to add support for more formats. If you need a specific format, feel free to contact our support team."
  },
  {
    id: "2", category: "documents", question: "How long does document processing take?",
    answer: "Most documents are processed within 30–60 seconds, depending on file size and complexity. Large documents with many pages may take up to 2–3 minutes. During processing, you'll see a 'Processing' status indicator. You'll receive a notification once your document is ready."
  },
  {
    id: "3", category: "documents", question: "Can I upload multiple documents at once?",
    answer: "Yes! You can upload multiple documents simultaneously by selecting multiple files in the file picker or dragging and dropping a batch of files onto the upload area. Each file will be processed independently, and you can track the progress of each upload."
  },
  {
    id: "4", category: "documents", question: "How do I organize my documents?",
    answer: "Documents can be organized using Topics — custom categories you create to group related files. Navigate to the Topics page to create, edit, or delete topics. When viewing the Documents page, you can filter by topic, search by name, and bulk-select documents for actions."
  },
  {
    id: "5", category: "topics", question: "What is a Topic and how do I create one?",
    answer: "A Topic is a custom category for organizing your documents — similar to a folder but with richer metadata. To create a topic, go to the Topics page and click 'New Topic'. Give it a name, description, and a color to help identify it at a glance."
  },
  {
    id: "6", category: "topics", question: "Can I assign a document to multiple topics?",
    answer: "Currently, each document can be assigned to one topic at a time. We're developing multi-topic tagging for a future release. In the meantime, you can use descriptive topic names and document naming conventions to manage cross-category files."
  },
  {
    id: "7", category: "topics", question: "What happens to documents when I delete a topic?",
    answer: "Deleting a topic does not delete the documents inside it. Documents will remain in your account but will be moved to 'Uncategorized'. You can then reassign them to another topic from the Documents page."
  },
  {
    id: "8", category: "conversation", question: "How does the AI conversation feature work?",
    answer: "Our AI analyzes the content of your uploaded documents and allows you to ask natural language questions about them. Select a document in the Conversation panel, then type your question. The AI will reference the document's content to provide accurate, contextual answers."
  },
  {
    id: "9", category: "conversation", question: "Can the AI summarize a document for me?",
    answer: "Absolutely! Simply select a document and type 'Summarize this document' or 'Give me the key highlights'. The AI will produce a structured summary including main points, key figures, and notable sections. You can then ask follow-up questions to dive deeper."
  },
  {
    id: "10", category: "conversation", question: "Is the AI conversation history saved?",
    answer: "Yes, conversation history is saved per document session. You can return to a previous conversation from the Conversation page. Note that each new conversation starts fresh, but past conversations remain accessible in your conversation history."
  },
  {
    id: "11", category: "security", question: "How is my data protected?",
    answer: "All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your documents are stored in isolated, access-controlled storage. We are SOC 2 Type II compliant and conduct regular third-party security audits. We never use your documents to train AI models."
  },
  {
    id: "12", category: "security", question: "Who has access to my uploaded documents?",
    answer: "Only you (and team members you explicitly invite) can access your documents. Our support team can view document metadata in limited circumstances for troubleshooting, but never document content without your explicit permission."
  },
  {
    id: "13", category: "account", question: "How do I reset my password?",
    answer: "On the login page, click 'Forgot password?' and enter your email address. You'll receive a reset link within a few minutes. The link expires after 24 hours. If you don't receive the email, check your spam folder or contact support."
  },
  {
    id: "14", category: "account", question: "Can I invite team members to my account?",
    answer: "Yes! Go to Settings > Team to invite colleagues by email. You can assign roles: Admin (full access), Editor (upload and edit), or Viewer (read-only). Team members will receive an invitation email with instructions to join."
  },
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = FAQS.filter((f) => {
    const matchSearch = f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || f.category === category;
    return matchSearch && matchCat;
  });

  return (
    <AppLayout title="FAQ" subtitle="Frequently asked questions">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search questions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setCategory(id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all",
                category === id
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              )}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <HelpCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700">No results found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term or browse all categories</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((faq) => (
              <div key={faq.id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-start gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                  <span className="flex-1 font-medium text-gray-900 text-sm leading-relaxed">{faq.question}</span>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform duration-200",
                    openId === faq.id && "rotate-180")} />
                </button>
                {openId === faq.id && (
                  <div className="px-5 pb-5 pl-[3.75rem]">
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="card p-6 text-center bg-brand-50 border-brand-100">
          <MessageSquare className="w-8 h-8 text-brand-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Still have questions?</h3>
          <p className="text-sm text-gray-500 mb-4">Can&apos;t find what you&apos;re looking for? Start a conversation or contact support.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/conversation" className="btn-primary flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4" /> Start Conversation
            </Link>
            <button className="btn-secondary text-sm">Contact Support</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
