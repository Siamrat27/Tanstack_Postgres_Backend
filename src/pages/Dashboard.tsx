import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/lib/authFetch";

type Diploma = {
  id: number;
  faculty_code: string;
  major_th: string;
  degree_th: string;
  // ใส่ field เพิ่มเติมได้ เช่น grad_year, honor, order_no ฯลฯ
};

type DiplomasResponse = {
  success: boolean;
  data: Diploma[];
};

async function fetchDiplomas(): Promise<DiplomasResponse> {
  return authFetch<DiplomasResponse>("/api/diplomas");
}

export function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["diplomas"],
    queryFn: fetchDiplomas,
    staleTime: 60_000,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          กำลังโหลดข้อมูล…
        </div>
      </div>
    );
  }

  if (isError) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return (
      <div style={{ padding: 20, color: "red" }}>
        เกิดข้อผิดพลาด: {msg}
        <button onClick={() => refetch()} style={{ marginLeft: 8 }}>
          ลองใหม่
        </button>
      </div>
    );
  }

  const diplomas = data?.data ?? [];

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ marginBottom: 16 }}>
        คุณล็อกอินสำเร็จ นี่คือข้อมูล Diploma (ตามสิทธิ์ของคุณ):{" "}
        <strong>{diplomas.length.toLocaleString()}</strong> รายการ
      </p>

      {diplomas.length === 0 ? (
        <div
          style={{
            padding: 12,
            border: "1px dashed #ddd",
            borderRadius: 8,
            background: "#fcfcfc",
          }}
        >
          ไม่พบข้อมูล Diploma (สำหรับสิทธิ์ของคุณ)
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            border={1}
            cellPadding={8}
            style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}
          >
            <thead style={{ background: "#f7f7f7" }}>
              <tr>
                <th align="left">ID</th>
                <th align="left">คณะ (Code)</th>
                <th align="left">สาขา (TH)</th>
                <th align="left">ปริญญา (TH)</th>
              </tr>
            </thead>
            <tbody>
              {diplomas.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.faculty_code}</td>
                  <td>{d.major_th}</td>
                  <td>{d.degree_th}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
