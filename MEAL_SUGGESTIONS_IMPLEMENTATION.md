# Meal Suggestions with DoorDash Data + Kibo Stories

## ✅ Foundation Complete

The artifact schemas are in place. Now follow this guide to complete the implementation.

## Step 1: Update Schema for Restaurants & Order Plans

### convex/schema.ts

Add these tables:

```typescript
// Add to your schema
restaurants: defineTable({
  name: v.string(),
  slug: v.optional(v.string()),
  city: v.string(),
  state: v.string(),
  cuisine: v.optional(v.string()),
  rating: v.optional(v.number()),
  priceBucket: v.optional(v.string()), // "$", "$$", "$$$"
  deliveryEtaMinutes: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  doordashRestaurantId: v.optional(v.string()),
  doordashUrl: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  // Meal item details
  bestItemTitle: v.optional(v.string()),
  bestItemDescription: v.optional(v.string()),
  bestItemPrice: v.optional(v.number()),
})
  .index("by_city", ["city"])
  .index("by_cuisine", ["cuisine"])
  .searchIndex("search_restaurants", {
    searchField: "name",
    filterFields: ["city", "cuisine", "rating"],
  }),

order_plans: defineTable({
  threadId: v.string(),
  userId: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  items: v.array(
    v.object({
      suggestionId: v.string(),
      restaurantName: v.string(),
      title: v.string(),
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      doordashUrl: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  ),
}).index("by_thread", ["threadId"]),

meal_suggestions: defineTable({
  threadId: v.optional(v.string()),
  artifact: v.any(),
  createdAt: v.number(),
}).index("by_thread", ["threadId"]),
```

## Step 2: Create Restaurant Query Functions

### convex/restaurants.ts

```typescript
import { query, mutation, internalMutation } from "./_generated/server";
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

    // Filter by rating (optional: only 4+ star restaurants)
    restaurants = restaurants.filter((r) => !r.rating || r.rating >= 3.5);

    // Sort by rating desc, then random
    restaurants.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return restaurants.slice(0, limit);
  },
});

/**
 * Import restaurant data from CSV
 * Call this once to seed your database
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("restaurants", {
      ...args,
      tags: [],
      doordashRestaurantId: undefined,
      doordashUrl: undefined,
      slug: args.name.toLowerCase().replace(/\s+/g, "-"),
    });
  },
});
```

## Step 3: Create Order Plan Functions

### convex/order_plans.ts

```typescript
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

    return { success: true, added: { restaurantName: suggestion.restaurantName, title: suggestion.title } };
  },
});
```

## Step 4: Create Artifacts Helper Functions

### convex/artifacts_helpers.ts

```typescript
import { mutation, query, internalMutation } from "./_generated/server";
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
```

## Step 5: Add Tools to Agent

### convex/agent_mealoutpost.ts

Add these tools after your existing tools:

