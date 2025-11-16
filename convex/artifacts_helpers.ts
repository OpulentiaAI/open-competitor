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
 */
export const saveArtifact = internalMutation({
  args: {
    threadId: v.id("threads"),
    type: v.string(),
    title: v.string(),
    payload: v.any(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, { threadId, type, title, payload, meta }) => {
    return await ctx.db.insert("artifacts", {
      threadId,
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
