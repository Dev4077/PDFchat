import { getToken, clearSession } from "../auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_DOC_API_BASE_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  json?: unknown;
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { json, headers, auth = true, ...restOptions } = options;

  const finalHeaders = new Headers(headers || {});
  const hasBody = typeof json !== "undefined";
  if (hasBody && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) {
      finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: finalHeaders,
    body: hasBody ? JSON.stringify(json) : restOptions.body,
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; details?: unknown; success?: boolean }
    | null;

  if (response.status === 401 && auth) {
    clearSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
      window.location.href = "/auth/login";
    }
  }

  if (!response.ok) {
    const errorMessage = payload?.message || `Request failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export { API_BASE_URL };
