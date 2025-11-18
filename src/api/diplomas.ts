// src/api/diplomas.ts
import { authFetch } from "@/lib/authFetch";
import { useQuery, queryOptions } from "@tanstack/react-query";

// ------ types (adjust as needed)
export type Diploma = {
  id: number;
  faculty_code: string;
  major_th: string;
  degree_th: string;
};
export type DiplomasResponse = {
  success: boolean;
  data: Diploma[];
};

// ------ query keys
export const diplomasKeys = {
  all: ["diplomas"] as const,
  list: (filters?: Record<string, unknown>) =>
    ["diplomas", "list", filters ?? {}] as const,
  detail: (id: number) => ["diplomas", "detail", id] as const,
};

// ------ plain fetchers (no React here)
export async function getDiplomas(
  filters?: Record<string, unknown>,
  opts?: { signal?: AbortSignal }
): Promise<DiplomasResponse> {
  // if you add filters: build a query string here
  const url = "/api/diplomas";
  return authFetch<DiplomasResponse>(url, { signal: opts?.signal });
}

// (optional) one-by-id example to show the pattern
export async function getDiplomaById(
  id: number,
  opts?: { signal?: AbortSignal }
): Promise<{ success: boolean; data: Diploma | null }> {
  return authFetch(`/api/diplomas/${id}`, { signal: opts?.signal });
}

// ------ queryOptions factories (nice for prefetching in routes)
export const diplomasQueries = {
  list: (filters?: Record<string, unknown>) =>
    queryOptions({
      queryKey: diplomasKeys.list(filters),
      // TanStack will pass { signal } into queryFn’s ctx
      queryFn: ({ signal }) => getDiplomas(filters, { signal }),
      staleTime: 60_000,
      retry: 1,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: diplomasKeys.detail(id),
      queryFn: ({ signal }) => getDiplomaById(id, { signal }),
      staleTime: 60_000,
    }),
};

// ------ React hooks
export function useDiplomas(filters?: Record<string, unknown>) {
  return useQuery(diplomasQueries.list(filters));
}
