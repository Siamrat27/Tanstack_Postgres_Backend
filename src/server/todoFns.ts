"use server";
import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import { z } from "zod";

// Add a todo and return URL in JSON
export const addTodo = createServerFn({ method: "POST" })
  .inputValidator(z.object({ title: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const todo = await prisma.todo.create({
      data: { title: data.title },
    });

    // Return a JSON object that includes a message and URL
    return {
      message: "Todo created successfully",
      url: `/todos/${todo.id}`,
      todo,
    };
  });
