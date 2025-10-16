// users.ts
import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/users")({
  server: {
    handlers: {
      GET: async () => {
        const data = await prisma.user.findMany({ orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const body = await request.json();
        const created = await prisma.user.create({ data: body });
        return new Response(JSON.stringify({ success: true, created }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
