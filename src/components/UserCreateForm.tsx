// src/components/UserCreateForm.tsx
import * as React from "react";
import { TextField, PasswordField } from "@/components/TextField";
import Dropdown from "@/components/Dropdown";
import Button from "@/components/Button";

export type UserCreateFormState = {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  faculty_code: string;
  can_manage_undergrad_level: boolean;
  can_manage_graduate_level: boolean;
};

type UserCreateFormProps = {
  form: UserCreateFormState;
  setForm: React.Dispatch<React.SetStateAction<UserCreateFormState>>;
  canEdit: boolean;
  isSubmitting: boolean;
  onRequestSubmit: () => void;
};

export default function UserCreateForm({
  form,
  setForm,
  canEdit,
  isSubmitting,
  onRequestSubmit,
}: UserCreateFormProps) {
  const canSubmit =
    canEdit &&
    !isSubmitting &&
    form.username.trim().length > 0 &&
    form.password.trim().length > 0;

  const isSupervisor = form.role.toLowerCase() === "supervisor";
  const canTogglePermissions = canEdit && !isSubmitting && !isSupervisor;

  return (
    <div className="mt-4 rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-900">สร้างผู้ใช้ใหม่</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TextField
          id="create-username"
          label="ชื่อผู้ใช้"
          value={form.username}
          onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
          brandColor="#E4007E"
        />

        <PasswordField
          id="create-password"
          label="รหัสผ่าน"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          brandColor="#E4007E"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TextField
          id="create-first-name"
          label="ชื่อ"
          value={form.first_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, first_name: e.target.value }))
          }
          brandColor="#E4007E"
        />
        <TextField
          id="create-last-name"
          label="นามสกุล"
          value={form.last_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, last_name: e.target.value }))
          }
          brandColor="#E4007E"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Dropdown
          id="create-role"
          label="Role"
          value={form.role}
          onChange={(e) => {
            const nextRole = e.target.value;
            setForm((f) => {
              const base = { ...f, role: nextRole };
              // ถ้าเปลี่ยนกลับเป็น Supervisor → เคลียร์สิทธิ์ให้ false ทั้งคู่
              if (nextRole.toLowerCase() === "supervisor") {
                return {
                  ...base,
                  can_manage_undergrad_level: false,
                  can_manage_graduate_level: false,
                };
              }
              return base;
            });
          }}
          brandColor="#E4007E"
          options={[
            { value: "Supervisor", label: "Supervisor" },
            { value: "Professor", label: "Professor" },
          ]}
        />

        <TextField
          id="create-faculty"
          label="คณะ (code)"
          value={form.faculty_code}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              faculty_code: e.target.value,
            }))
          }
          brandColor="#E4007E"
        />
      </div>

      {/* สิทธิ์การจัดการระดับต่าง ๆ */}
      <div className="mt-3 flex flex-col gap-2">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.can_manage_undergrad_level}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                can_manage_undergrad_level: e.target.checked,
              }))
            }
            disabled={!canTogglePermissions}
          />
          <span>สามารถจัดการบัณฑิตตรี (can_manage_undergrad_level)</span>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.can_manage_graduate_level}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                can_manage_graduate_level: e.target.checked,
              }))
            }
            disabled={!canTogglePermissions}
          />
          <span>สามารถจัดการบัณฑิตโท-เอก (can_manage_graduate_level)</span>
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={onRequestSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
        >
          สร้างผู้ใช้
        </Button>
      </div>
    </div>
  );
}
