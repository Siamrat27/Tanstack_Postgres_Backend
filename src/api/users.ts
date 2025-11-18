import { authFetch } from "@/lib/authFetch";
import { useQuery, queryOptions } from "@tanstack/react-query";

// ---------- Types ----------
export type UserRow = {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  faculty_code: string | null;
  can_manage_undergrad_level?: boolean;
  can_manage_graduate_level?: boolean;
};

export type UsersResponse = { success: boolean; data: UserRow[] };

export type UserUpdatePayload = Partial<{
  password: string; // plain text, backend will hash
  first_name: string | null;
  last_name: string | null;
  role: string;
  faculty_code: string | null;
  can_manage_undergrad_level: boolean;
  can_manage_graduate_level: boolean;
}>;

// ---------- Query Keys ----------
export const usersKeys = {
  all: ["users"] as const,
  list: () => ["users", "list"] as const,
};

// ---------- Fetchers ----------
export async function getUsers(opts?: {
  signal?: AbortSignal;
}): Promise<UsersResponse> {
  return authFetch<UsersResponse>("/api/users", { signal: opts?.signal });
}

export async function patchUser(
  id: number,
  payload: UserUpdatePayload,
  opts?: { signal?: AbortSignal }
) {
  return authFetch(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    signal: opts?.signal,
  });
}

// ---------- queryOptions + Hook ----------
export const usersQueries = {
  list: () =>
    queryOptions({
      queryKey: usersKeys.list(),
      queryFn: ({ signal }) => getUsers({ signal }),
      staleTime: 60_000,
      retry: 1,
    }),
};

export function useUsers() {
  return useQuery(usersQueries.list());
}
