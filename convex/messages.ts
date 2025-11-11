import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Add a message to a thread
 */
export const add = mutation({
  args: {
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, { threadId, role, content }) => {
    const messageId = await ctx.db.insert("messages", {
      threadId, // threadId is a valid Id<threads>
      role,
      content,
      createdAt: Date.now(),
    });
    return messageId;
  },
});

/**
 * Get all messages in a thread
 */
export const list = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, { threadId }) => {
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .order("desc")
      .collect();
    
    return messages.reverse(); // Return in chronological order
  },
});
