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

/**
 * Generic artifact save mutation
 * Handles all artifact types: presentations, research_reports, images, videos, etc.
 * Accepts either agent threadId (string) or Convex threadId (Id<"threads">)
 */
export const saveArtifact = internalMutation({
  args: {
    threadId: v.union(v.id("threads"), v.string()),
    type: v.string(),
    title: v.string(),
    payload: v.any(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, { threadId, type, title, payload, meta }) => {
    // If threadId is a string (agent's internal ID), find the Convex thread
    let convexThreadId: any = threadId;
    if (typeof threadId === 'string' && !threadId.includes('_')) {
      const thread = await ctx.db
        .query("threads")
        .filter((q) => q.eq(q.field("metadata.agentThreadId"), threadId))
        .first();
      
      if (!thread) {
        throw new Error(`No Convex thread found for agent threadId: ${threadId}`);
      }
      convexThreadId = thread._id;
    }
    
    return await ctx.db.insert("artifacts", {
      threadId: convexThreadId,
      type,
      title,
      payload,
      meta: meta || {},
      createdAt: Date.now(),
    });
  },
});

/**
 * Get artifacts by thread and optional type filter
 */
export const getArtifactsByThread = query({
  args: {
    threadId: v.id("threads"),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { threadId, type }) => {
    let query = ctx.db
      .query("artifacts")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("desc");

    const all = await query.collect();
    
    if (type) {
      return all.filter((a) => a.type === type);
    }
    
    return all;
  },
});
