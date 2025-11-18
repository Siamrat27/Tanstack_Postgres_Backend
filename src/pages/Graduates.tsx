// /src/pages/Graduates.tsx
import * as React from "react";
import { useDiplomas } from "@/api/diplomas";
import Table, { Column } from "@/components/Table";

type Diploma = {
  id: number;
  faculty_code: string;
  major_th: string;
  degree_th: string;
};

export function GraduatesPage() {
  const { data, isLoading, isError, error, refetch } = useDiplomas();

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="inline-block rounded-lg border border-rose-100 bg-white px-3 py-2 shadow-sm">
          กำลังโหลดข้อมูล…
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

  const diplomas: Diploma[] = data?.data ?? [];

  const columns: Column<Diploma>[] = [
    { header: "ID", accessor: "id", width: "100px", align: "left" },
    { header: "คณะ (Code)", accessor: "faculty_code", width: "140px" },
    { header: "สาขา (TH)", accessor: "major_th" },
    { header: "ปริญญา (TH)", accessor: "degree_th" },
  ];

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">Graduates</h1>
      <p className="mt-2 text-slate-600">
        ข้อมูล Diploma ตามสิทธิ์ของคุณ:{" "}
        <strong>{diplomas.length.toLocaleString()}</strong> รายการ
      </p>

      <div className="mt-4">
        <Table<Diploma>
          data={diplomas}
          columns={columns}
          rowKey="id"
          striped
          stickyHeader
          empty={
            <div className="text-slate-600">
              ไม่พบข้อมูล Diploma (สำหรับสิทธิ์ของคุณ)
            </div>
          }
        />
      </div>
    </div>
  );
}
