// /src/pages/AdminDashboardPage.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { authFetch } from '@/lib/authFetch'; // <-- 1. Import ตัว fetch ใหม่ของเรา

// นี่คือฟังก์ชันที่จะไปดึงข้อมูล Diploma
// มันจะเรียก API Backend (diplomas.ts) ที่มี Logic การกรองสิทธิ์อยู่
const fetchDiplomas = () => {
  // 2. ใช้ authFetch (แทน fetch ธรรมดา)
  return authFetch('/api/diplomas'); 
};

export function AdminDashboardPage() {
  // 3. ใช้ useQuery เพื่อดึงข้อมูล
  const { data: diplomaData, isLoading, isError, error } = useQuery({
    queryKey: ['diplomas'], // 3a. ตั้งชื่อ Query นี้ว่า 'diplomas'
    queryFn: fetchDiplomas, // 3b. สั่งให้มันเรียกฟังก์ชัน fetchDiplomas
  });

  // 4. จัดการสถานะต่างๆ
  if (isLoading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  if (isError) {
    return <div style={{ color: 'red' }}>เกิดข้อผิดพลาด: {error.message}</div>;
  }

  // 5. ถ้าสำเร็จ: แสดงผลข้อมูล
  // (API ของเราส่งกลับมาในรูปแบบ { success: true, data: [...] })
  const diplomas = diplomaData?.data || [];

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>คุณล็อกอินสำเร็จ นี่คือข้อมูล Diploma (ตามสิทธิ์ของคุณ):</p>

      {diplomas.length === 0 ? (
        <p>ไม่พบข้อมูล Diploma (สำหรับสิทธิ์ของคุณ)</p>
      ) : (
        <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>คณะ (Code)</th>
              <th>สาขา (TH)</th>
              <th>ปริญญา (TH)</th>
            </tr>
          </thead>
          <tbody>
            {diplomas.map((diploma: any) => (
              <tr key={diploma.id}>
                <td>{diploma.id}</td>
                <td>{diploma.faculty_code}</td>
                <td>{diploma.major_th}</td>
                <td>{diploma.degree_th}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}