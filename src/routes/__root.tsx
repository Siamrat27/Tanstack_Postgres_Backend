import * as React from "react";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link, // ⬅️ add
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

// --- New: nice 404 component
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

// --- New: root error boundary (for unexpected route errors)
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
  // ⬇️ Add these two to remove the warning & improve DX
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
        {/* Background (optional; keep if you added background.png earlier) */}
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat bg-fixed"
        />
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-white/70 backdrop-blur-[2px]"
        />

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
