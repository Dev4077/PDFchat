"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { getBalance, type Purchase, type UsageEvent } from "@/lib/api/billing";
import { useAuth } from "@/components/auth/AuthProvider";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function AccountPage() {
  const { refreshUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [rate, setRate] = useState(1);
  const [usage, setUsage] = useState<UsageEvent[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBalance()
      .then((res) => {
        setBalance(res.data.creditBalance);
        setRate(res.data.creditsPer1kTokens);
        setUsage(res.data.usage);
        setPurchases(res.data.purchases);
        void refreshUser();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [refreshUser]);

  return (
    <AppLayout title="Account" subtitle="Balance, token usage, and credit grants">
      <div className="max-w-5xl mx-auto space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Credit balance</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {loading ? "…" : balance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm text-gray-500">Rate</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {rate} / 1k tokens
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Need more?</p>
              <p className="text-sm text-gray-700 mt-1">Ask a superadmin</p>
            </div>
            <Link href="/pricing" className="btn-primary text-sm px-4 py-2">
              View packs
            </Link>
          </div>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent usage</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tokens consumed and credits charged per chat turn
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Prompt</th>
                  <th className="px-5 py-3 font-medium">Completion</th>
                  <th className="px-5 py-3 font-medium">Total tokens</th>
                  <th className="px-5 py-3 font-medium">Credits</th>
                  <th className="px-5 py-3 font-medium">Balance after</th>
                </tr>
              </thead>
              <tbody>
                {usage.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                      No usage yet
                    </td>
                  </tr>
                )}
                {usage.map((row) => (
                  <tr key={row._id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-gray-600">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-3">{row.promptTokens.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      {row.completionTokens.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {row.totalTokens.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-brand-600 font-medium">
                      −{row.creditsCharged}
                    </td>
                    <td className="px-5 py-3">{row.balanceAfter.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Credit grants</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Credits assigned or adjusted by a superadmin
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium">Credits</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {purchases.length === 0 && !loading && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      No purchases yet
                    </td>
                  </tr>
                )}
                {purchases.map((row) => (
                  <tr key={row._id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-gray-600">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-3 capitalize">{row.provider}</td>
                    <td className="px-5 py-3 font-medium">
                      {row.credits > 0 ? "+" : ""}
                      {row.credits.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      {row.amountCents
                        ? `$${(row.amountCents / 100).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {row.note ||
                        (typeof row.packId === "object" && row.packId
                          ? row.packId.name
                          : "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
