// /routes/admin-dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'; // 1. Import หน้า UI

export const Route = createFileRoute('/admin-dashboard')({
  // 2. (สำคัญ!) เพิ่ม 'beforeLoad' (Client-side)
  // นี่คือ "ยาม" ที่จะทำงาน "ก่อน" ที่หน้าเว็บจะโหลด
  beforeLoad: () => {
    // 3. ตรวจสอบใน localStorage (ฝั่งเบราว์เซอร์)
    const token = localStorage.getItem('authToken');

    if (!token) {
      // 4. ถ้าไม่มี Token "เตะ" กลับไปหน้า Login
      console.log('No token found, redirecting to /login-staff');
      throw redirect({
        to: '/login-staff',
        search: {
          // (ส่ง 'redirect' ไปใน URL เผื่อหน้า Login ต้องใช้)
          redirect: '/admin-dashboard', 
        },
      });
    }
    // 5. ถ้ามี Token -> ปล่อยผ่าน
  },

  // 6. ถ้าผ่าน 'beforeLoad' มาได้, ให้แสดงผล Component นี้
  component: AdminDashboardPage,
});