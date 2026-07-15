"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { getPacks, type CreditPack } from "@/lib/api/billing";
import { useAuth } from "@/components/auth/AuthProvider";
import { isSuperadmin } from "@/lib/auth";
import Link from "next/link";

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function PricingPage() {
  const { user, refreshUser } = useAuth();
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void refreshUser();
    getPacks()
      .then((res) => setPacks(res.items))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load packs"),
      )
      .finally(() => setLoading(false));
  }, [refreshUser]);

  return (
    <AppLayout
      title="Credit packs"
      subtitle="1 credit ≈ 1,000 tokens — ask a superadmin to assign credits"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {user && (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-gray-500">Your balance</p>
              <p className="text-2xl font-semibold text-gray-900">
                {user.creditBalance.toLocaleString()} credits
              </p>
            </div>
            <p className="text-sm text-gray-500 max-w-md sm:text-right">
              Demo mode: payments are off. A superadmin grants or updates your
              credits from the admin panel.
            </p>
          </div>
        )}

        {isSuperadmin(user) && (
          <div className="rounded-lg bg-brand-50 text-brand-800 text-sm px-4 py-3 flex items-center justify-between gap-3">
            <span>You can manage user credits and packs.</span>
            <Link href="/admin" className="btn-primary text-sm px-3 py-1.5">
              Open Superadmin
            </Link>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm">Loading packs...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packs.map((pack) => (
              <div
                key={pack._id}
                className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col"
              >
                <h2 className="text-lg font-semibold text-gray-900">{pack.name}</h2>
                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {formatPrice(pack.priceCents)}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {pack.credits.toLocaleString()} credits
                </p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 flex-1">
                  <li>~{(pack.credits * 1000).toLocaleString()} tokens</li>
                  <li>Never expires</li>
                  <li>Assigned by superadmin</li>
                </ul>
                <p className="mt-6 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
                  Contact superadmin to activate this pack
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
