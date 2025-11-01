// /routes/api/diplomas.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

async function getCurrentUser(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not set");

    const decoded = jwt.verify(token, secret);
    
    // ดึงข้อมูล User สดจาก DB
    const payload = decoded as { id: number }; // <-- แก้ไข payload ตาม login.ts ของคุณ
    const user = await prisma.user.findUnique({
      where: { id: payload.id }, // <-- ใช้ id (ตาม login.ts ของคุณ)
      select: {
        id: true,
        role: true,
        faculty_code: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Auth Error:", error);
    return null;
  }
}

export const Route = createFileRoute("/api/diplomas")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const currentUser = await getCurrentUser(request);

          if (!currentUser) {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          let whereClause: Prisma.DiplomaWhereInput = {};

          // ถ้า Role เป็น 'Supervisor'
          if (currentUser.role === "Supervisor") {
            whereClause = {}; // Admin เห็นได้ทุกอย่าง
          } 
          else if (currentUser.role === "Professor") {
            // Professor เห็นเฉพาะ faculty_code ของตนเอง
            whereClause = {
              faculty_code: currentUser.faculty_code,
            };
          }
          else {
            return new Response(
              JSON.stringify({ success: false, message: "Unauthorized" }),
              { status: 401, headers: { "Content-Type": "application/json" } }
            );
          }

          const diplomas = await prisma.diploma.findMany({
            where: whereClause,
            orderBy: {
              id: "asc",
            },
          });

          return new Response(JSON.stringify({ success: true, data: diplomas }), {
            headers: { "Content-Type": "application/json" },
          });

        } catch (error) {
          console.error("GET Diplomas Error:", error);
          return new Response(
            JSON.stringify({ success: false, message: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});