import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/schedules/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const data = await prisma.schedule.findUnique({
          where: { id: Number(params.id) },
          include: { round: true, attends: true },
        });
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      PUT: async ({ request, params }) => {
        const body = await request.json();
        const updated = await prisma.schedule.update({
          where: { id: Number(params.id) },
          data: body,
        });
        return new Response(JSON.stringify({ success: true, updated }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      DELETE: async ({ params }) => {
        await prisma.schedule.delete({ where: { id: Number(params.id) } });
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
