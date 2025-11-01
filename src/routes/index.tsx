import { createFileRoute, redirect } from "@tanstack/react-router";

function hasToken() {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("authToken");
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (hasToken()) {
      throw redirect({ to: "/dashboard" });
    }
    throw redirect({ to: "/login" });
  },
  component: () => <div style={{ padding: 16 }}>Loading…</div>,
});
