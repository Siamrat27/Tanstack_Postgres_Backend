// /src/routes/settings.users.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { SettingsUsersPage } from "@/pages/SettingsUsers";

function hasToken(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("authToken");
  } catch {
    return false;
  }
}

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

export const Route = createFileRoute("/settings/users")({
  beforeLoad: ({ location }) => {
    if (!hasToken()) {
      // send back to login, then come back here
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname } as any,
      });
    }
    const role = readRoleLc();
    // ✅ allow BOTH admin and supervisor
    if (!(role === "admin" || role === "supervisor")) {
      throw redirect({ to: "/settings" });
    }
  },
  component: SettingsUsersPage,
});
