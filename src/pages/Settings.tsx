// /src/pages/Settings.tsx
import * as React from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";

function decodeRole(): string {
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

export function SettingsPage() {
  const { location } = useRouterState();
  const onUsersPage = location.pathname.startsWith("/settings/users");

  const [role, setRole] = React.useState<string>("");
  React.useEffect(() => {
    setRole(decodeRole());
  }, []);
  const canEdit = role === "admin" || role === "supervisor";

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">ปรับตั้งค่า</h1>
      <p className="mt-2 text-slate-600">ตั้งค่าระบบและสิทธิ์การใช้งาน</p>

      {!onUsersPage && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {canEdit && (
            <div className="rounded-xl border border-rose-100 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">ผู้ใช้ระบบ</div>
              <div className="mt-1 font-semibold text-slate-900">
                การจัดการผู้ใช้
              </div>
              <p className="mt-2 text-sm text-slate-600">
                เพิ่ม/แก้ไข/ปิดการใช้งานผู้ใช้ และกำหนดสิทธิ์
              </p>
              <Link
                to="/settings/users"
                className="mt-4 inline-flex items-center rounded-lg px-4 py-2 text-white"
                style={{ background: "#E4007E" }}
              >
                จัดการผู้ใช้ในระบบ
              </Link>
            </div>
          )}
        </div>
      )}
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
}
