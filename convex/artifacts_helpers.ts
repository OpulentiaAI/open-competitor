import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const saveMealSuggestionsArtifact = internalMutation({
  args: {
    threadId: v.optional(v.string()),
    artifact: v.any(),
  },
  handler: async (ctx, { threadId, artifact }) => {
    return await ctx.db.insert("meal_suggestions", {
      threadId,
      artifact,
      createdAt: Date.now(),
    });
  },
});

export const getLatestMealSuggestionsForThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    const latest = await ctx.db
      .query("meal_suggestions")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("desc")
      .first();

    return latest?.artifact ?? null;
  },
});
