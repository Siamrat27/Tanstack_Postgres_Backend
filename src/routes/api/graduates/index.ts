import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/graduates/")({
  server: {
    handlers: {
      // === GET /api/graduates ===
      GET: async () => {
        const graduates = await prisma.graduate.findMany({
          orderBy: { id: "asc" },
        });
        return new Response(
          JSON.stringify({
            success: true,
            count: graduates.length,
            graduates,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      },

      // === POST /api/graduates ===
      POST: async ({ request }) => {
        const body = await request.json();

        const graduate = await prisma.graduate.create({
          data: body,
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Graduate added successfully",
            graduate,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      },
    },
  },
});
