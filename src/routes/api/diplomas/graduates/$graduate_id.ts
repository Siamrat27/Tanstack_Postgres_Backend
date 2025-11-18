import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
// import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

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

export const Route = createFileRoute('/api/diplomas/graduates/$graduate_id')({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
          try {
              // 1. ตรวจสอบสิทธิ์ผู้ใช้ (เหมือนเดิม)
              const currentUser = await getCurrentUser(request);
              if (!currentUser) {
                  return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
                      status: 401,
                      headers: { "Content-Type": "application/json" },
                  });
              }

              // 2. [แก้ไข] เปลี่ยนมาใช้ graduate_id จาก params
              //    (ผมสมมติว่า URL ของคุณคือ /api/graduates/[graduate_id])
              const graduateIdParam = params.graduate_id; // <-- **เปลี่ยนจาก student_id**
              if (!graduateIdParam) {
                  return new Response(
                      JSON.stringify({ success: false, message: "Graduate ID is required in URL" }),
                      { status: 400, headers: { "Content-Type": "application/json" } }
                  );
              }

              // แปลง ID เป็นตัวเลข (ควรทำเสมอ)
              const graduate_id = parseInt(graduateIdParam);
              if (isNaN(graduate_id)) {
                  return new Response(
                      JSON.stringify({ success: false, message: "Invalid Graduate ID format" }),
                      { status: 400, headers: { "Content-Type": "application/json" } }
                  );
              }

              // 3. ดึงข้อมูล Body และกรอง fields (เหมือนเดิม)
              const body = await request.json();
              const fields = [
                  "degree_th", "degree_en", "major_th", "major_en",
                  "faculty_code", "honor", "honor_code", "degree_code",
                  /* "student_id", "graduate_id", */ // <--- เอา Key ออก ไม่ควรให้อัปเดต
                  "barcode", "first_attend",
                  "second_attend", "extra_attend", "eligible_receive",
                  "grad_year", "order_no", "order_display", "rehearsal_seat_no"
              ];

              const dataToUpdate: any = {};
              for (const field of fields) {
                  if (body[field] !== undefined) dataToUpdate[field] = body[field];
              }

              // 4. [แก้ไข] สร้างเงื่อนไข (where) สำหรับ "update" (ไม่ใช่ updateMany)
              //    เราจะรวมการตรวจสอบสิทธิ์ (AuthZ) เข้าไปใน 'where' ทีเดียว
              
              let whereCondition: any = {
                  graduate_id: graduate_id, // Key หลักในการค้นหา
              };

              if (currentUser.role === "Professor") {
                  // ถ้าเป็น Professor, ต้องอัปเดตได้เฉพาะ diploma ที่ตรงกับ faculty_code ของเขา
                  whereCondition.faculty_code = currentUser.faculty_code;
              } else if (currentUser.role !== "Supervisor") {
                  // ถ้าไม่ใช่ Supervisor หรือ Professor ก็ไม่มีสิทธิ์
                  return new Response(
                      JSON.stringify({ success: false, message: "Unauthorized role" }),
                      { status: 403, headers: { "Content-Type": "application/json" } }
                  );
              }
              // (ถ้าเป็น Supervisor, 'whereCondition' จะมีแค่ graduate_id ซึ่งถูกต้อง)

              // 5. [แก้ไข] ใช้ "update" (ไม่ใช่ updateMany)
              //    นี่คือการ "หาและอัปเดต" ในขั้นตอนเดียว (Atomic Operation)
              
              const updatedDiploma = await prisma.diploma.update({
                  where: whereCondition,
                  data: dataToUpdate,
              });

              // ถ้าสำเร็จ
              return new Response(JSON.stringify({ success: true, data: updatedDiploma }), {
                  status: 200,
                  headers: { "Content-Type": "application/json" },
              });

          } catch (error) {
              return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { 
                  status: 500,
                  headers: { "Content-Type": "application/json" }
              });
          }
      },
    },
  },
})
