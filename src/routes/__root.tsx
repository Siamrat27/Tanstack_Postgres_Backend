// /src/routes/__root.tsx
import * as React from "react";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
  useNavigate, // ⬅️ add
  useRouterState, // ⬅️ add
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

/** ---------- Global Client Guard (จุดเดียวพอ) ---------- */
function ClientAuthGate() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  // หน้า public ที่ไม่ต้องมี token
  const isPublic = React.useMemo(() => {
    const p = location.pathname;
    return p === "/" || p.startsWith("/login");
  }, [location.pathname]);

  // กฎ role ราย path (แก้/เพิ่มได้ที่นี่)
  const ROLE_RULES = React.useMemo(
    () => [
      { pattern: /^\/settings\/users(\/|$)/, roles: ["admin", "supervisor"] },
      { pattern: /^\/settings(\/|$)/, roles: ["admin", "supervisor"] },
      { pattern: /^\/graduates(\/|$)/, roles: ["admin", "supervisor"] },
      // { pattern: /^\/attends(\/|$)/,     roles: [...] },
      // { pattern: /^\/schedules(\/|$)/,   roles: [...] },
    ],
    []
  );

  React.useEffect(() => {
    // client-only
    if (typeof window === "undefined") return;

    // อย่าแตะหน้า public
    if (isPublic) return;

    // อ่าน token
    let token: string | null = null;
    try {
      token = localStorage.getItem("authToken");
    } catch {}

    // ไม่มี token → ส่งไป login พร้อมจำ path ปัจจุบัน
    if (!token) {
      navigate({
        to: "/login",
        search: {
          redirect:
            location.pathname +
            (location.search ? location.search : "") +
            (location.hash ? location.hash : ""),
        } as any,
        replace: true,
      });
      return;
    }

    // decode role
    let roleLc = "";
    try {
      const [, payload] = token.split(".");
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      roleLc = (JSON.parse(json)?.role ?? "").toString().toLowerCase();
    } catch {
      // token เสียรูป → ส่งไป login
      navigate({
        to: "/login",
        search: { redirect: location.pathname } as any,
        replace: true,
      });
      return;
    }

    // ตรวจ rule เฉพาะ path ที่กำหนด
    const rule = ROLE_RULES.find((r) => r.pattern.test(location.pathname));
    if (rule && !rule.roles.includes(roleLc)) {
      // มี token แต่ role ไม่ผ่าน → ส่งกลับ dashboard
      navigate({ to: "/dashboard", replace: true });
    }
  }, [location.pathname, isPublic, navigate, ROLE_RULES]);

  return null;
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-full text-slate-800 antialiased">
        {/* พื้นหลัง */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat bg-fixed"
        />
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-white/70 backdrop-blur-[2px]"
        />

        {/* ✅ Global client-side guard */}
        <ClientAuthGate />

        <Navbar />

        <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
          {children}
        </main>

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
        <Scripts />
      </body>
    </html>
  );
}
