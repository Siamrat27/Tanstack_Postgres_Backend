// /src/routes/settings.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SettingsPage } from "../pages/Settings";

function readRoleLc(): string {
  if (typeof window === "undefined") return "";
  try {
    const t = localStorage.getItem("authToken");
    if (!t) return "";
    const [, p] = t.split(".");
    const json = atob(p.replace(/-/g, "+").replace(/_/g, "/"));
    const { role } = JSON.parse(json);
    return (role ?? "").toString().toLowerCase();
  } catch {
    return "";
  }
}
function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("authToken");
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/settings")({
  beforeLoad: ({ location }) => {
    if (!hasToken()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href } as any,
      });
    }
    const role = readRoleLc();
    if (!(role === "admin" || role === "supervisor")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SettingsPage,
});
