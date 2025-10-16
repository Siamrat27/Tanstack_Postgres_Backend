import { createFileRoute } from "@tanstack/react-router"
// groups.ts
export const Route = createFileRoute("/api/groups")({
  server: {
    handlers: {
      GET: async () => {
        const data = await prisma.group.findMany({ orderBy: { id: "asc" } });
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { "Content-Type": "application/json" },
        });
      },
      POST: async ({ request }) => {
        const body = await request.json();
        const created = await prisma.group.create({ data: body });
        return new Response(JSON.stringify({ success: true, created }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
