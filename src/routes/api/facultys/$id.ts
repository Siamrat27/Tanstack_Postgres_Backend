import { createFileRoute } from '@tanstack/react-router'
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

export const Route = createFileRoute('/api/facultys/$id')({
    server: {
        handlers:{
            GET: async ({ request, params }) => {
                try {
                    const currentUser = await getCurrentUser(request);
                    if (!currentUser || currentUser.role !== "Supervisor") {
                        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 403 });
                    }

                    const facultyId = Number(params.id);
                    const faculty = await prisma.faculty.findUnique({
                        where: { id: facultyId },
                        select: {
                            id: true,
                            faculty_code: true,
                            faculty_name: true,
                        },
                    });

                    if (!faculty) {
                        return new Response(JSON.stringify({ success: false, error: "Faculty not found" }), { status: 404 });
                    }

                    return new Response(JSON.stringify({ success: true, data: faculty }), {
                        headers: { "Content-Type": "application/json" },
                    });

                } catch (error) {
                    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
                }
            },
            PATCH: async ({ request, params }) => {
                try {
                    const currentUser = await getCurrentUser(request);
                    if (!currentUser || currentUser.role !== "Supervisor") {
                        return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 403 });
                    }

                    const facultyId = Number(params.id);
                    if (isNaN(facultyId)) {
                        return new Response(JSON.stringify({ success: false, error: "Invalid ID" }), { status: 400 });
                    }

                    const body = await request.json();
                    const fields = ["faculty_code", "faculty_name"];
                    const dataToUpdate: any = {};

                    for (const field of fields) {
                        if (body[field] !== undefined && body[field] !== "") {
                            dataToUpdate[field] = body[field];
                        }
                    }

                    if (Object.keys(dataToUpdate).length === 0) {
                        return new Response(JSON.stringify({ success: false, error: "No valid fields to update" }), { status: 400 });
                    }

                    const updatedFaculty = await prisma.faculty.update({
                        where: { id: facultyId },
                        data: dataToUpdate,
                        select: {
                            id: true,
                            faculty_code: true,
                            faculty_name: true,
                        },
                    });

                    return new Response(JSON.stringify({ success: true, data: updatedFaculty }), {
                        headers: { "Content-Type": "application/json" },
                    });

                } catch (error) {
                    console.error(error);
                    return new Response(JSON.stringify({ success: false, error: "Internal Server Error" }), { status: 500 });
                }
            },
        }
    }
})