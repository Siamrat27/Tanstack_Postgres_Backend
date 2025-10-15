import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";

// --- Server Function: return all todos as JSON
export const getTodos = createServerFn().handler(async () => {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    count: todos.length,
    todos: todos.map((t) => ({
      id: t.id,
      title: t.title,
      completed: t.completed,
      createdAt: t.createdAt,
      url: `/todos/${t.id}`,
    })),
  };
});

// --- Route: returns JSON directly (no UI)
export const Route = createFileRoute("/todos")({
  loader: async () => getTodos(),
  component: JsonResponse,
});

function JsonResponse() {
  const data = Route.useLoaderData();
  // TanStack allows you to return plain JSON like this:
  return (
    <pre
      style={{
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        padding: "1rem",
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
