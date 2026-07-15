const TOKEN_KEY = "docflow_token";
const USER_KEY = "docflow_user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "superadmin";
  creditBalance: number;
  createdAt?: string;
  updatedAt?: string;
};

export function isSuperadmin(user: AuthUser | null | undefined): boolean {
  return user?.role === "superadmin" || user?.role === "admin";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
