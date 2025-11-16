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
      type: "program_plan" | "lead_qualification";
      artifact: any;
      createdAt: number;
    }> = [];

    // Fetch program plans
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

    // TODO: Add lead qualifications when that table exists
    // const leads = await ctx.db
    //   .query("leads")
    //   .filter((q) => q.eq(q.field("threadId"), threadId))
    //   .order("desc")
    //   .collect();

    // for (const lead of leads) {
    //   artifacts.push({
    //     _id: lead._id,
    //     type: "lead_qualification",
    //     artifact: lead.artifact,
    //     createdAt: lead.createdAt,
    //   });
    // }

    // Sort by creation time, newest first
    artifacts.sort((a, b) => b.createdAt - a.createdAt);

    return artifacts;
  },
});
