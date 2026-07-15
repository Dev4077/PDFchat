"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { RequireSuperadmin } from "@/components/auth/RequireAuth";
import {
  adminCreatePack,
  adminListPacks,
  adminUpdatePack,
} from "@/lib/api/admin";
import type { CreditPack } from "@/lib/api/billing";

const emptyForm = {
  name: "",
  priceCents: "900",
  credits: "1000",
  sortOrder: "0",
};

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListPacks();
      setPacks(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load packs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminCreatePack({
        name: form.name,
        priceCents: Number(form.priceCents),
        credits: Number(form.credits),
        sortOrder: Number(form.sortOrder) || 0,
        active: true,
      });
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (pack: CreditPack) => {
    try {
      await adminUpdatePack(pack._id, { active: !pack.active });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <RequireSuperadmin>
      <AppLayout title="Superadmin — Packs" subtitle="Credit pack catalog for demos">
        <div className="max-w-4xl space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form
            onSubmit={create}
            className="rounded-xl border border-gray-200 bg-white p-5 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              className="input"
              placeholder="Pack name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              placeholder="Price (cents)"
              value={form.priceCents}
              onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
              required
            />
            <input
              className="input"
              type="number"
              placeholder="Credits"
              value={form.credits}
              onChange={(e) => setForm({ ...form, credits: e.target.value })}
              required
            />
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? "Saving..." : "Add pack"}
            </button>
          </form>

          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                )}
                {packs.map((pack) => (
                  <tr key={pack._id} className="border-t border-gray-50">
                    <td className="px-4 py-3 font-medium">{pack.name}</td>
                    <td className="px-4 py-3">
                      ${(pack.priceCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      {pack.credits.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          pack.active
                            ? "text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs"
                            : "text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-xs"
                        }
                      >
                        {pack.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleActive(pack)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        {pack.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AppLayout>
    </RequireSuperadmin>
  );
}