```typescript
/**
 * Suggest Meals from DoorDash Tool
 * 
 * Searches DoorDash-style restaurant data and returns meal suggestions
 */
export const suggestMealsFromDoorDash = createTool({
  description:
    "Suggest individual meals from DoorDash-style restaurant data, filtered by budget, cuisine, and dietary needs.",
  args: z.object({
    location: z.string().describe("City + state, e.g. 'Austin, TX'"),
    query: z.string().describe("User's meal request in natural language"),
    maxPrice: z.number().optional(),
    cuisine: z.string().optional(),
    dietaryTags: z.array(z.string()).optional(),
    limit: z.number().min(1).max(20).default(10),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const { location, query, maxPrice, cuisine, dietaryTags, limit } = args;

    // Query Convex restaurants table
    const candidates = await ctx.runQuery(api.restaurants.searchForSuggestions, {
      location,
      query,
      maxPrice,
      cuisine,
      dietaryTags: dietaryTags ?? [],
      limit,
    });

    // Map to MealSuggestion format
    const suggestions = candidates.map((r: any, idx: number) => ({
      id: r._id,
      displayIndex: idx + 1,
      restaurantName: r.name,
      restaurantSlug: r.slug,
      location: `${r.city}, ${r.state}`,
      cuisine: r.cuisine,
      title: r.bestItemTitle ?? r.name,
      description: r.bestItemDescription,
      price: r.bestItemPrice,
      currency: "USD",
      rating: r.rating,
      deliveryEtaMinutes: r.deliveryEtaMinutes,
      tags: r.tags ?? [],
      imageUrl: r.imageUrl,
      doordashRestaurantId: r.doordashRestaurantId,
      doordashUrl: r.doordashUrl,
    }));

    const artifact = {
      type: "meal_suggestions" as const,
      query,
      location,
      filters: {
        maxPrice,
        cuisine,
        dietaryTags,
      },
      suggestions,
    };

    // Save artifact
    const threadId = (ctx as any).threadId;
    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveMealSuggestionsArtifact, {
        threadId,
        artifact,
      });
    }

    return {
      type: "meal_suggestions",
      count: suggestions.length,
      summary: `Found ${suggestions.length} matching meals in ${location}.`,
    };
  },
});

/**
 * Add Meal to Order Plan Tool
 * 
 * Adds a suggested meal to the user's current order plan
 */
export const addMealToOrderPlan = createTool({
  description:
    "Add a suggested meal (by index or id) from the latest MealSuggestions artifact to the current order plan.",
  args: z.object({
    displayIndex: z.number().optional(),
    suggestionId: z.string().optional(),
    notes: z.string().optional(),
  }),
  handler: async (ctx, args) => {
    const { displayIndex, suggestionId, notes } = args;
    const threadId = (ctx as any).threadId;

    if (!threadId) {
      throw new Error("No thread context available");
    }

    // Fetch latest meal suggestions
    const artifact = await ctx.runQuery(
      api.artifacts_helpers.getLatestMealSuggestionsForThread,
      { threadId }
    );

    if (!artifact) {
      throw new Error("No meal suggestions found for this thread.");
    }

    const suggestion = artifact.suggestions.find((s: any) =>
      suggestionId ? s.id === suggestionId : s.displayIndex === displayIndex
    );

    if (!suggestion) {
      throw new Error("Requested suggestion not found.");
    }

    // Get or create order plan
    const orderPlan = await ctx.runQuery(api.order_plans.getByThread, { threadId });

    const item = {
      suggestionId: suggestion.id,
      restaurantName: suggestion.restaurantName,
      title: suggestion.title,
      price: suggestion.price,
      currency: suggestion.currency,
      imageUrl: suggestion.imageUrl,
      doordashUrl: suggestion.doordashUrl,
      notes,
    };

    if (!orderPlan) {
      await ctx.runMutation(internal.order_plans.create, {
        threadId,
        item,
      });
    } else {
      await ctx.runMutation(internal.order_plans.appendItem, {
        orderPlanId: orderPlan._id,
        item,
      });
    }

    return {
      status: "ok",
      added: {
        restaurantName: suggestion.restaurantName,
        title: suggestion.title,
      },
    };
  },
});
```

Then register the tools:

```typescript
export const mealoutpostAgent = new Agent(components.agent, {
  // ... existing config
  tools: {
    searchWebTool,
    mealPlanTool,
    suggestMealsFromDoorDash,  // NEW
    addMealToOrderPlan,         // NEW
  },
});
```

Update the agent instructions to mention these tools:

```typescript
instructions: `You are the unified founder agent for MealOutpost...

**Tool Usage Guidelines:**
- **suggestMealsFromDoorDash**: Call when user wants individual meal recommendations:
  - "Find me dinner options in Austin"
  - "Suggest spicy vegetarian meals under $20"
  - Always ask for location if not provided
  
- **addMealToOrderPlan**: Call when user selects meals:
  - "Add #3 to my plan"
  - "Add the spicy tofu bowl"
  - Reference meals by displayIndex or name

When showing meal suggestions, tell the user:
"I've found [N] options (see the carousel on the right). You can say 'Add #3' or click the buttons to add meals to your order plan."
`
```

## Step 6: Create Meal Suggestions UI Component

### app/components/MealSuggestionsCard.tsx

Simple card-based version (no Kibo Stories dependency needed):

