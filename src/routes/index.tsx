import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/")({
  component: IndexRedirector,
});

function IndexRedirector() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (token) {
      navigate({ to: "/dashboard", replace: true });
    } else {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  return <div style={{ padding: 16 }}>Loading…</div>;
}
