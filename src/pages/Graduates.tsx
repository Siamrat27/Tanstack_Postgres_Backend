// /src/pages/Graduates.tsx
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/authFetch";

type Diploma = {
  id: number;
  faculty_code: string;
  major_th: string;
  degree_th: string;
};

type DiplomasResponse = {
  success: boolean;
  data: Diploma[];
};

async function fetchDiplomas(): Promise<DiplomasResponse> {
  return authFetch<DiplomasResponse>("/api/diplomas");
}

export function GraduatesPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["diplomas"],
    queryFn: fetchDiplomas,
    staleTime: 60_000,
    retry: 1,
  });

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

  const diplomas = data?.data ?? [];

  return (
    <div className="px-4 py-6">
      <h1 className="text-2xl font-bold text-rose-900">Graduates</h1>
      <p className="mt-2 text-slate-600">
        ข้อมูล Diploma ตามสิทธิ์ของคุณ:{" "}
        <strong>{diplomas.length.toLocaleString()}</strong> รายการ
      </p>

      {diplomas.length === 0 ? (
        <div className="mt-4 rounded-lg border border-rose-100 bg-white p-4 text-slate-600 shadow-sm">
          ไม่พบข้อมูล Diploma (สำหรับสิทธิ์ของคุณ)
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-rose-100 bg-white shadow-sm">
          <table className="min-w-[640px] w-full border-collapse">
            <thead className="bg-rose-50 text-left">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">คณะ (Code)</th>
                <th className="px-3 py-2">สาขา (TH)</th>
                <th className="px-3 py-2">ปริญญา (TH)</th>
              </tr>
            </thead>
            <tbody>
              {diplomas.map((d) => (
                <tr key={d.id} className="odd:bg-white even:bg-rose-50/30">
                  <td className="px-3 py-2">{d.id}</td>
                  <td className="px-3 py-2">{d.faculty_code}</td>
                  <td className="px-3 py-2">{d.major_th}</td>
                  <td className="px-3 py-2">{d.degree_th}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
