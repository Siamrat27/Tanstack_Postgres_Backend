import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/rounds/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const data = await prisma.round.findUnique({
          where: { id: Number(params.id) },
          include: { schedules: true },
        });
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      PUT: async ({ request, params }) => {
        const body = await request.json();
        const updated = await prisma.round.update({
          where: { id: Number(params.id) },
          data: body,
        });
        return new Response(JSON.stringify({ success: true, updated }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      DELETE: async ({ params }) => {
        await prisma.round.delete({ where: { id: Number(params.id) } });
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
