// /routes/api/users/$id.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// ------------------------------------------------------------------
// (ฟังก์ชัน getCurrentUser - เหมือนเดิม, เราจะเรียกใช้บ่อยขึ้น)
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
// ------------------------------------------------------------------


export const Route = createFileRoute("/api/users/$id")({
  // (*** ลบ 'beforeLoad' ที่อยู่ระดับนี้ทิ้งไปทั้งหมด ***)

  server: {
    // (*** ลบ 'beforeLoad' ที่เคยอยู่ตรงนี้ทิ้งไปทั้งหมด ***)

    handlers: {
      // --- 1. GET Handler ---
      GET: async ({ request, params }) => {
        // vvvv (เพิ่มการตรวจสอบสิทธิ์) vvvv
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "Supervisor")) {
          return new Response(JSON.stringify({ success: false, error: "Forbidden" }), { status: 403 });
        }
        // ^^^^ (สิ้นสุดการตรวจสอบสิทธิ์) ^^^^

        const data = await prisma.user.findUnique({
          where: { id: Number(params.id) },
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            role: true,
            faculty_code: true,
            can_manage_undergrad_level: true,
            can_manage_graduate_level: true,
          }
        });
        
        if (!data) { /* ... (return 404) ... */ }
        return new Response(JSON.stringify({ success: true, data }));
      },
      
      // --- 2. PATCH Handler ---
      PATCH: async ({ request, params }) => {
        // (การตรวจสอบสิทธิ์ - เหมือนเดิม)
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "Supervisor")) {
          return new Response(JSON.stringify({ success: false, error: "Forbidden" }), { status: 403 });
        }

        const body = await request.json();
        const { 
          first_name, 
          last_name, 
          role, 
          password, 
          faculty_code, 
          can_manage_undergrad_level, 
          can_manage_graduate_level 
        } = body;
        
        const isAdminRole = (role === "admin" || role === "Supervisor");
        
        const dataToUpdate: any = {};

        // 3. ตรวจสอบ field ทั่วไป
        if (first_name !== undefined) dataToUpdate.first_name = first_name;
        if (last_name !== undefined) dataToUpdate.last_name = last_name;
        if (password) {
          dataToUpdate.password_hash = await bcrypt.hash(password, 10);
          dataToUpdate.password_salt = null; // (ตามที่คุณต้องการ)
        }

        if (role !== undefined) {
          dataToUpdate.role = role;
          dataToUpdate.faculty_code = isAdminRole ? null : faculty_code;
          dataToUpdate.can_manage_undergrad_level = isAdminRole ? false : can_manage_undergrad_level;
          dataToUpdate.can_manage_graduate_level = isAdminRole ? false : can_manage_graduate_level;
        } 
        // (ถ้าไม่ได้ส่ง Role แต่ส่งสิทธิ์ย่อยมา)
        else {
          if (faculty_code !== undefined) dataToUpdate.faculty_code = faculty_code;
          if (can_manage_undergrad_level !== undefined) dataToUpdate.can_manage_undergrad_level = can_manage_undergrad_level;
          if (can_manage_graduate_level !== undefined) dataToUpdate.can_manage_graduate_level = can_manage_graduate_level;
        }
        
        // (Logic การอัปเดต)
        const updated = await prisma.user.update({
          where: { id: Number(params.id) },
          data: dataToUpdate, 
          select: {
            id: true,
            username: true,
            role: true,
            faculty_code: true
          }
        });

        return new Response(JSON.stringify({ success: true, updated }));
      },

      // --- 3. DELETE Handler ---
      DELETE: async ({ request, params }) => {
        const currentUser = await getCurrentUser(request);
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "Supervisor")) {
          return new Response(JSON.stringify({ success: false, error: "Forbidden" }), { status: 403 });
        }
        
        const targetUserId = Number(params.id);

        // (Logic ป้องกันการลบตัวเอง / ลบ Admin คนสุดท้าย)
        if (currentUser.id === targetUserId) {
           return new Response(JSON.stringify({ success: false, error: "You cannot delete yourself." }), { status: 400 });
        }
        // ... (Logic อื่นๆ) ...
        
        await prisma.user.delete({ where: { id: targetUserId } });
        
        return new Response(JSON.stringify({ success: true }));
      },
    },
  },
});