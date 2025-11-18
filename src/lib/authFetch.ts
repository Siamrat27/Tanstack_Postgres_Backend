// /src/lib/authFetch.ts
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("authToken");
  } catch {}
}

type AuthFetchOptions = RequestInit & {
  /** ถ้า true จะเคลียร์ token + เด้ง /login เมื่อ 401 (default: false) */
  redirectOn401?: boolean;
  /** ถ้า redirectOn401=true, silent401=true จะไม่เด้งอัตโนมัติ (แต่จะยัง clear token) */
  silent401?: boolean;
};

export async function authFetch<T = any>(
  url: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  const isServer = typeof window === "undefined";
  const token = getAuthToken();

  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // DEFAULT: ไม่ redirect อัตโนมัติ
    if (!isServer && options.redirectOn401) {
      clearAuthToken();
      if (!options.silent401) {
        window.location.href = "/login";
      }
    }
    // โยน error ให้ caller จัดการเอง
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let msg = `API request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  return (
    ct.includes("application/json") ? res.json() : res.text()
  ) as Promise<T>;
}
