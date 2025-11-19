// src/pages/SettingsUsers.tsx
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import Table, { Column } from "@/components/Table";
import { useUsers, patchUser, UserRow, createUser } from "@/api/users";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import UserCreateForm, {
  UserCreateFormState,
} from "@/components/UserCreateForm";
import UserEditModal, { UserEditFormState } from "@/components/UserEditModal";
import Button from "@/components/Button";

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
    if (!p) return "";
    let b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const { role } = JSON.parse(atob(b64));
    return (role ?? "").toString().toLowerCase();
  } catch {
    return "";
  }
}

export function SettingsUsersPage() {
  const { data, isLoading, isError, error, refetch } = useUsers();
  const toast = useToast();

  const roleLc = getRoleLc();
  const canEdit = roleLc === "supervisor";

  const [busyToggle, setBusyToggle] = React.useState<string | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (vars: {
      id: number;
      field: "can_manage_graduate_level" | "can_manage_undergrad_level";
      value: boolean;
    }) => patchUser(vars.id, { [vars.field]: vars.value } as any),
    onMutate: (vars) => setBusyToggle(`${vars.id}:${vars.field}`),
    onSettled: () => setBusyToggle(null),
    onSuccess: () => {
      refetch();
      toast.success("อัปเดตสิทธิ์ผู้ใช้สำเร็จ");
    },
    onError: (err: any) => {
      toast.error(
        err?.message ?? "ไม่สามารถอัปเดตสิทธิ์ของผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง"
      );
    },
  });

  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<UserRow | null>(null);
  const [editForm, setEditForm] = React.useState<UserEditFormState>({
    username: "",
    first_name: "",
    last_name: "",
    role: "",
    faculty_code: "",
    new_password: "",
  });

  const [createForm, setCreateForm] = React.useState<UserCreateFormState>({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "Supervisor",
    faculty_code: "",
    can_manage_undergrad_level: true,
    can_manage_graduate_level: false,
  });

  const [confirmCreateOpen, setConfirmCreateOpen] = React.useState(false);
  const [confirmEditOpen, setConfirmEditOpen] = React.useState(false);

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
      toast.success("บันทึกข้อมูลผู้ใช้สำเร็จ");
    },
    onError: (err: any) => {
      toast.error(
        err?.message ?? "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง"
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        username: createForm.username.trim(),
        password: createForm.password,
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        role: createForm.role,
        faculty_code: createForm.faculty_code.trim(),
        can_manage_undergrad_level: createForm.can_manage_undergrad_level,
        can_manage_graduate_level: createForm.can_manage_graduate_level,
      };
      return createUser(payload);
    },
    onSuccess: () => {
      setCreateForm({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "Supervisor",
        faculty_code: "",
        can_manage_undergrad_level: false,
        can_manage_graduate_level: false,
      });
      refetch();
      toast.success("สร้างผู้ใช้ใหม่สำเร็จ");
    },
    onError: (err: any) => {
      toast.error(
        err?.message ??
          "ไม่สามารถสร้างผู้ใช้ใหม่ได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง"
      );
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
          const isSupervisorRole = r === "supervisor";
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
          <Button
            onClick={() => openEdit(u)}
            disabled={!canEdit}
            variant="outline"
            size="sm"
            title={canEdit ? "แก้ไขผู้ใช้" : "ต้องเป็น Admin หรือ Supervisor"}
          >
            แก้ไข
          </Button>
        ),
      },
    ];
  }, [canEdit, busyToggle, toggleMutation]);

  /* ------------------------- early returns ------------------------- */

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
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="ml-3 border-red-200 text-red-700 hover:bg-red-50"
        >
          ลองใหม่
        </Button>
      </div>
    );
  }

  const rows = data?.data ?? [];

  /* ---------------------------------- render ---------------------------------- */

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">ผู้ใช้ในระบบ</h1>

      {/* ฟอร์มสร้างผู้ใช้ใหม่ */}
      <UserCreateForm
        form={createForm}
        setForm={setCreateForm}
        canEdit={canEdit}
        isSubmitting={createMutation.isPending}
        onRequestSubmit={() => setConfirmCreateOpen(true)}
      />

      <p className="mt-2 text-slate-600">
        ข้อมูลทั้งหมด <strong>{rows.length.toLocaleString()}</strong> รายการ
      </p>

      {/* ตารางผู้ใช้ */}
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
        <Button onClick={() => refetch()} variant="outline">
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* Modal แก้ไขผู้ใช้ */}
      <UserEditModal
        open={editOpen && !!editRow}
        userId={editRow?.id}
        form={editForm}
        setForm={setEditForm}
        canEdit={canEdit}
        isSubmitting={modalMutation.isPending}
        onClose={closeEdit}
        onRequestSubmit={() => setConfirmEditOpen(true)}
      />

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmCreateOpen}
        title="ยืนยันการสร้างผู้ใช้"
        message={`คุณต้องการสร้างผู้ใช้ "${createForm.username.trim() || "ผู้ใช้ใหม่"}" ใช่หรือไม่`}
        onCancel={() => setConfirmCreateOpen(false)}
        onConfirm={() => {
          setConfirmCreateOpen(false);
          createMutation.mutate();
        }}
        loading={createMutation.isPending}
      />

      <ConfirmDialog
        open={confirmEditOpen}
        title="ยืนยันการบันทึก"
        message={`คุณต้องการบันทึกการแก้ไขผู้ใช้ "${editForm.username}" ใช่หรือไม่`}
        onCancel={() => setConfirmEditOpen(false)}
        onConfirm={() => {
          setConfirmEditOpen(false);
          modalMutation.mutate();
        }}
        loading={modalMutation.isPending}
      />
    </div>
  );
}
