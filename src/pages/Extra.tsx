// /src/pages/Dashboard.tsx
import * as React from "react";

export function SchedulesPage() {
  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">Extra</h1>
      <p className="mt-2 text-slate-600">
        ยินดีต้อนรับสู่ระบบพิธีพระราชทานปริญญาบัตร
      </p>

      {/* ใส่วิดเจ็ต/สรุปสถิติที่นี่ภายหลังได้ */}
      <div className="mt-6 rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
        <div className="text-slate-500">ยังไม่มีข้อมูลแสดงในขณะนี้</div>
      </div>
    </div>
  );
}
