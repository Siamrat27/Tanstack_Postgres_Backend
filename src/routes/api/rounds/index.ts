import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/rounds/")({
  server: {
    handlers: {
      GET: async () => {
        const data = await prisma.round.findMany({
          include: { schedules: true },
          orderBy: { id: "asc" },
        });
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
      },

      POST: async ({ request }) => {
        const body = await request.json();
        const created = await prisma.round.create({ data: body });
        return new Response(JSON.stringify({ success: true, created }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
