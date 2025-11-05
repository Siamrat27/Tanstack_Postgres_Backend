// /src/pages/SettingsUsers.tsx
import * as React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authFetch } from "@/lib/authFetch";
import bcrypt from "bcryptjs";

type UserRow = {
  id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  faculty_code: string | null;
  can_manage_undergrad_level?: boolean;
  can_manage_graduate_level?: boolean;
};

type UsersResponse = { success: boolean; data: UserRow[] };

async function fetchUsers(): Promise<UsersResponse> {
  return authFetch<UsersResponse>("/api/users");
}

function displayNameFromUsername(u: string) {
  return u
    .split(/[._-]/g)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function getRoleLc() {
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

async function patchUserApi(
  id: number,
  payload: Partial<{
    password_hash: string; // ← ใช้ hash แล้วเท่านั้น
    first_name: string | null;
    last_name: string | null;
    role: string;
    faculty_code: string | null;
    can_manage_undergrad_level: boolean;
    can_manage_graduate_level: boolean;
  }>
) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Update failed");
  return data;
}

export function SettingsUsersPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users.all"],
    queryFn: fetchUsers,
    staleTime: 60_000,
    retry: 1,
  });

  const roleLc = getRoleLc();
  const canEdit = roleLc === "admin" || roleLc === "supervisor";

  // ---------- instant toggle for booleans ----------
  const [busyToggle, setBusyToggle] = React.useState<string | null>(null);
  const toggleMutation = useMutation({
    mutationFn: (vars: {
      id: number;
      field: "can_manage_graduate_level" | "can_manage_undergrad_level";
      value: boolean;
    }) => patchUserApi(vars.id, { [vars.field]: vars.value } as any),
    onMutate: (vars) => setBusyToggle(`${vars.id}:${vars.field}`),
    onSettled: () => setBusyToggle(null),
    onSuccess: () => refetch(),
  });

  // ---------- modal edit state ----------
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<UserRow | null>(null);
  const [editForm, setEditForm] = React.useState<{
    username: string; // read-only
    first_name: string;
    last_name: string;
    role: string;
    faculty_code: string;
    new_password: string; // plain text input → bcrypt on submit
  }>({
    username: "",
    first_name: "",
    last_name: "",
    role: "Staff",
    faculty_code: "",
    new_password: "",
  });

  const modalMutation = useMutation({
    mutationFn: async () => {
      if (!editRow) return;

      const payload: any = {
        first_name: editForm.first_name ?? "",
        last_name: editForm.last_name ?? "",
        role: editForm.role ?? "",
        faculty_code: editForm.faculty_code || null,
      };

      // bcrypt only if user typed new password
      const plain = (editForm.new_password || "").trim();
      if (plain.length > 0) {
        const hash = await bcrypt.hash(plain, 10);
        payload.password_hash = hash;
      }

      return patchUserApi(editRow.id, payload);
    },
    onSuccess: () => {
      setEditOpen(false);
      setEditRow(null);
      refetch();
    },
  });

  function openEdit(row: UserRow) {
    setEditRow(row);
    setEditForm({
      username: row.username,
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      role: row.role ?? "Staff",
      faculty_code: row.faculty_code ?? "",
      new_password: "",
    });
    setEditOpen(true);
  }
  function closeEdit() {
    if (modalMutation.isPending) return;
    setEditOpen(false);
    setEditRow(null);
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="inline-block rounded-lg border border-rose-100 bg-white px-3 py-2 shadow-sm">
          กำลังโหลดผู้ใช้…
        </div>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return (
      <div className="px-4 py-6 text-red-700">
        เกิดข้อผิดพลาด: {msg}
        <button
          onClick={() => refetch()}
          className="ml-3 rounded border border-red-200 px-2 py-1 text-sm hover:bg-red-50"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  const rows = data?.data ?? [];

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">ผู้ใช้ในระบบ</h1>
      <p className="mt-2 text-slate-600">
        ทั้งหมด <strong>{rows.length.toLocaleString()}</strong> รายการ
      </p>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-lg border border-rose-100 bg-white p-4 text-slate-600 shadow-sm">
          ไม่พบผู้ใช้ในระบบ
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-rose-100 bg-white shadow-sm">
          <table className="min-w-[920px] w-full border-collapse">
            <thead className="bg-rose-50 text-left">
              <tr>
                <th className="px-3 py-2 w-14">#</th>
                <th className="px-3 py-2">ชื่อผู้ใช้</th>
                <th className="px-3 py-2">ชื่อ-นามสกุล</th>
                <th className="px-3 py-2">Supervisor</th>
                <th className="px-3 py-2">จัดการบัณฑิต โท-เอก</th>
                <th className="px-3 py-2">จัดการบัณฑิต ตรี</th>
                <th className="px-3 py-2 w-40">แก้ไข</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u, idx) => {
                const isSupervisorRole =
                  (u.role ?? "").toString().toLowerCase() === "supervisor" ||
                  (u.role ?? "").toString().toLowerCase() === "admin";

                const keyGrad = `${u.id}:can_manage_graduate_level`;
                const keyUnder = `${u.id}:can_manage_undergrad_level`;

                return (
                  <tr
                    key={u.id}
                    className="odd:bg-white even:bg-rose-50/30 align-top"
                  >
                    {/* # */}
                    <td className="px-3 py-2">{idx + 1}</td>

                    {/* ชื่อผู้ใช้ (map จาก Username) */}
                    <td className="px-3 py-2">
                      <div className="font-medium">
                        {displayNameFromUsername(u.username)}
                      </div>
                      <div className="text-xs text-slate-500">{u.username}</div>
                    </td>

                    {/* ชื่อ-นามสกุล */}
                    <td className="px-3 py-2">
                      {u.first_name ?? ""} {u.last_name ?? ""}
                    </td>

                    {/* Supervisor (✓ ถ้า role เป็น admin/supervisor) */}
                    <td className="px-3 py-2">
                      {isSupervisorRole ? "✓" : " "}
                    </td>

                    {/* จัดการบัณฑิต โท-เอก → can_manage_graduate_level */}
                    <td className="px-3 py-2">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!u.can_manage_graduate_level}
                          disabled={!canEdit || busyToggle === keyGrad}
                          onChange={(e) =>
                            toggleMutation.mutate({
                              id: u.id,
                              field: "can_manage_graduate_level",
                              value: e.currentTarget.checked,
                            })
                          }
                        />
                        <span>อนุญาต</span>
                      </label>
                    </td>

                    {/* จัดการบัณฑิต ตรี → can_manage_undergrad_level */}
                    <td className="px-3 py-2">
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={!!u.can_manage_undergrad_level}
                          disabled={!canEdit || busyToggle === keyUnder}
                          onChange={(e) =>
                            toggleMutation.mutate({
                              id: u.id,
                              field: "can_manage_undergrad_level",
                              value: e.currentTarget.checked,
                            })
                          }
                        />
                        <span>อนุญาต</span>
                      </label>
                    </td>

                    {/* แก้ไข → เปิดโมดัล */}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => openEdit(u)}
                        disabled={!canEdit}
                        className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm hover:bg-rose-50 disabled:opacity-50"
                        title={
                          canEdit
                            ? "แก้ไขผู้ใช้"
                            : "ต้องเป็น Admin หรือ Supervisor"
                        }
                      >
                        แก้ไข
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4">
        <button
          onClick={() => refetch()}
          className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm hover:bg-rose-50"
        >
          รีเฟรชข้อมูล
        </button>
      </div>

      {/* ---------- Modal ---------- */}
      {editOpen && editRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          {/* dialog */}
          <div className="relative z-10 w-full max-w-xl rounded-2xl border border-rose-100 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-rose-900">แก้ไขผู้ใช้</h2>
            <p className="text-sm text-slate-600">ID: {editRow.id}</p>

            <div className="mt-4 grid gap-3">
              {/* Username (read-only) */}
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  ชื่อผู้ใช้
                </label>
                <input
                  className="w-full cursor-not-allowed rounded-lg border border-rose-200 bg-slate-50 px-3 py-2 text-slate-500"
                  value={editForm.username}
                  disabled
                />
              </div>

              {/* First / Last name */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">
                    ชื่อ
                  </label>
                  <input
                    className="w-full rounded-lg border border-rose-200 px-3 py-2"
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, first_name: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">
                    นามสกุล
                  </label>
                  <input
                    className="w-full rounded-lg border border-rose-200 px-3 py-2"
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, last_name: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Role + Faculty */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">
                    Role
                  </label>
                  <select
                    className="w-full rounded-lg border border-rose-200 px-3 py-2"
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, role: e.target.value }))
                    }
                  >
                    <option>Supervisor</option>
                    <option>Faculty</option>
                    <option>Professor</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">
                    คณะ (code)
                  </label>
                  <input
                    className="w-full rounded-lg border border-rose-200 px-3 py-2"
                    value={editForm.faculty_code}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        faculty_code: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* New Password → bcrypt before submit */}
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-rose-200 px-3 py-2"
                  placeholder="ปล่อยว่างถ้าไม่ต้องการเปลี่ยนรหัสผ่าน"
                  value={editForm.new_password}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, new_password: e.target.value }))
                  }
                />
                <div className="mt-1 text-xs text-slate-500">
                  จะทำการเข้ารหัส (bcrypt) ทางฝั่งเบราว์เซอร์ก่อนส่งไปอัปเดต{" "}
                  <code>password_hash</code>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={closeEdit}
                disabled={modalMutation.isPending}
                className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm hover:bg-rose-50 disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => modalMutation.mutate()}
                disabled={!canEdit || modalMutation.isPending}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {modalMutation.isPending ? "กำลังบันทึก…" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
