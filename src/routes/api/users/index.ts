// /routes/api/users.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client"; // (Import เพิ่ม)
import jwt from "jsonwebtoken";

// ------------------------------------------------------------------
async function getCurrentUser(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const decoded = jwt.verify(token, secret);
    const payload = decoded as { id: number }; 
    
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, role: true, faculty_code: true },
    });
    return user;
  } catch (error) {
    return null;
  }
}

export const Route = createFileRoute("/api/users/")({
  server: {
    handlers: {
      GET: async ({request}) => {
        try {
          const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== "Supervisor")) {
          return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 403 });
        }

        // (GET handler - แนะนำให้ select field ที่ปลอดภัย)
        const data = await prisma.user.findMany({
          orderBy: [{faculty_code: "asc"},{ id: "asc" }],
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
            faculty_code: true,
            from_cunet: true,
            can_manage_undergrad_level: true,
            can_manage_graduate_level: true,
          },
        });

        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
        } catch (error) {
          console.error("GET /api/users Error:", error);
          return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 });
        }
      },

      POST: async ({ request }) => {
        try {

          const currentUser = await getCurrentUser(request);
          if (!currentUser || (currentUser.role !== "Supervisor")) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 403 });
          }

          const body = await request.json();

          const {
            username,
            password,
            first_name,
            last_name,
            role,
            faculty_code,
            from_cunet,
            can_manage_undergrad_level,
            can_manage_graduate_level,
          } = body;

          // (การตรวจสอบ Username/Password ที่คุณทำมา... ถูกต้องแล้ว)
          if (!username || !password) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Username and password are required",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          if (role === 'Professor' && !faculty_code) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Faculty code is required for Professor role",
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          const password_hash = await bcrypt.hash(password, 10);

          // 6. สร้าง User ใหม่ (ด้วย Logic การบังคับ Role)
          const created = await prisma.user.create({
            data: {
              username: username,
              password_hash: password_hash,
              password_salt: null, // (ถ้า salt อยู่ใน hash แล้ว)
              first_name: first_name,
              last_name: last_name,
              role: role,
              
              // (Logic ที่บังคับสิทธิ์ของ Admin/Supervisor)
              faculty_code: (role === "admin" || role === "Supervisor") 
                              ? null 
                              : faculty_code,

              can_manage_undergrad_level: (role === "admin" || role === "Supervisor")
                                ? false // Admin/Supervisor ไม่ใช้สิทธิ์นี้ (เช็ค role ตรงๆ)
                                : can_manage_undergrad_level,
                                
              can_manage_graduate_level: (role === "admin" || role === "Supervisor")
                                ? false // Admin/Supervisor ไม่ใช้สิทธิ์นี้
                                : can_manage_graduate_level,
              
              from_cunet: from_cunet ?? false,
            },
            select: {
              id: true,
              username: true,
              first_name: true,
              last_name: true,
              role: true,
              faculty_code: true, // (ส่ง faculty_code กลับไปให้ยืนยัน)
            },
          });

          return new Response(
            JSON.stringify({ success: true, created: created }),
            { status: 201, headers: { "Content-Type": "application/json" } }
          );

        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002" // Unique constraint failed (Username ซ้ำ)
          ) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "This username is already taken",
              }),
              { status: 409, headers: { "Content-Type": "application/json" } }
            );
          }
          
          // Error อื่นๆ
          // console.error("POST User Error:", error);
          return new Response(
            JSON.stringify({ success: false, error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});