import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

// 1. ฟังก์ชันสำหรับเรียก API
// นี่คือส่วนที่ 'fetch' ข้อมูลจาก Backend '/api/login'
async function staffLoginApi(variables: { username: string, password: string }) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables),
  });

  const data = await res.json();

  if (!res.ok) {
    // ถ้า API ส่ง error กลับมา (เช่น 401 "Invalid credentials")
    // ให้โยน Error ออกไปเพื่อให้ 'onError' ของ mutation ทำงาน
    throw new Error(data.error || 'Login failed');
  }

  // ถ้าสำเร็จ, ส่งข้อมูล (ที่มี token) กลับไป
  return data; // { success: true, token: "...", user: {...} }
}


// 2. นี่คือ Component "หน้าเว็บ" ของคุณ
export function StaffLoginPage() {
  const navigate = useNavigate(); // Hook สำหรับการเปลี่ยนหน้า (redirect)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3. ตั้งค่า useMutation เพื่อจัดการการ Login
  const mutation = useMutation({
    mutationFn: staffLoginApi, // 3a. ใช้ฟังก์ชัน API ที่เราสร้าง
    
    // 3b. เมื่อ Login สำเร็จ (onSuccess)
    onSuccess: (data) => {
      console.log('Login successful!', data);

      // (สำคัญ!) เก็บ Token ที่ได้มาไว้ใน localStorage
      localStorage.setItem('authToken', data.token);

      // ส่งต่อไปยังหน้า Dashboard ของ Admin
      // (คุณต้องสร้างหน้านี้เอง เช่น /routes/admin-dashboard.tsx)
      navigate({ to: '/admin-dashboard' });
    },
    
    // 3c. เมื่อ Login ล้มเหลว (onError)
    onError: (error) => {
      // แสดง Error ที่ได้จาก API (เช่น "Invalid credentials")
      setErrorMessage(error.message);
    },
  });

  // 4. เมื่อกดปุ่ม Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันหน้าเว็บ Refresh
    setErrorMessage(null); // ล้าง Error เก่า
    // สั่งให้ mutation ทำงาน (โดยส่ง username/password ไป)
    mutation.mutate({ username, password });
  };

  // 5. นี่คือหน้าตา (HTML/JSX) ที่จะแสดงผล
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '40px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center' }}>Staff / Admin Login</h2>
      <p style={{ textAlign: 'center', color: '#555' }}>(สำหรับอาจารย์และเจ้าหน้าที่)</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Username:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        {/* 6. แสดง Error ถ้ามี */}
        {errorMessage && (
          <p style={{ color: 'red', textAlign: 'center' }}>
            {errorMessage}
          </p>
        )}

        <button 
          type="submit" 
          disabled={mutation.isPending} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: mutation.isPending ? '#999' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          {mutation.isPending ? 'กำลังล็อกอิน...' : 'Login'}
        </button>
      </form>
    </div>
  );
}