import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardPage } from "@/pages/Dashboard";
import { getAuthToken } from "@/lib/authFetch";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ location }) => {
    const token = getAuthToken();
    if (!token) {
      const redirectTo =
        location.pathname +
        (location.search ? "?" + location.search : "") +
        (location.hash ?? "");

      throw redirect({
        to: "/",
        search: { redirect: redirectTo },
      });
    }
  },
  component: DashboardPage,
});
