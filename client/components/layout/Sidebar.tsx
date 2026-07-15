"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  HelpCircle,
  MessageSquare,
  LogOut,
  Zap,
  CreditCard,
  UserCircle,
  Shield,
  Activity,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { isSuperadmin } from "@/lib/auth";

const userNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/topics", icon: BookOpen, label: "Topics" },
  { href: "/conversation", icon: MessageSquare, label: "Conversation" },
  { href: "/pricing", icon: CreditCard, label: "Pricing" },
  { href: "/account", icon: UserCircle, label: "Account" },
  { href: "/faq", icon: HelpCircle, label: "FAQ" },
];

const superadminNavItems = [
  { href: "/admin", icon: Shield, label: "Users & credits" },
  { href: "/admin/packs", icon: Package, label: "Packs" },
  { href: "/admin/usage", icon: Activity, label: "Usage" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const superadmin = isSuperadmin(user);
  const navItems = superadmin ? superadminNavItems : userNavItems;

  const initials = (user?.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 flex flex-col z-30">
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">DocFlow</p>
            <p className="text-gray-400 text-xs">
              {superadmin ? "Superadmin console" : "Document Intelligence"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {superadmin && (
          <div className="pb-1 px-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
              Superadmin
            </p>
          </div>
        )}
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/admin"
              ? pathname === "/admin"
              : pathname === href ||
                (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        {!superadmin && user && (
          <div className="px-3 mb-3">
            <div className="rounded-lg bg-gray-800 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500">
                Credits
              </p>
              <p className="text-white font-semibold text-sm">
                {user.creditBalance.toLocaleString()}
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {superadmin ? "Superadmin" : user?.email || ""}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
