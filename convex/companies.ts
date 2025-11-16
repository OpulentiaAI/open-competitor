import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    const now = Date.now();
    const companyId = await ctx.db.insert("companies", {
      name,
      createdAt: now,
      updatedAt: now,
      metadata: {},
    });
    return companyId;
  },
});

export const update = mutation({
  args: {
    companyId: v.id("companies"),
  },
  handler: async (ctx, { companyId }) => {
    await ctx.db.patch(companyId, { updatedAt: Date.now() });
  },
});

export const getByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, { name }) => {
    return await ctx.db
      .query("companies")
      .filter((q) => q.eq(q.field("name"), name))
      .first();
  },
});
