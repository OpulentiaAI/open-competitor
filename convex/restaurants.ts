import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Search for meal suggestions from restaurant data
 * 
 * This powers the suggestMealsFromDoorDash tool
 */
export const searchForSuggestions = query({
  args: {
    location: v.string(),
    query: v.string(),
    maxPrice: v.optional(v.number()),
    cuisine: v.optional(v.string()),
    dietaryTags: v.array(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const { location, maxPrice, cuisine, limit } = args;
    
    // Parse location (e.g. "Austin, TX" → city: "Austin", state: "TX")
    const [city, state] = location.split(",").map((s) => s.trim());
    
    let restaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_city", (q) => q.eq("city", city))
      .collect();

    // Filter by cuisine if specified
    if (cuisine) {
      restaurants = restaurants.filter(
        (r) => r.cuisine?.toLowerCase() === cuisine.toLowerCase()
      );
    }

    // Filter by price if maxPrice specified
    if (maxPrice && maxPrice > 0) {
      restaurants = restaurants.filter(
        (r) => !r.bestItemPrice || r.bestItemPrice <= maxPrice
      );
    }

    // Filter by rating (only 3.5+ star restaurants)
    restaurants = restaurants.filter((r) => !r.rating || r.rating >= 3.5);

    // Sort by rating desc
    restaurants.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return restaurants.slice(0, limit);
  },
});

/**
 * Import restaurant data from CSV
 * Call this to seed your database with DoorDash data
 */
export const importRestaurant = internalMutation({
  args: {
    name: v.string(),
    city: v.string(),
    state: v.string(),
    cuisine: v.optional(v.string()),
    rating: v.optional(v.number()),
    priceBucket: v.optional(v.string()),
    deliveryEtaMinutes: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    bestItemTitle: v.optional(v.string()),
    bestItemDescription: v.optional(v.string()),
    bestItemPrice: v.optional(v.number()),
    doordashRestaurantId: v.optional(v.string()),
    doordashUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("restaurants", {
      ...args,
      tags: [],
      slug: args.name.toLowerCase().replace(/\s+/g, "-"),
    });
  },
});
