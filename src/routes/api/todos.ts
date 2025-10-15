import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/db";

export const Route = createFileRoute("/api/todos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const todos = await prisma.todo.findMany({
          orderBy: { createdAt: "desc" },
        });
        return new Response(
          JSON.stringify({ success: true, count: todos.length, todos }),
          { headers: { "Content-Type": "application/json" } }
        );
      },

      POST: async ({ request }) => {
        const body = await request.json();
        const { title } = body;

        if (!title) {
          return new Response(
            JSON.stringify({ success: false, message: "Missing title" }),
            {
              status: 400,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const todo = await prisma.todo.create({
          data: { title, completed: false },
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Todo created successfully",
            todo,
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      },
    },
  },
});
