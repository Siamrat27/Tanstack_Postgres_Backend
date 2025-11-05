import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

// --- API call (unchanged)
async function staffLoginApi(variables: {
  username: string;
  password: string;
}) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(variables),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

// Chula palette (approx.)
const CHULA_PINK = "#E4007E";
const CHULA_PINK_DARK = "#B0005C";
const CHULA_ROSE_50 = "#FFF2F7";

export default function LoginPage() {
  const navigate = useNavigate();

  const [tab, setTab] = React.useState<"student" | "staff">("staff");
  const [lang, setLang] = React.useState<"th" | "en">("th");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: staffLoginApi,
    onSuccess: (data) => {
      if (data?.token) localStorage.setItem("authToken", data.token);
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (err: any) => setErrorMessage(err?.message ?? "Login error"),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    mutation.mutate({ username, password });
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-white">
      {/* Brand gradient background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            `radial-gradient(1200px 600px at -10% -10%, ${CHULA_PINK}18 0%, transparent 60%),` +
            `radial-gradient(900px 500px at 110% -10%, ${CHULA_PINK_DARK}18 0%, transparent 60%),` +
            `linear-gradient(0deg, #fff, #fff)`,
        }}
      />
      {/* Top brand bar */}
      <div
        className="absolute inset-x-0 top-0 h-1 -z-10"
        style={{
          background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK}, ${CHULA_PINK})`,
        }}
      />

      <div className="mx-auto max-w-7xl px-5 py-12">
        <div className="grid items-stretch gap-10 md:grid-cols-2">
          {/* Left: Brand / Info */}
          <section className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
            <div
              className="absolute right-[-80px] top-[-80px] h-56 w-56 rounded-full opacity-10"
              style={{ background: CHULA_PINK }}
            />
            <div
              className="absolute left-[-60px] bottom-[-60px] h-48 w-48 rounded-full opacity-10"
              style={{ background: CHULA_PINK_DARK }}
            />
            <div className="relative p-8">
              <div className="flex items-center justify-center gap-3">
                <ChulaCrest className="h-10 w-10" color={CHULA_PINK} />
                <div className="text-center md:text-left">
                  <h1
                    className="text-xl font-bold tracking-tight"
                    style={{ color: CHULA_PINK_DARK }}
                  >
                    จุฬาลงกรณ์มหาวิทยาลัย
                  </h1>
                  <p className="text-sm text-slate-600">
                    Chulalongkorn University
                  </p>
                </div>
              </div>

              <div className="mt-7 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-slate-900">
                  พิธีพระราชทานปริญญาบัตร
                </h2>
                <p className="mt-1 text-slate-600">ปีการศึกษา 2567</p>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                <InfoItem
                  emoji="📝"
                  title="ตอบแบบสอบถาม"
                  caption="และอัปโหลดรูปถ่ายในระบบ"
                />
                <InfoItem
                  emoji="🖨️"
                  title="พิมพ์บัตรเข้าซ้อม"
                  caption="เพื่อใช้ยืนยันตัวตน"
                />
                <InfoItem
                  emoji="🎓"
                  title="เข้าซ้อมตามรอบ"
                  caption="นำบัตรมาด้วยทุกครั้ง"
                />
              </div>

              <div
                className="mt-7 rounded-xl border px-4 py-3 text-sm"
                style={{
                  background: CHULA_ROSE_50,
                  borderColor: `${CHULA_PINK}30`,
                }}
              ></div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-sm">
            <div
              className="border-b px-6 py-5"
              style={{ borderColor: `${CHULA_PINK}20` }}
            >
              <header className="flex items-center justify-between">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: CHULA_PINK_DARK }}
                >
                  เข้าสู่ระบบ
                </h3>
                <button
                  type="button"
                  className="text-sm font-medium underline underline-offset-4 transition"
                  style={{ color: CHULA_PINK }}
                  onClick={() => setLang((v) => (v === "th" ? "en" : "th"))}
                >
                  ไทย / English
                </button>
              </header>
            </div>

            <div className="px-6 py-6">
              {/* Segmented tabs */}
              <div
                className="inline-flex rounded-2xl p-1"
                style={{
                  background: `${CHULA_PINK}10`,
                  border: `1px solid ${CHULA_PINK}20`,
                }}
              >
                <TabButton
                  active={tab === "student"}
                  onClick={() => setTab("student")}
                  activeColor={CHULA_PINK}
                >
                  บัณฑิต
                </TabButton>
                <TabButton
                  active={tab === "staff"}
                  onClick={() => setTab("staff")}
                  activeColor={CHULA_PINK}
                >
                  อาจารย์และบุคลากร
                </TabButton>
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-5">
                {/* Username */}
                <InputField
                  id="username"
                  label={tab === "student" ? "รหัสนิสิต (10 หลัก)" : "Username"}
                  placeholder={
                    tab === "student" ? "65XXXXXXXX" : "your.username"
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  inputMode={tab === "student" ? "numeric" : "text"}
                  pattern={tab === "student" ? "[0-9]{10}" : undefined}
                  maxLength={tab === "student" ? 10 : undefined}
                  brandColor={CHULA_PINK}
                  autoComplete="username"
                  required
                />

                {/* Password */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-900"
                    >
                      รหัสผ่าน
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="inline-flex select-none items-center gap-1 text-xs transition"
                      style={{ color: CHULA_PINK }}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? (
                        <>
                          <EyeOffIcon className="h-4 w-4" /> ซ่อน
                        </>
                      ) : (
                        <>
                          <EyeIcon className="h-4 w-4" /> แสดง
                        </>
                      )}
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="กรอกรหัสผ่าน"
                      className="w-full rounded-xl border bg-white px-3 py-2 pr-10 text-slate-900 outline-none transition placeholder:text-slate-400"
                      style={{
                        borderColor: `${CHULA_PINK}33`,
                        boxShadow: `0 0 0 0 rgba(0,0,0,0)`,
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.boxShadow = `0 0 0 6px ${CHULA_PINK}14`)
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.boxShadow = `0 0 0 0 rgba(0,0,0,0)`)
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <LockIcon className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Error */}
                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      color: "#B91C1C",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-xl px-4 py-2 text-white transition"
                  style={{
                    background: `linear-gradient(90deg, ${CHULA_PINK}, ${CHULA_PINK_DARK})`,
                    boxShadow: `0 8px 20px -8px ${CHULA_PINK}66`,
                  }}
                >
                  <span className="mr-2">
                    {mutation.isPending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
                  </span>
                  {mutation.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  ) : (
                    <ArrowRightIcon className="h-5 w-5 opacity-90 transition group-hover:translate-x-0.5" />
                  )}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Reusable UI ---------- */

function InputField(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    brandColor: string;
  }
) {
  const { label, brandColor, className, ...rest } = props;
  return (
    <div>
      <label
        htmlFor={props.id}
        className="mb-1.5 block text-sm font-medium text-slate-900"
      >
        {label}
      </label>
      <input
        {...rest}
        className={
          "w-full rounded-xl border bg-white px-3 py-2 text-slate-900 outline-none transition placeholder:text-slate-400 " +
          (className ?? "")
        }
        style={{ borderColor: `${brandColor}33` }}
        onFocus={(e) =>
          (e.currentTarget.style.boxShadow = `0 0 0 6px ${brandColor}14`)
        }
        onBlur={(e) =>
          (e.currentTarget.style.boxShadow = `0 0 0 0 rgba(0,0,0,0)`)
        }
      />
    </div>
  );
}

function InfoItem({
  emoji,
  title,
  caption,
}: {
  emoji: string;
  title: string;
  caption: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 text-center"
      style={{ background: "#FFF7FA", borderColor: "#FDE2ED" }}
    >
      <div className="text-3xl">{emoji}</div>
      <div className="mt-2 font-semibold" style={{ color: CHULA_PINK_DARK }}>
        {title}
      </div>
      <div className="text-xs text-slate-600">{caption}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  activeColor,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl px-4 py-2 text-sm font-semibold transition"
      style={
        active
          ? {
              background: "#fff",
              color: activeColor,
              boxShadow: "0 1px 0 rgba(0,0,0,.02)",
            }
          : { color: `${activeColor}CC` }
      }
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

/* ---------- Inline SVGs ---------- */

function ChulaCrest(props: React.SVGProps<SVGSVGElement> & { color?: string }) {
  const { color = CHULA_PINK, ...rest } = props;
  return (
    <svg viewBox="0 0 64 64" fill="none" {...rest} aria-hidden="true">
      {/* abstract crest (not official logo) */}
      <path
        d="M32 6c6 7 16 9 16 20 0 9-7 16-16 16S16 35 16 26C16 15 26 13 32 6Z"
        fill={color}
        opacity="0.25"
      />
      <circle cx="32" cy="26" r="8" stroke={color} strokeWidth="2" />
      <path
        d="M22 46h20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 52h28"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2m-9 0h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.6} />
    </svg>
  );
}
function EyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.7A3 3 0 0 0 12 15a3 3 0 0 0 3-3 3 3 0 0 0-3-3c-.5 0-1 .1-1.4.3M6.2 6.7C3.9 8.3 2 12 2 12s3.5 7 10 7c2.1 0 3.9-.5 5.4-1.3M17.8 7.3C19.5 8.3 21 10 22 12c0 0-3.5 7-10 7"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props} aria-hidden="true">
      <path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
