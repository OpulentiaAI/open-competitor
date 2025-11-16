import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all artifacts for a given thread
 * 
 * Combines program plans, lead qualifications, and other artifacts
 * into a unified list for rendering in the founder console
 */
export const listByThread = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, { threadId }) => {
    const artifacts: Array<{
      _id: string;
      type: string;
      artifact: any;
      createdAt: number;
    }> = [];

    // Legacy: Fetch program plans
    const plans = await ctx.db
      .query("program_plans")
      .filter((q) => q.eq(q.field("threadId"), threadId))
      .order("desc")
      .collect();

    for (const plan of plans) {
      artifacts.push({
        _id: plan._id,
        type: "program_plan",
        artifact: plan.artifact,
        createdAt: plan.createdAt,
      });
    }

    // New: Fetch all artifacts from unified table
    const allArtifacts = await ctx.db
      .query("artifacts")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("desc")
      .collect();

    for (const art of allArtifacts) {
      artifacts.push({
        _id: art._id,
        type: art.type,
        artifact: art.payload,
        createdAt: art.createdAt,
      });
    }

    // Sort by creation time, newest first
    artifacts.sort((a, b) => b.createdAt - a.createdAt);

    return artifacts;
  },
});
