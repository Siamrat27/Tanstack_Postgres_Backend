// /src/pages/SettingsUsers.tsx
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import Table, { Column } from "@/components/Table";
import { useUsers, patchUser, UserRow } from "@/api/users";
import { TextField, PasswordField } from "@/components/TextField";
import Dropdown from "@/components/Dropdown";
/* ---------------------------- local helpers ---------------------------- */

function displayNameFromUsername(u: string) {
  return u
    .split(/[._-]/g)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

// base64url-safe decode of role (not a hook)
function getRoleLc() {
  if (typeof window === "undefined") return "";
  try {
    const t = localStorage.getItem("authToken");
    if (!t) return "";
    const [, p] = t.split(".");
    if (!p) return "";
    let b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const { role } = JSON.parse(atob(b64));
    return (role ?? "").toString().toLowerCase();
  } catch {
    return "";
  }
}

/* ------------------------------- component ------------------------------ */

export function SettingsUsersPage() {
  // 1) data
  const { data, isLoading, isError, error, refetch } = useUsers();

  // 2) auth/roles (not hooks)
  const roleLc = getRoleLc();
  const canEdit = roleLc === "admin" || roleLc === "supervisor";

  // 3) toggles
  const [busyToggle, setBusyToggle] = React.useState<string | null>(null);
  const toggleMutation = useMutation({
    mutationFn: (vars: {
      id: number;
      field: "can_manage_graduate_level" | "can_manage_undergrad_level";
      value: boolean;
    }) => patchUser(vars.id, { [vars.field]: vars.value } as any),
    onMutate: (vars) => setBusyToggle(`${vars.id}:${vars.field}`),
    onSettled: () => setBusyToggle(null),
    onSuccess: () => refetch(),
  });

  // 4) edit modal state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<UserRow | null>(null);
  const [editForm, setEditForm] = React.useState<{
    username: string;
    first_name: string;
    last_name: string;
    role: string;
    faculty_code: string;
    new_password: string;
  }>({
    username: "",
    first_name: "",
    last_name: "",
    role: "",
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
      const plain = (editForm.new_password || "").trim();
      if (plain.length > 0) payload.password = plain;
      return patchUser(editRow.id, payload);
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
      role: row.role ?? "Supervisor",
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

  // 5) columns (HOOK must be before any early return)
  const columns = React.useMemo<Column<UserRow>[]>(() => {
    return [
      {
        id: "idx",
        header: "#",
        width: "3.5rem",
        accessor: (_row, idx) => idx + 1,
        thClassName: "w-14",
      },
      {
        id: "usernameDisplay",
        header: "ชื่อผู้ใช้",
        cell: (u) => (
          <div>
            <div className="font-medium">
              {displayNameFromUsername(u.username)}
            </div>
            <div className="text-xs text-slate-500">{u.username}</div>
          </div>
        ),
      },
      {
        id: "fullname",
        header: "ชื่อ-นามสกุล",
        cell: (u) => (
          <span>
            {u.first_name ?? ""} {u.last_name ?? ""}
          </span>
        ),
      },
      {
        id: "isSupervisor",
        header: "Supervisor",
        width: "8rem",
        cell: (u) => {
          const r = String(u.role ?? "").toLowerCase();
          const isSupervisorRole = r === "supervisor" || r === "admin";
          return <span>{isSupervisorRole ? "✓" : " "}</span>;
        },
      },
      {
        id: "gradToggle",
        header: "จัดการบัณฑิต โท-เอก",
        cell: (u) => {
          const keyGrad = `${u.id}:can_manage_graduate_level`;
          return (
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
          );
        },
      },
      {
        id: "underToggle",
        header: "จัดการบัณฑิต ตรี",
        cell: (u) => {
          const keyUnder = `${u.id}:can_manage_undergrad_level`;
          return (
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
          );
        },
      },
      {
        id: "actions",
        header: "แก้ไข",
        width: "10rem",
        cell: (u) => (
          <button
            onClick={() => openEdit(u)}
            disabled={!canEdit}
            className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm hover:bg-rose-50 disabled:opacity-50"
            title={canEdit ? "แก้ไขผู้ใช้" : "ต้องเป็น Admin หรือ Supervisor"}
          >
            แก้ไข
          </button>
        ),
      },
    ];
  }, [canEdit, busyToggle, toggleMutation]);

  /* ------------------------- early returns (after hooks) ------------------------- */

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

  /* ---------------------------------- render ---------------------------------- */

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">ผู้ใช้ในระบบ</h1>
      <p className="mt-2 text-slate-600">
        ทั้งหมด <strong>{rows.length.toLocaleString()}</strong> รายการ
      </p>

      <div className="mt-4">
        <Table<UserRow>
          data={rows}
          columns={columns}
          rowKey="id"
          striped
          stickyHeader
          tableClassName="min-w-[920px] w-full border-collapse"
          empty={<div className="p-4 text-slate-600">ไม่พบผู้ใช้ในระบบ</div>}
        />
      </div>

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
              <TextField
                id="edit-username"
                label="ชื่อผู้ใช้"
                value={editForm.username}
                disabled
                brandColor="#E4007E"
              />

              {/* First / Last name */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextField
                  id="edit-first-name"
                  label="ชื่อ"
                  value={editForm.first_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, first_name: e.target.value }))
                  }
                  brandColor="#E4007E"
                />
                <TextField
                  id="edit-last-name"
                  label="นามสกุล"
                  value={editForm.last_name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, last_name: e.target.value }))
                  }
                  brandColor="#E4007E"
                />
              </div>

              {/* Role + Faculty */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Dropdown
                  id="edit-role"
                  label="Role"
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, role: e.target.value }))
                  }
                  brandColor="#E4007E"
                  options={[
                    { value: "Supervisor", label: "Supervisor" },
                    { value: "Professor", label: "Professor" },
                  ]}
                />

                <TextField
                  id="edit-faculty"
                  label="คณะ (code)"
                  value={editForm.faculty_code}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      faculty_code: e.target.value,
                    }))
                  }
                  brandColor="#E4007E"
                />
              </div>

              <PasswordField
                id="edit-password"
                label="รหัสผ่านใหม่"
                placeholder="รหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยนแปลง)"
                value={editForm.new_password}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, new_password: e.target.value }))
                }
                brandColor="#E4007E"
              />
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
