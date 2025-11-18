// src/api/auth.ts
export type StaffLoginRequest = {
  username: string;
  password: string;
};

export type StaffLoginResponse = {
  token: string;
  // add more fields if your backend returns them
};

export async function staffLogin(
  variables: StaffLoginRequest,
  opts?: { signal?: AbortSignal }
): Promise<StaffLoginResponse> {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variables),
    signal: opts?.signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || "Login failed");
  }
  return data as StaffLoginResponse;
}
