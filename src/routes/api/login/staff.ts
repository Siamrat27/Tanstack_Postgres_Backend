// /api/login.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const Route = createFileRoute("/api/login/staff")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json();
        const { username, password } = body;

        // --- 2. ตรวจสอบข้อมูลที่ส่งมา ---
        if (!username || !password) {
          return new Response(JSON.stringify({
            success: false,
            error: "Username and password are required",
          }), {
            status: 400, // 400 Bad Request
            headers: { "Content-Type": "application/json" },
          });
        }

        // --- 3. ค้นหา User ---
        const user = await prisma.user.findUnique({
          where: { username: username },
        });

        // ถ้าไม่เจอ user หรือ user ไม่มี hash (เช่น สมัครแบบเก่า)
        if (!user || !user.password_hash) {
          return new Response(JSON.stringify({
            success: false,
            error: "Invalid username or password",
          }), {
            status: 401, // 401 Unauthorized
            headers: { "Content-Type": "application/json" },
          });
        }

        // --- 4. เปรียบเทียบรหัสผ่าน ---
        const isMatch = await bcrypt.compare(password, user.password_hash);

        // ถ้ารหัสผ่านไม่ตรง
        if (!isMatch) {
          return new Response(JSON.stringify({
            success: false,
            error: "Invalid username or password",
          }), {
            status: 401, // 401 Unauthorized
            headers: { "Content-Type": "application/json" },
          });
        }

        // --- 5. Login สำเร็จ: สร้าง JWT Token ---
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // console.error("JWT_SECRET is not defined in .env file");
            return new Response(JSON.stringify({
                success: false,
                error: "Server configuration error",
            }), { status: 500 });
        }
        
        // ข้อมูลที่เราจะเก็บใน Token
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role, // <-- field 'role' จาก schema ของคุณ
        };

        // Token มีอายุ 1 hour
        const token = jwt.sign(payload, secret, { expiresIn: '1h' });

        // --- 6. ส่ง Token กลับไปให้ Client ---
        return new Response(JSON.stringify({
          success: true,
          token: token,
          user: payload // (ส่งข้อมูล user กลับไปด้วยเผื่อ frontend ต้องใช้)
        }), {
          status: 200, 
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});