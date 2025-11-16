import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new conversation thread
 */
export const create = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { userId }) => {
    const threadId = await ctx.db.insert("threads", {
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return threadId;
  },
});
