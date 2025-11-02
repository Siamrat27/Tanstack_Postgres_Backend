// /src/routes/graduates.tsx
import { createFileRoute, redirect } from "@tanstack/react-router";
import { GraduatesPage } from "@/pages/Graduates";

function hasToken() {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("authToken");
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/graduates")({
  beforeLoad: ({ location }) => {
    if (!hasToken()) {
      const redirectTo =
        location.pathname +
        (location.search ? "?" + location.search : "") +
        (location.hash ?? "");
      throw redirect({ to: "/login", search: { redirect: redirectTo } });
    }
  },
  component: GraduatesPage,
});
