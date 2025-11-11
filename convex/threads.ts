import { mutation } from "./_generated/server";

/**
 * Create a new conversation thread
 */
export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const threadId = await ctx.db.insert("threads", {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return threadId;
  },
});
