// src/components/UserEditModal.tsx
import * as React from "react";
import { TextField, PasswordField } from "@/components/TextField";
import Dropdown from "@/components/Dropdown";
import Button from "@/components/Button";

export type UserEditFormState = {
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  faculty_code: string;
  new_password: string;
};

type UserEditModalProps = {
  open: boolean;
  userId?: number;
  form: UserEditFormState;
  setForm: React.Dispatch<React.SetStateAction<UserEditFormState>>;
  canEdit: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onRequestSubmit: () => void; // คลิก "บันทึก" → parent จะเปิด confirm
};

export default function UserEditModal({
  open,
  userId,
  form,
  setForm,
  canEdit,
  isSubmitting,
  onClose,
  onRequestSubmit,
}: UserEditModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* dialog */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-rose-100 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-rose-900">แก้ไขผู้ใช้</h2>
        {typeof userId !== "undefined" && (
          <p className="text-sm text-slate-600">ID: {userId}</p>
        )}

        <div className="mt-4 grid gap-3">
          {/* Username (read-only) */}
          <TextField
            id="edit-username"
            label="ชื่อผู้ใช้"
            value={form.username}
            disabled
            brandColor="#E4007E"
          />

          {/* First / Last name */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              id="edit-first-name"
              label="ชื่อ"
              value={form.first_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, first_name: e.target.value }))
              }
              brandColor="#E4007E"
            />
            <TextField
              id="edit-last-name"
              label="นามสกุล"
              value={form.last_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, last_name: e.target.value }))
              }
              brandColor="#E4007E"
            />
          </div>

          {/* Role + Faculty */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Dropdown
              id="edit-role"
              label="Role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              brandColor="#E4007E"
              options={[
                { value: "Supervisor", label: "Supervisor" },
                { value: "Professor", label: "Professor" },
              ]}
            />

            <TextField
              id="edit-faculty"
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

          <PasswordField
            id="edit-password"
            label="รหัสผ่านใหม่"
            placeholder="รหัสผ่านใหม่ (เว้นว่างไว้หากไม่เปลี่ยนแปลง)"
            value={form.new_password}
            onChange={(e) =>
              setForm((f) => ({ ...f, new_password: e.target.value }))
            }
            brandColor="#E4007E"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button onClick={onClose} disabled={isSubmitting} variant="outline">
            ยกเลิก
          </Button>
          <Button
            onClick={onRequestSubmit}
            disabled={!canEdit || isSubmitting}
            loading={isSubmitting}
          >
            บันทึก
          </Button>
        </div>
      </div>
    </div>
  );
}
