import { apiRequest } from "./client";
import type { AuthUser } from "../auth";
import type { CreditPack, UsageEvent } from "./billing";
import type { Pagination } from "./types";

export async function adminListUsers(q = "", page = 1, limit = 50) {
  const params = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
  });
  return apiRequest<{
    success: boolean;
    items: AuthUser[];
    pagination: Pagination;
  }>(`/api/admin/users?${params}`, { method: "GET" });
}

export async function adminUpdateUser(
  id: string,
  body: {
    role?: string;
    creditDelta?: number;
    creditBalance?: number;
    packId?: string;
    note?: string;
  },
) {
  return apiRequest<{
    success: boolean;
    data: { user: AuthUser; purchase: unknown };
  }>(`/api/admin/users/${id}`, {
    method: "PATCH",
    json: body,
  });
}

export async function adminListUsage(userId?: string, page = 1, limit = 50) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (userId) params.set("userId", userId);
  return apiRequest<{
    success: boolean;
    items: Array<
      UsageEvent & {
        userId: { _id: string; name: string; email: string } | string;
      }
    >;
    pagination: Pagination;
  }>(`/api/admin/usage?${params}`, { method: "GET" });
}

export async function adminListPacks() {
  return apiRequest<{ success: boolean; items: CreditPack[] }>(
    "/api/admin/packs",
    { method: "GET" },
  );
}

export async function adminCreatePack(body: {
  name: string;
  priceCents: number;
  credits: number;
  active?: boolean;
  sortOrder?: number;
}) {
  return apiRequest<{ success: boolean; data: CreditPack }>(
    "/api/admin/packs",
    { method: "POST", json: body },
  );
}

export async function adminUpdatePack(
  id: string,
  body: Partial<{
    name: string;
    priceCents: number;
    credits: number;
    active: boolean;
    sortOrder: number;
  }>,
) {
  return apiRequest<{ success: boolean; data: CreditPack }>(
    `/api/admin/packs/${id}`,
    { method: "PATCH", json: body },
  );
}
