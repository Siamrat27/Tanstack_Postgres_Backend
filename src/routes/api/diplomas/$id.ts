import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
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

//------------------------------------------------------------------

export const Route = createFileRoute("/api/diplomas/$id")({
  server: {
    handlers: {
      GET: async ({ request,params }) => {
        try {
          const currentUser = await getCurrentUser(request);
  
          if (!currentUser) {
            return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const diploma = await prisma.diploma.findUnique({
            where: { id: Number(params.id) },
            select: { id: true, faculty_code: true },
          });

          if (!diploma) {
            return new Response(
              JSON.stringify({ success: false, message: "User not found" }),
              { status: 404, headers: { "Content-Type": "application/json" } }
            );
          }

          let whereClause: Prisma.DiplomaWhereInput = {id: Number(params.id)};
          if (currentUser.role === "Professor") {
            // Professor เห็นเฉพาะ faculty_code ของตนเอง
            whereClause.faculty_code = currentUser.faculty_code;
          }
          else if (currentUser.role !== "Supervisor") {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const data = await prisma.diploma.findFirst({
            where: whereClause,
          });

          if (!data) {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(JSON.stringify({ success: true, data }), {
            headers: { "Content-Type": "application/json" },
          });
        }
        catch (error) {
          return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
        }
      },

      // PATCH
      PATCH: async ({ request, params }) => {
        try {
          const currentUser = await getCurrentUser(request);
          if (!currentUser) {
            return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const body = await request.json();
          const fields = [
            "degree_th",
            "degree_en",
            "major_th",
            "major_en",
            "faculty_code",
            "honor",
            "honor_code",
            "degree_code",
            "student_id",
            "graduate_id",
            "barcode",
            "first_attend",
            "second_attend",
            "extra_attend",
            "eligible_receive",
            "grad_year",
            "order_no",
            "order_display",
            "rehearsal_seat_no"
          ];

          const dataToUpdate: any = {};

          for (const field of fields) {
            if (body[field] !== undefined) {
              dataToUpdate[field] = body[field];
            }
          }

          if ((body['first_attend'] && body['second_attend']) || (body['extra_attend'])) {
            dataToUpdate['eligible_receive'] = true;
          } 

          // เช็คว่ามีสิทธิ์รับปริญญาหรือไม่
          else if (((body['first_attend'] === false || body['first_attend'] === undefined) || 
                    (body['second_attend'] === false || body['second_attend'] === undefined)) && 
                    (body['extra_attend'] === false || body['extra_attend'] === undefined)) {
            dataToUpdate['eligible_receive'] = false;
          }

          // Professor สามารถแก้ไขเฉพาะข้อมูลของ faculty ตัวเอง
          if (currentUser.role === "Professor") {
            const diploma = await prisma.diploma.findUnique({ where: { id: Number(params.id) } });
            if (!diploma || diploma.faculty_code !== currentUser.faculty_code) {
              return new Response(
                JSON.stringify({ success: false, message: "Unauthorized" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
              );
            }
          } 
          else if (currentUser.role !== "Supervisor") {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }
          
          const updated = await prisma.diploma.update({
            where: { id: Number(params.id) },
            data: dataToUpdate,
          });

          return new Response(JSON.stringify({ success: true, updated }), {
            headers: { "Content-Type": "application/json" },
          });

        }
        catch (error) {
          return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
        }
      },

      DELETE: async ({ request, params }) => {
        try {
          const currentUser = await getCurrentUser(request);
          if (!currentUser) {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              {
                status: 401,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const diploma = await prisma.diploma.findUnique({
            where: { id: Number(params.id) },
            select: { id: true, faculty_code: true },
          });

          if (!diploma) {
            return new Response(
              JSON.stringify({ success: false, message: "User not found" }),
              { status: 404, headers: { "Content-Type": "application/json" } }
            );
          }

          // ตรวจสอบสิทธิ์: ลบได้เฉพาะ Supervisor หรือ Professor
          if (currentUser.role !== "Supervisor" && currentUser.role !== "Professor") {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }

          // ตรวจสอบสิทธิ์: Professor ลบได้เฉพาะ faculty_code ของตัวเอง
          if (currentUser.role === "Professor" && diploma.faculty_code !== currentUser.faculty_code) {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }

          await prisma.diploma.delete({ where: { id: diploma.id } });

          return new Response(
            JSON.stringify({ success: true }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
