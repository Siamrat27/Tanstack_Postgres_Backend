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

export const Route = createFileRoute("/api/diplomas/student/$student_id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const currentUser = await getCurrentUser(request);
          if (!currentUser) {
            return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const studentId = params.student_id;
          if (!studentId) {
            return new Response(
              JSON.stringify({ success: false, message: "Student ID is required" }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }

          let whereClause: Prisma.DiplomaWhereInput = { student_id: studentId };
          if (currentUser.role === "Professor") {
            whereClause.faculty_code = currentUser.faculty_code;
          } else if (currentUser.role !== "Supervisor") {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const diplomas = await prisma.diploma.findMany({ where: whereClause });

          if (!diplomas || diplomas.length === 0) {
            return new Response(
              JSON.stringify({ success: false, message: "No diplomas found" }),
              { status: 404, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(JSON.stringify({ success: true, data: diplomas }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },

      // PATCH: async ({ request, params }) => {
      //   try {
      //     const currentUser = await getCurrentUser(request);
      //     if (!currentUser) {
      //       return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      //         status: 401,
      //         headers: { "Content-Type": "application/json" },
      //       });
      //     }

      //     const studentId = params.student_id;
      //     if (!studentId) {
      //       return new Response(
      //         JSON.stringify({ success: false, message: "Student ID is required" }),
      //         { status: 400, headers: { "Content-Type": "application/json" } }
      //       );
      //     }

      //     const body = await request.json();
      //     const fields = [
      //       "degree_th", "degree_en", "major_th", "major_en",
      //       "faculty_code", "honor", "honor_code", "degree_code",
      //       "student_id", "graduate_id", "barcode", "first_attend",
      //       "second_attend", "extra_attend", "eligible_receive",
      //       "grad_year", "order_no", "order_display", "rehearsal_seat_no"
      //     ];

      //     const dataToUpdate: any = {};
      //     for (const field of fields) {
      //       if (body[field] !== undefined) dataToUpdate[field] = body[field];
      //     }

      //     // ตรวจสอบสิทธิ์: Professor แก้ไขเฉพาะ faculty ของตัวเอง
      //     if (currentUser.role === "Professor") {
      //       const diploma = await prisma.diploma.findFirst({
      //         where: { student_id: studentId, faculty_code: currentUser.faculty_code },
      //       });
      //       if (!diploma) {
      //         return new Response(
      //           JSON.stringify({ success: false, message: "Unauthorized" }),
      //           { status: 401, headers: { "Content-Type": "application/json" } }
      //         );
      //       }
      //       const updated = await prisma.diploma.updateMany({
      //         where: { student_id: studentId, faculty_code: currentUser.faculty_code },
      //         data: dataToUpdate,
      //       });
      //       return new Response(JSON.stringify({ success: true, updated }), {
      //         headers: { "Content-Type": "application/json" },
      //       });
      //     } 
      //     else if (currentUser.role === "Supervisor") {
      //       const updated = await prisma.diploma.updateMany({
      //         where: { student_id: studentId },
      //         data: dataToUpdate,
      //       });
      //       return new Response(JSON.stringify({ success: true, updated }), {
      //         headers: { "Content-Type": "application/json" },
      //       });
      //     } else {
      //       return new Response(
      //         JSON.stringify({ success: false, message: "Unauthorized" }),
      //         { status: 401, headers: { "Content-Type": "application/json" } }
      //       );
      //     }
      //   } catch (error) {
      //     return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
      //   }
      // },

      // DELETE: async ({ request, params }) => {
      //   try {
      //     const currentUser = await getCurrentUser(request);
      //     if (!currentUser) {
      //       return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
      //         status: 401,
      //         headers: { "Content-Type": "application/json" },
      //       });
      //     }

      //     const studentId = params.student_id;
      //     if (!studentId) {
      //       return new Response(
      //         JSON.stringify({ success: false, message: "Student ID is required" }),
      //         { status: 400, headers: { "Content-Type": "application/json" } }
      //       );
      //     }

      //     // ตรวจสอบสิทธิ์: Professor ลบเฉพาะ faculty ของตัวเอง
      //     if (currentUser.role === "Professor") {
      //       const deleted = await prisma.diploma.deleteMany({
      //         where: { student_id: studentId, faculty_code: currentUser.faculty_code },
      //       });
      //       return new Response(JSON.stringify({ success: true, deleted }), {
      //         headers: { "Content-Type": "application/json" },
      //       });
      //     } 
      //     else if (currentUser.role === "Supervisor") {
      //       const deleted = await prisma.diploma.deleteMany({ where: { student_id: studentId } });
      //       return new Response(JSON.stringify({ success: true, deleted }), {
      //         headers: { "Content-Type": "application/json" },
      //       });
      //     } else {
      //       return new Response(
      //         JSON.stringify({ success: false, message: "Unauthorized" }),
      //         { status: 403, headers: { "Content-Type": "application/json" } }
      //       );
      //     }
      //   } catch (error) {
      //     return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), {
      //       status: 500,
      //       headers: { "Content-Type": "application/json" },
      //     });
      //   }
      // },
    },
  },
});
