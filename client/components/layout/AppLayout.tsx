import Sidebar from "./Sidebar";
import Header from "./Header";
import { RequireAuth } from "@/components/auth/RequireAuth";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="pl-64">
          <Header title={title} subtitle={subtitle} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
