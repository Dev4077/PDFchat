"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { RequireSuperadmin } from "@/components/auth/RequireAuth";
import { adminListUsage } from "@/lib/api/admin";
import type { UsageEvent } from "@/lib/api/billing";

type UsageRow = UsageEvent & {
  userId: { _id: string; name: string; email: string } | string;
};

export default function AdminUsagePage() {
  const [items, setItems] = useState<UsageRow[]>([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (filterUserId = userId) => {
    setLoading(true);
    setError("");
    try {
      const res = await adminListUsage(filterUserId || undefined);
      setItems(res.items as UsageRow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load usage");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RequireSuperadmin>
      <AppLayout title="Superadmin — Usage" subtitle="Token usage across all users">
        <div className="space-y-4 max-w-6xl">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void load(userId);
            }}
          >
            <input
              className="input max-w-md"
              placeholder="Filter by user MongoDB id (optional)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4">
              Filter
            </button>
          </form>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Tokens</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium">Balance after</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No usage events
                    </td>
                  </tr>
                )}
                {items.map((row) => {
                  const populatedUser =
                    row.userId && typeof row.userId === "object"
                      ? (row.userId as { name: string; email: string })
                      : null;
                  const userLabel = populatedUser
                    ? `${populatedUser.name} (${populatedUser.email})`
                    : String(row.userId);
                  return (
                    <tr key={row._id} className="border-t border-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{userLabel}</td>
                      <td className="px-4 py-3">
                        {row.totalTokens.toLocaleString()}
                        <span className="text-xs text-gray-400 block">
                          {row.promptTokens}+{row.completionTokens}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-600">
                        −{row.creditsCharged}
                      </td>
                      <td className="px-4 py-3">
                        {row.balanceAfter.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{row.model}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    </RequireSuperadmin>
  );
}
