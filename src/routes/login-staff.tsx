// /routes/login-staff.tsx
import { createFileRoute } from '@tanstack/react-router';
// 1. "ตัวเชื่อม" ทำการ import "หน้าเว็บ"
import { StaffLoginPage } from '@/pages/StaffLoginPage';

// 2. บอก Router ว่าถ้ามีคนมาที่ URL /login-staff
// ให้แสดง Component ที่ชื่อ StaffLoginPage
export const Route = createFileRoute('/login-staff')({
  component: StaffLoginPage,
});