```typescript
"use client";

import type { MealSuggestionsArtifact, MealSuggestion } from "@/lib/artifacts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

interface Props {
  artifact: MealSuggestionsArtifact;
  threadId: string;
}

export function MealSuggestionsCard({ artifact, threadId }: Props) {
  const addToPlan = useMutation(api.order_plans.addFromSuggestion);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAdd = async (suggestion: MealSuggestion) => {
    setAddingId(suggestion.id);
    try {
      await addToPlan({ threadId, suggestionId: suggestion.id });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
      {/* Header */}
      <header className="border-b pb-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          Meal Suggestions
        </div>
        <div className="text-sm font-medium text-slate-900 mt-1">
          "{artifact.query}"
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {artifact.location} • {artifact.suggestions.length} options
        </div>
      </header>

      {/* Meal Grid */}
      <div className="grid grid-cols-2 gap-2">
        {artifact.suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
          >
            {/* Background Image */}
            <img
              src={
                suggestion.imageUrl ??
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=533&fit=crop"
              }
              alt={suggestion.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              {/* Top: Index + Rating */}
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white bg-black/40 rounded-full px-2 py-0.5">
                  #{suggestion.displayIndex}
                </span>
                {suggestion.rating && (
                  <span className="text-xs text-white bg-black/40 rounded-full px-2 py-0.5">
                    ⭐ {suggestion.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Bottom: Info + Button */}
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white drop-shadow-lg line-clamp-2">
                  {suggestion.title}
                </div>
                <div className="text-[11px] text-white/90 drop-shadow line-clamp-1">
                  {suggestion.restaurantName}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/90 drop-shadow">
                    {suggestion.price != null
                      ? `$${suggestion.price.toFixed(2)}`
                      : "See menu"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdd(suggestion)}
                    disabled={addingId === suggestion.id}
                    className="text-[11px] px-3 py-1 rounded-full bg-white text-slate-900 hover:bg-white/90 font-medium disabled:opacity-50 transition-all"
                  >
                    {addingId === suggestion.id ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Step 7: Update ArtifactPanel

### app/components/ArtifactPanel.tsx

Add meal suggestions handling:

```typescript
import { MealSuggestionsCard } from "./MealSuggestionsCard";
import type { MealSuggestionsArtifact } from "@/lib/artifacts";

// In your ArtifactPanel function, add:
if (artifact.type === "meal_suggestions") {
  return (
    <MealSuggestionsCard
      artifact={artifact as MealSuggestionsArtifact}
      threadId={threadId}
    />
  );
}
```

## Step 8: Seed Sample Data

Create a simple seed script:

### scripts/seed-restaurants.ts

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const sampleRestaurants = [
  {
    name: "Green Lotus",
    city: "Austin",
    state: "TX",
    cuisine: "Vietnamese",
    rating: 4.5,
    bestItemTitle: "Spicy Tofu Bowl",
    bestItemDescription: "Crispy tofu with chili garlic sauce",
    bestItemPrice: 14.99,
    deliveryEtaMinutes: 25,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  },
  // Add 10-20 sample restaurants here
];

async function seed() {
  for (const restaurant of sampleRestaurants) {
    await client.mutation(api.restaurants.importRestaurant as any, restaurant);
  }
  console.log(`Seeded ${sampleRestaurants.length} restaurants`);
}

seed();
```

Run: `npx tsx scripts/seed-restaurants.ts`

## 🎉 Testing

1. **Start servers:**
   ```bash
   npx convex dev
   npm run dev
   ```

2. **Test in founder console:**
   ```
   "Find me 5 vegetarian dinner options in Austin under $20"
   ```

3. **Verify:**
   - Agent calls `suggestMealsFromDoorDash`
   - Meal cards appear in right sidebar
   - Click "Add" button or say "Add #3"
   - Order plan updates in database

## Next Steps

1. **Get DoorDash Kaggle dataset** and import full CSV
2. **Add Kibo UI Stories** for carousel layout
3. **Build order review page** showing complete order plan
4. **Add checkout flow** for finalizing orders

Complete implementation path is now clear! 🚀
