import { apiRequest } from "./client";
import type { AuthUser } from "../auth";

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
}

export interface MeResponse {
  success: boolean;
  data: AuthUser;
}

export async function register(name: string, email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    auth: false,
    json: { name, email, password },
  });
}

export async function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    json: { email, password },
  });
}

export async function fetchMe() {
  return apiRequest<MeResponse>("/api/auth/me", { method: "GET" });
}
