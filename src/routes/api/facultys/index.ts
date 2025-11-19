import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";
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

export const Route = createFileRoute('/api/facultys/')({
  server: {
    handlers: {
        GET: async ({ request }) => {
            try {
                const currentUser = await getCurrentUser(request);
                if (!currentUser) {
                    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 403 });
                }

                const data = await prisma.faculty.findMany({
                    orderBy: { faculty_code: 'asc' },
                    select: {
                        id: true,
                        faculty_code: true,
                        faculty_name: true,
                    },
                })

                return new Response(JSON.stringify({ success: true, data }), {
                    headers: { "Content-Type": "application/json" },
                });
            } catch (error) {
              console.error("GET /api/facultys Error:", error);
              return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
            }
        },
        POST: async ({ request }) => {
            try {
                const currentUser = await getCurrentUser(request);
                if (!currentUser || currentUser.role !== "Supervisor") {
                    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 403 });
                }

                const body = await request.json();
                const { faculty_code, faculty_name } = body;

                if (!faculty_code || !faculty_name) {
                    return new Response(JSON.stringify({ success: false, error: "faculty_code and faculty_name are required" }), { status: 400 });
                }

                const createdFaculty = await prisma.faculty.create({
                    data: {
                        faculty_code,
                        faculty_name,
                    },
                    select: {
                        id: true,
                        faculty_code: true,
                        faculty_name: true,
                    },
                });
                return new Response(JSON.stringify({ success: true, data: createdFaculty }), {
                    headers: { "Content-Type": "application/json" },
                });

            } catch (error) {
                console.error("POST /api/facultys Error:", error);
                return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
            }
        },
    }
  }
})