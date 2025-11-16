import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getByThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, { threadId }) => {
    return await ctx.db
      .query("order_plans")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .first();
  },
});

export const create = internalMutation({
  args: {
    threadId: v.string(),
    item: v.object({
      suggestionId: v.string(),
      restaurantName: v.string(),
      title: v.string(),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      doordashUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { threadId, item }) => {
    const now = Date.now();
    return await ctx.db.insert("order_plans", {
      threadId,
      userId: undefined,
      createdAt: now,
      updatedAt: now,
      items: [item],
    });
  },
});

export const appendItem = internalMutation({
  args: {
    orderPlanId: v.id("order_plans"),
    item: v.object({
      suggestionId: v.string(),
      restaurantName: v.string(),
      title: v.string(),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      doordashUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { orderPlanId, item }) => {
    const plan = await ctx.db.get(orderPlanId);
    if (!plan) throw new Error("Order plan not found");

    await ctx.db.patch(orderPlanId, {
      items: [...plan.items, item],
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mutation that wraps addMealToOrderPlan tool logic
 * Called directly from UI when user clicks "Add to plan" button
 */
export const addFromSuggestion = mutation({
  args: {
    threadId: v.string(),
    suggestionId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { threadId, suggestionId, notes }) => {
    // Get latest meal suggestions artifact
    const artifact = await ctx.db
      .query("meal_suggestions")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("desc")
      .first();

    if (!artifact) {
      throw new Error("No meal suggestions found for this thread");
    }

    const suggestion = artifact.artifact.suggestions.find(
      (s: any) => s.id === suggestionId
    );

    if (!suggestion) {
      throw new Error("Suggestion not found");
    }

    // Check if order plan exists
    const existing = await ctx.db
      .query("order_plans")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .first();

    const item = {
      suggestionId: suggestion.id,
      restaurantName: suggestion.restaurantName,
      title: suggestion.title,
      price: suggestion.price,
      currency: suggestion.currency ?? "USD",
      imageUrl: suggestion.imageUrl,
      doordashUrl: suggestion.doordashUrl,
      notes,
    };

    if (!existing) {
      const now = Date.now();
      await ctx.db.insert("order_plans", {
        threadId,
        userId: undefined,
        createdAt: now,
        updatedAt: now,
        items: [item],
      });
    } else {
      await ctx.db.patch(existing._id, {
        items: [...existing.items, item],
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      added: {
        restaurantName: suggestion.restaurantName,
        title: suggestion.title,
      },
    };
  },
});
