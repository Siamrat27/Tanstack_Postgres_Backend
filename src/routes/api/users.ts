// users.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
import bcrypt from "bcrypt"; // <-- 1. Import bcrypt

export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => {
        // (GET handler เหมือนเดิม)
        const data = await prisma.user.findMany({ orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      POST: async ({ request }) => {
        const body = await request.json();
        
        // --- 2. ดึงข้อมูลที่จำเป็นออกจาก body ---
        const { username, password, first_name, last_name, role } = body;

        // --- 3. ตรวจสอบข้อมูลเบื้องต้น ---
        if (!username) {
          return new Response(JSON.stringify({ 
              success: false, 
              error: "Username is required" 
          }), {
              status: 400, // 400 Bad Request
              headers: { "Content-Type": "application/json" },
          });
        }
        
        if (!password) { // <-- ตรวจสอบ password ด้วย
           return new Response(JSON.stringify({ 
              success: false, 
              error: "Password is required" 
          }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
          });
        }

        // --- 4. ตรวจสอบ Username ซ้ำ ---
        const existingUser = await prisma.user.findUnique({ // (ใช้ findUnique ดีกว่าถ้า username เป็น @unique)
          where: {
            username: username,
          },
        });

        if (existingUser) {
          return new Response(JSON.stringify({
            success: false,
            error: "This username is already taken",
          }), {
            status: 409, // 409 Conflict
            headers: { "Content-Type": "application/json" },
          });
        }

        // --- 5. เข้ารหัสรหัสผ่าน (Hashing) ---
        // (ใช้ 10-12 "rounds" เป็นมาตรฐาน)
        const password_hash = await bcrypt.hash(password, 10);

        // --- 6. สร้าง User ใหม่ (โดยระบุ field ชัดเจน) ---
        // (ห้ามใช้ data: body โดยตรง เพราะจะเก็บ password ตัวจริงลงไป)
        const created = await prisma.user.create({
          data: {
            username: username,
            password_hash: password_hash, // <-- เก็บ hash ที่เข้ารหัสแล้ว
            password_salt: null,          // <-- ไม่ต้องใช้ เพราะ salt อยู่ใน hash แล้ว
            first_name: first_name,
            last_name: last_name,
            role: role,
            // ... (ใส่ field อื่นๆ ที่รับมาจาก body ตาม schema)
          },
          // (เลือกเฉพาะ field ที่จะให้ส่งค่ากลับมา)
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
          }
        });

        // --- 7. ส่ง Response (ห้ามส่ง password_hash กลับไป) ---
        return new Response(JSON.stringify({ success: true, created: created }), {
          status: 201, // 201 Created
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});