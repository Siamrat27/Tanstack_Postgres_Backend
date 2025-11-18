import * as React from "react";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import type { QueryClient } from "@tanstack/react-query";

import Navbar from "../components/Navbar";

interface MyRouterContext {
  queryClient: QueryClient;
}

function decodeJwtPayload(token: string): any | null {
  try {
    const [, p] = token.split(".");
    if (!p) return null;
    let b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function getTokenSafe(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

function buildClientRedirectString(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function NotFoundView() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border border-rose-100 bg-white/90 p-8 text-center shadow-sm">
        <h1 className="text-3xl font-extrabold text-rose-700">
          ไม่พบหน้านี้ (404)
        </h1>
        <p className="mt-2 text-slate-600">
          ลิงก์อาจหมดอายุ ถูกย้าย หรือพิมพ์ไม่ถูกต้อง
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-700"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}

function RootError({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด";
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="text-xl font-bold">เกิดข้อผิดพลาด</h2>
        <p className="mt-1">{message}</p>
        <div className="mt-4">
          <Link
            to="/"
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700"
          >
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    </div>
  );
}

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}

function ClientAuthGate() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  // หน้า public ที่ไม่ต้องมี token
  const isPublic = React.useMemo(() => {
    const p = location.pathname;
    return p === "/" || p.startsWith("/login");
  }, [location.pathname]);

  // กฎ role ต่อ path
  const ROLE_RULES = React.useMemo(
    () => [
      { pattern: /^\/settings\/users(\/|$)/, roles: ["supervisor"] },
      { pattern: /^\/settings(\/|$)/, roles: ["supervisor"] },
      {
        pattern: /^\/graduates(\/|$)/,
        roles: ["supervisor", "professor"],
      },
    ],
    []
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (isPublic) return;

    const token = getTokenSafe();

    if (!token) {
      const redirectTo = buildClientRedirectString();
      navigate({
        to: "/login",
        search: { redirect: redirectTo } as any,
        replace: true,
      });
      return;
    }

    // ตรวจหมดอายุถ้ามี exp
    const payload = decodeJwtPayload(token);
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload?.exp && Number(payload.exp) < nowSec) {
      try {
        localStorage.removeItem("authToken");
      } catch {}
      const redirectTo = buildClientRedirectString();
      navigate({
        to: "/login",
        search: { redirect: redirectTo } as any,
        replace: true,
      });
      return;
    }

    // ตรวจ role เฉพาะ path ที่มีกฎ
    const rule = ROLE_RULES.find((r) => r.pattern.test(location.pathname));
    if (rule) {
      const roleLc = String(payload?.role ?? "").toLowerCase();
      if (!rule.roles.includes(roleLc)) {
        navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [
    location.pathname,
    location.search,
    location.hash,
    isPublic,
    navigate,
    ROLE_RULES,
  ]);

  return null;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "พิธีพระราชทานปริญญาบัตร" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  notFoundComponent: NotFoundView,
  errorComponent: RootError,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full text-slate-800 antialiased">
        {/* BG */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat bg-fixed"
        />
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-white/70 backdrop-blur-[2px]"
        />

        <ClientAuthGate />

        <Navbar />

        <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
          {children}
        </main>

        <ClientOnly>
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        </ClientOnly>

        <Scripts />
      </body>
    </html>
  );
}
