// src/routes/api/graduates.$student_id.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/graduates/$student_id")({
  server: {
    handlers: {
      // GET /api/graduates/:student_id
      GET: async ({ params }) => {
        const graduate = await prisma.graduate.findUnique({
          where: { student_id: params.student_id },
        });
        if (!graduate) {
          return new Response(
            JSON.stringify({ success: false, message: "Not found" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify({ success: true, graduate }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      // PUT /api/graduates/:student_id
      PUT: async ({ request, params }) => {
        try {
          const data = await request.json();
          const updated = await prisma.graduate.update({
            where: { student_id: params.student_id },
            data,
          });
          return new Response(JSON.stringify({ success: true, updated }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              success: false,
              error: String(err?.message ?? err),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },

      // DELETE /api/graduates/:student_id
      DELETE: async ({ params }) => {
        try {
          await prisma.graduate.delete({
            where: { student_id: params.student_id },
          });
          return new Response(
            JSON.stringify({
              success: true,
              message: `Deleted ${params.student_id}`,
            }),
            { headers: { "Content-Type": "application/json" } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              success: false,
              error: String(err?.message ?? err),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
