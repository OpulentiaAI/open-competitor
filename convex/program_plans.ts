import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    companyId: v.id("companies"),
    officeId: v.string(),
    artifact: v.any(),
    threadId: v.optional(v.id("threads")),
  },
  handler: async (ctx, { companyId, officeId, artifact, threadId }) => {
    const now = Date.now();
    const programPlanId = await ctx.db.insert("program_plans", {
      companyId,
      officeId,
      artifact,
      threadId,
      createdAt: now,
      updatedAt: now,
    });
    return programPlanId;
  },
});

export const listByCompanyOffice = query({
  args: {
    companyId: v.id("companies"),
    officeId: v.string(),
  },
  handler: async (ctx, { companyId, officeId }) => {
    const plans = await ctx.db
      .query("program_plans")
      .withIndex("by_company_office", (q) => q.eq("companyId", companyId))
      .filter((q) => q.eq(q.field("officeId"), officeId))
      .order("desc")
      .collect();

    return plans;
  },
});
