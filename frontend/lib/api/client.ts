// Keep both names during the deployment transition. Docker Compose supplies
// NEXT_PUBLIC_API_URL, while older local environments used API_BASE_URL.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export type ApiError = {
  status?: number;
  error?: string;
  message?: string;
  data?: unknown;
};

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  } as Record<string, string>;

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const error = new Error(payload?.message || payload?.error || response.statusText) as Error & { status?: number; data?: unknown };
    error.status = response.status;
    error.data = payload;
    throw error;
  }

  return payload as T;
}
