import { createFileRoute } from '@tanstack/react-router'
import { prisma } from "@/db";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const Route = createFileRoute('/api/login/graduate')({
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
            const user = await prisma.graduate.findUnique({
                where: { student_id: username },

            });

            if (!user) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Invalid username or password1111",
                }), {
                    status: 401, // 401 Unauthorized
                    headers: { "Content-Type": "application/json" },
                });
            }
            // --- 4. เปรียบเทียบรหัสผ่าน ---
            const isMatch = user.citizen_id === password || user.passport_no === password;

            if (!isMatch) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Invalid username or password2222",
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
                    error: "Internal server error",
                }), {
                    status: 500, // 500 Internal Server Error
                    headers: { "Content-Type": "application/json" },
                });
            }

            const payload = {
                id: user.id,
                username: user.student_id,
                role: "Graduate",
            };

            const token = jwt.sign(payload, secret, { expiresIn: '8h' });

            return new Response(JSON.stringify({
                success: true,
                token,
                user: payload
            }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
            
        }
    }
  }
})
