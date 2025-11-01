// /src/lib/authFetch.ts

/**
 * Enhanced fetch ที่:
 * 1) แนบ Bearer token อัตโนมัติ (ยกเว้นตั้งค่า skipAuth)
 * 2) auto-parse ตาม Content-Type (json/text/blob) + รองรับ 204
 * 3) ถ้า 401 → เคลียร์ token + redirect ไป /login (กัน redirect ซ้ำ)
 * 4) เก็บ path ปัจจุบันไว้เพื่อเด้งกลับหลังล็อกอิน
 */

export const AUTH_TOKEN_KEY = "authToken";
const LOGIN_PATH = "/";

let isRedirectingToLogin = false;

type AuthFetchOptions = RequestInit & {
  /** ไม่แนบ Authorization header */
  skipAuth?: boolean;
  /** บังคับชนิดการ parse; ถ้าไม่กำหนดจะ auto จาก Content-Type */
  parseAs?: "json" | "text" | "blob" | "none";
};

function shouldSetJsonContentType(body: unknown, headers: Headers) {
  if (headers.has("Content-Type")) return false;
  if (body == null) return false;
  // หลีกเลี่ยงการตั้ง header เองถ้าเป็น FormData/Blob/ArrayBuffer/URLSearchParams
  if (typeof FormData !== "undefined" && body instanceof FormData) return false;
  if (typeof Blob !== "undefined" && body instanceof Blob) return false;
  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer)
    return false;
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams)
    return false;
  return true;
}

function rememberRedirectTarget() {
  try {
    const target =
      window.location.pathname + window.location.search + window.location.hash;
    sessionStorage.setItem("postLoginRedirect", target);
  } catch {}
}

export async function authFetch<T = unknown>(
  url: string,
  options: AuthFetchOptions = {}
): Promise<T> {
  const { skipAuth, parseAs, ...fetchOptions } = options;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = new Headers(fetchOptions.headers);

  // ตั้งค่า Content-Type เฉพาะกรณีที่เหมาะสม
  if (shouldSetJsonContentType(fetchOptions.body, headers)) {
    headers.set("Content-Type", "application/json");
  }

  // แนบ Authorization header
  if (!skipAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  // จัดการ 401
  if (res.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true;
      rememberRedirectTarget();
      window.location.assign(LOGIN_PATH);
    }
    throw new Error("Session expired. Please log in again.");
  }

  // จัดการ error อื่น ๆ
  if (!res.ok) {
    let message = "API request failed";
    try {
      const ct = res.headers.get("Content-Type") || "";
      if (ct.includes("application/json")) {
        const data = await res.json();
        message = data?.error || data?.message || message;
      } else {
        const text = await res.text();
        message = text || message;
      }
    } catch {}
    throw new Error(message);
  }

  // สำเร็จ → parse ตาม Content-Type หรือ parseAs
  if (parseAs === "none" || res.status === 204) {
    return undefined as unknown as T;
  }
  if (parseAs === "blob") {
    return (await res.blob()) as unknown as T;
  }
  if (parseAs === "text") {
    return (await res.text()) as unknown as T;
  }

  const ct = res.headers.get("Content-Type") || "";
  if (ct.includes("application/json")) {
    return (await res.json()) as T;
  }
  if (ct.startsWith("text/")) {
    return (await res.text()) as unknown as T;
  }
  // fallback เป็น blob
  return (await res.blob()) as unknown as T;
}

/** Helpers */
export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}
export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}
export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * NOTE: โปรดักชันจริงควรพิจารณาใช้ HttpOnly Secure SameSite cookies แทน localStorage
 * เพื่อลดความเสี่ยงจาก XSS + จัดการ CSRF ตามเหมาะสม
 */
