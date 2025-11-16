import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { internal, api } from "./_generated/api";

/**
 * TODO/Planning Tools for SuperAgent
 * Manage task lists and planning artifacts within threads
 */

/**
 * Set or Update TODO List
 */
export const todoSetTool = createTool({
  description: "Set or update the TODO list for the current conversation. Use markdown checkboxes: - [ ] for pending, - [x] for completed tasks. Great for planning multi-step work.",
  args: z.object({
    todos: z.string().describe("Markdown formatted todo list with checkboxes"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
    itemCount: number;
  }> => {
    const threadId = (ctx as any).threadId;
    const userId = (ctx as any).userId;

    if (!threadId) {
      return {
        success: false,
        message: "No active thread",
        itemCount: 0,
      };
    }

    // Count items
    const lines = args.todos.split("\n").filter(line => line.trim().match(/^-\s*\[[ x]\]/));
    const itemCount = lines.length;

    // Check if todos already exist for this thread
    const existing = await ctx.runQuery(internal.tools_todo.getTodosByThread, {
      threadId,
    });

    if (existing) {
      // Update existing
      await ctx.runMutation(internal.tools_todo.updateTodos, {
        todoId: existing._id,
        content: args.todos,
      });
    } else {
      // Create new
      await ctx.runMutation(internal.tools_todo.createTodos, {
        threadId,
        userId,
        content: args.todos,
      });
    }

    // Save as artifact
    await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
      threadId,
      type: "todo_list",
      title: "Task List",
      payload: {
        todos: args.todos,
        itemCount,
        createdAt: Date.now(),
      },
    });

    return {
      success: true,
      message: `Updated ${itemCount} todo items`,
      itemCount,
    };
  },
});

/**
 * Get Current TODO List
 */
export const todoGetTool = createTool({
  description: "Get the current TODO list for this conversation. Returns the markdown formatted task list.",
  args: z.object({}),
  handler: async (ctx, _args): Promise<{
    success: boolean;
    todos: string;
    itemCount: number;
  }> => {
    const threadId = (ctx as any).threadId;

    if (!threadId) {
      return {
        success: false,
        todos: "No active thread",
        itemCount: 0,
      };
    }

    const existing = await ctx.runQuery(internal.tools_todo.getTodosByThread, {
      threadId,
    });

    if (!existing) {
      return {
        success: true,
        todos: "No todos yet. Use todo_set to create a task list.",
        itemCount: 0,
      };
    }

    const lines = existing.content.split("\n").filter((line: string) => line.trim().match(/^-\s*\[[ x]\]/));
    const itemCount = lines.length;

    return {
      success: true,
      todos: existing.content,
      itemCount,
    };
  },
});

// Internal helpers
import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Internal query to get todos by thread
 */
export const getTodosByThread = internalQuery({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("todos")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("desc")
      .first();
  },
});

/**
 * Internal mutation to create todos
 */
export const createTodos = internalMutation({
  args: {
    threadId: v.id("threads"),
    userId: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, { threadId, userId, content }) => {
    return await ctx.db.insert("todos", {
      threadId,
      userId,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Internal mutation to update todos
 */
export const updateTodos = internalMutation({
  args: {
    todoId: v.id("todos"),
    content: v.string(),
  },
  handler: async (ctx, { todoId, content }) => {
    await ctx.db.patch(todoId, {
      content,
      updatedAt: Date.now(),
    });
  },
});
