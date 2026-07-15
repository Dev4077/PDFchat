import { apiRequest } from "./client";

export interface CreditPack {
  _id: string;
  name: string;
  priceCents: number;
  credits: number;
  active: boolean;
  sortOrder: number;
}

export interface UsageEvent {
  _id: string;
  userId: string;
  chatId?: string | null;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  creditsCharged: number;
  balanceAfter: number;
  createdAt: string;
}

export interface Purchase {
  _id: string;
  userId: string;
  packId?: { _id: string; name: string } | string | null;
  credits: number;
  amountCents: number;
  provider: "superadmin";
  status: string;
  note?: string | null;
  createdAt: string;
}

export async function getPacks() {
  return apiRequest<{ success: boolean; items: CreditPack[] }>(
    "/api/billing/packs",
    { method: "GET", auth: false },
  );
}

export async function getBalance() {
  return apiRequest<{
    success: boolean;
    data: {
      creditBalance: number;
      creditsPer1kTokens: number;
      usage: UsageEvent[];
      purchases: Purchase[];
    };
  }>("/api/billing/balance", { method: "GET" });
}
