"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { RequireSuperadmin } from "@/components/auth/RequireAuth";
import {
  adminListUsers,
  adminListPacks,
  adminUpdateUser,
} from "@/lib/api/admin";
import type { AuthUser } from "@/lib/auth";
import type { CreditPack } from "@/lib/api/billing";
import { isSuperadmin } from "@/lib/auth";

export default function SuperadminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [packs, setPacks] = useState<CreditPack[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deltaByUser, setDeltaByUser] = useState<Record<string, string>>({});
  const [balanceByUser, setBalanceByUser] = useState<Record<string, string>>({});
  const [packByUser, setPackByUser] = useState<Record<string, string>>({});

  const load = async (query = q) => {
    setLoading(true);
    setError("");
    try {
      const [usersRes, packsRes] = await Promise.all([
        adminListUsers(query),
        adminListPacks(),
      ]);
      setUsers(usersRes.items);
      setPacks(packsRes.items.filter((p) => p.active));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adjustCredits = async (userId: string) => {
    const creditDelta = Number(deltaByUser[userId]);
    if (!Number.isFinite(creditDelta) || creditDelta === 0) {
      setError("Enter a non-zero credit amount (+/-)");
      return;
    }
    setBusyId(userId);
    setError("");
    try {
      await adminUpdateUser(userId, {
        creditDelta,
        note: "Superadmin credit adjustment",
      });
      setDeltaByUser((prev) => ({ ...prev, [userId]: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const setBalance = async (userId: string) => {
    const creditBalance = Number(balanceByUser[userId]);
    if (!Number.isFinite(creditBalance) || creditBalance < 0) {
      setError("Enter a valid balance (>= 0)");
      return;
    }
    setBusyId(userId);
    setError("");
    try {
      await adminUpdateUser(userId, {
        creditBalance,
        note: "Superadmin set balance",
      });
      setBalanceByUser((prev) => ({ ...prev, [userId]: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const assignPack = async (userId: string) => {
    const packId = packByUser[userId];
    if (!packId) {
      setError("Select a pack to assign");
      return;
    }
    setBusyId(userId);
    setError("");
    try {
      await adminUpdateUser(userId, {
        packId,
        note: "Superadmin assigned pack",
      });
      setPackByUser((prev) => ({ ...prev, [userId]: "" }));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const toggleRole = async (user: AuthUser) => {
    setBusyId(user.id);
    setError("");
    try {
      await adminUpdateUser(user.id, {
        role: isSuperadmin(user) ? "user" : "superadmin",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <RequireSuperadmin>
      <AppLayout
        title="Superadmin — Users"
        subtitle="Add / update credits and assign packs (demo)"
      >
        <div className="space-y-4 max-w-7xl">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void load(q);
            }}
          >
            <input
              className="input max-w-sm"
              placeholder="Search name or email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4">
              Search
            </button>
          </form>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Credits</th>
                  <th className="px-4 py-3 font-medium">Add / deduct</th>
                  <th className="px-4 py-3 font-medium">Set balance</th>
                  <th className="px-4 py-3 font-medium">Assign pack</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-50 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3 font-semibold">
                      {u.creditBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="input w-24"
                          placeholder="+/-"
                          value={deltaByUser[u.id] || ""}
                          onChange={(e) =>
                            setDeltaByUser((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => adjustCredits(u.id)}
                          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="input w-24"
                          placeholder="0"
                          min={0}
                          value={balanceByUser[u.id] || ""}
                          onChange={(e) =>
                            setBalanceByUser((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => setBalance(u.id)}
                          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          Set
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          className="input w-36"
                          value={packByUser[u.id] || ""}
                          onChange={(e) =>
                            setPackByUser((prev) => ({
                              ...prev,
                              [u.id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Select pack</option>
                          {packs.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.credits.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={busyId === u.id}
                          onClick={() => assignPack(u.id)}
                          className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                        >
                          Assign
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={busyId === u.id}
                        onClick={() => toggleRole(u)}
                        className="text-xs text-brand-600 hover:underline disabled:opacity-50"
                      >
                        Make {isSuperadmin(u) ? "user" : "superadmin"}
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
