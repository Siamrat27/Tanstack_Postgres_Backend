// /src/components/Navbar.tsx
import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

type JwtUser = {
  username?: string;
  role?: "Admin" | "Supervisor" | string;
  faculty_code?: string | null;
};

const NAV_LINKS: { to: string; label: string; roles?: string[] }[] = [
  { to: "/dashboard", label: "ภาพรวม" },
  {
    to: "/graduates",
    label: "รายชื่่อบัณฑิต",
    roles: ["admin", "Supervisor"],
  },
  { to: "/schedules", label: "บัณฑิตซ้อมนอกรอบ" },
  { to: "/settings", label: "ปรับตั้งค่า", roles: ["supervisor", "admin"] }, // CHANGED
];

// Chula palette
const CHULA_PINK = "#E4007E";
const CHULA_PINK_DARK = "#B0005C";

const isBrowser = typeof window !== "undefined";

function safeGetToken(): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem("authToken");
  } catch {
    return null;
  }
}
function safeClearToken() {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem("authToken");
  } catch {}
}

function decodeJwtUser(token: string | null): JwtUser | null {
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const [open, setOpen] = React.useState(false);

  // Disable auth-dependent behavior on login routes
  const isAuthDisabled =
    location.pathname === "/" || location.pathname.startsWith("/login");

  // Read token only on client when auth is enabled
  const [token, setToken] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!isAuthDisabled) setToken(safeGetToken());
  }, [isAuthDisabled]);

  // Sync token across tabs
  React.useEffect(() => {
    if (!isBrowser || isAuthDisabled) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === "authToken") setToken(safeGetToken());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isAuthDisabled]);

  const user = React.useMemo(() => decodeJwtUser(token), [token]);

  function isActive(to: string) {
    if (to === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(to);
  }

  const visibleLinks =
    token && !isAuthDisabled
      ? NAV_LINKS.filter((l) =>
          l.roles ? (user?.role ? l.roles.includes(user.role) : false) : true
        )
      : [];

  const onLogout = () => {
    safeClearToken();
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md shadow-[0_1px_0_0_rgba(228,0,126,0.15)]">
      {/* Brand accent line */}
      <div
        aria-hidden
        className="h-0.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK}, ${CHULA_PINK})`,
        }}
      />
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:px-4">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <MenuIcon className="h-5 w-5 text-rose-700" />
          </button>

          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-md px-1 py-1 no-underline"
            title="Chula Ceremony Console"
          >
            {/* Use your logo image here */}
            <img
              src="/logo.png"
              alt="Chulalongkorn University"
              className="h-7 w-auto rounded-sm"
            />
            <div className="leading-tight">
              <span
                className="block text-[15px] font-extrabold"
                style={{ color: CHULA_PINK_DARK }}
              >
                CHULA
              </span>
              <span className="block -mt-0.5 text-xs font-medium text-rose-700/80">
                Ceremony Console
              </span>
            </div>
          </Link>
        </div>

        {/* Center: links (desktop) */}
        <ul className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <li key={l.to}>
                <Link
                  to={l.to as any}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative rounded-lg px-3 py-2 text-sm font-medium transition",
                    active
                      ? "text-white shadow-sm"
                      : "text-rose-800 hover:bg-rose-50",
                  ].join(" ")}
                  style={
                    active
                      ? {
                          background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK})`,
                        }
                      : undefined
                  }
                >
                  {l.label}
                  {/* active underline highlight */}
                  {active ? (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-2 -bottom-[6px] h-[3px] rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK})`,
                        opacity: 0.7,
                      }}
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right: auth/menu */}
        <div className="flex items-center gap-2">
          {isAuthDisabled || !token ? (
            // Hide the login button if already on '/' or '/login'
            location.pathname === "/" ||
            location.pathname.startsWith("/login") ? null : (
              <Link
                to="/"
                className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold transition"
                style={{
                  borderColor: `${CHULA_PINK}33`,
                  color: CHULA_PINK_DARK,
                }}
              >
                เข้าสู่ระบบ
              </Link>
            )
          ) : (
            <UserMenu user={user} onLogout={onLogout} />
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={[
          "md:hidden transition-[max-height] duration-300 overflow-hidden border-t",
          open ? "max-h-80" : "max-h-0",
        ].join(" ")}
        style={{ borderColor: `${CHULA_PINK}26` }}
      >
        <ul className="px-3 py-2">
          {visibleLinks.map((l) => {
            const active = isActive(l.to);
            return (
              <li key={l.to}>
                <Link
                  to={l.to as any}
                  onClick={() => setOpen(false)}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm font-medium transition",
                    active ? "text-white" : "text-rose-900 hover:bg-rose-50",
                  ].join(" ")}
                  style={
                    active
                      ? {
                          background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK})`,
                        }
                      : undefined
                  }
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          {!isAuthDisabled && token ? (
            <button
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK})`,
              }}
            >
              ออกจากระบบ
            </button>
          ) : null}
        </ul>
      </div>
    </header>
  );
}

/* ----------------- Small UI bits ----------------- */

function UserMenu({
  user,
  onLogout,
}: {
  user: JwtUser | null;
  onLogout: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const label = user?.username ?? "User";
  const role = user?.role ?? "guest";
  const faculty = user?.faculty_code;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2"
        style={{ borderColor: `${CHULA_PINK}33`, color: CHULA_PINK_DARK }}
        aria-expanded={open}
      >
        <Avatar seed={label} />
        <span className="max-w-[9rem] truncate">{label}</span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border bg-white shadow-lg"
          style={{ borderColor: `${CHULA_PINK}26` }}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 text-xs text-slate-500">
            ลงชื่อเข้าใช้ในระบบ
          </div>
          <div className="px-3 pb-2">
            <div className="text-sm font-semibold text-slate-800">{label}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
              <RoleBadge role={role} />
              {faculty ? (
                <span className="rounded bg-rose-50 px-1.5 py-0.5">
                  คณะ {faculty}
                </span>
              ) : null}
            </div>
          </div>
          <div
            className="border-t"
            style={{ borderColor: `${CHULA_PINK}26` }}
          />
          <button
            onClick={onLogout}
            className="block w-full px-4 py-2 text-left text-sm transition hover:bg-rose-50"
            style={{ color: CHULA_PINK_DARK }}
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: "bg-emerald-100 text-emerald-700",
    registry: "bg-sky-100 text-sky-700",
    faculty: "bg-violet-100 text-violet-700",
    helpdesk: "bg-amber-100 text-amber-800",
    staff: "bg-rose-100 text-rose-700",
    guest: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${map[role] ?? map["staff"]}`}
    >
      {role}
    </span>
  );
}

function Avatar({ seed }: { seed: string }) {
  const initials = seed
    .split(/[.\s_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <span
      className="inline-flex h-6 w-6 select-none items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ background: CHULA_PINK }}
    >
      {initials || "U"}
    </span>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </svg>
  );
}
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
