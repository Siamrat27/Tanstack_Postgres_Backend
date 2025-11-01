// /src/lib/authFetch.ts

/**
 * นี่คือ 'fetch' เวอร์ชันอัปเกรด
 * 1. มันจะดึง 'authToken' จาก localStorage 
 * 2. ยัดใส่ 'Authorization: Bearer ...' Header ให้อัตโนมัติ
 * 3. ถ้า API ตอบกลับมาว่า 401 (Token หมดอายุ) มันจะเตะเรากลับไปหน้า Login
 */
export async function authFetch(url: string, options: RequestInit = {}) {
  // 1. ดึง Token
  const token = localStorage.getItem('authToken');

  // 2. สร้าง Headers (เริ่มต้น)
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 3. ถ้ามี Token, เพิ่มเข้าไปใน Header
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 4. เรียก 'fetch' ตัวจริง
  const res = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  // 5. (สำคัญ) จัดการ Token หมดอายุ
  if (res.status === 401) {
    // ถ้า API บอกว่า "Unauthorized" (มักจะแปลว่า Token หมดอายุ)
    // ลบ Token เก่าทิ้ง
    localStorage.removeItem('authToken');
    // และบังคับ Refresh กลับไปหน้า Login
    // (เราใช้ window.location.href เพราะเราอยู่นอก React Router context)
    window.location.href = '/login-staff';
    throw new Error('Session expired. Please login again.');
  }

  // 6. จัดการ Error อื่นๆ
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'API request failed');
  }

  // 7. ถ้าสำเร็จ
  return res.json();
}