import { Agent, createTool } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { components } from "./_generated/api";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";

// Configure OpenRouter as OpenAI-compatible endpoint
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const languageModel = openrouter("anthropic/claude-3.5-sonnet");

/**
 * Search Web Tool - Research markets, competitors, vendors
 * Uses Firecrawl for search + extraction in one call
 */
export const searchWebTool = createTool({
  description:
    "Search the web and return cleaned content for founder research (markets, competitors, vendors, industry trends, etc.)",
  args: z.object({
    query: z.string().describe("Search query, e.g. 'office catering NYC startup pricing'"),
    limit: z.number().min(1).max(10).optional().describe("Max number of search results"),
  }),
  handler: async (ctx, { query, limit }): Promise<{
    query: string;
    results: Array<{
      title: string;
      url: string;
      summary?: string;
      content?: string;
      source?: string;
    }>;
  }> => {
    if (!process.env.FIRECRAWL_API_KEY) {
      console.warn("[searchWebTool] FIRECRAWL_API_KEY not set");
      return { query, results: [] };
    }

    try {
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          limit: limit ?? 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!res.ok) {
        console.error("[searchWebTool] Firecrawl error:", await res.text());
        return { query, results: [] };
      }

      const data = await res.json();
      const results =
        data?.data?.map((item: any) => ({
          title: item.title ?? item.url ?? "Untitled result",
          url: item.url,
          summary: item.summary ?? undefined,
          content: item.markdown ?? item.content ?? undefined,
          source: item.source ?? undefined,
        })) ?? [];

      return { query, results };
    } catch (error) {
      console.error("[searchWebTool] Error:", error);
      return { query, results: [] };
    }
  },
});

/**
 * Meal Plan Tool - Design structured office meal programs
 */
export const mealPlanTool = createTool({
  description:
    "Design a structured multi-day office meal program using MealOutpost patterns. Creates comprehensive meal schedules with dietary considerations, budget optimization, and nutritional balance.",
  args: z.object({
    companyName: z.string().describe("Company name (e.g. 'Acme Inc')"),
    officeId: z.string().describe("Office identifier (e.g. 'nyc-hq', 'sf-office')"),
    startDate: z.string().describe("Start date in ISO 8601 format (YYYY-MM-DD), e.g. '2025-12-01'"),
    endDate: z.string().describe("End date in ISO 8601 format (YYYY-MM-DD), e.g. '2025-12-05'"),
    budgetPerPerson: z.number().optional().describe("Optional budget per person per day in USD"),
    constraints: z.string().optional().describe("Optional dietary constraints and preferences (e.g. 'vegetarian options daily, no pork, gluten-free available')"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    companyId?: string;
    programPlanId?: string;
    artifact?: unknown;
    error?: string;
  }> => {
    try {
      const result = await ctx.runAction(api.actions.designProgramPlan, {
        companyName: args.companyName,
        officeId: args.officeId,
        startDate: args.startDate,
        endDate: args.endDate,
        budgetPerPerson: args.budgetPerPerson,
        currency: "USD",
        constraints: args.constraints,
      });

      if (!result.success) {
        return { success: false, error: result.error ?? "Unknown error" };
      }

      return {
        success: true,
        companyId: String(result.companyId),
        programPlanId: String(result.programPlanId),
        artifact: result.artifact,
      };
    } catch (error) {
      console.error("[mealPlanTool] Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      };
    }
  },
});

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
  handler: async (ctx, args): Promise<{
    type: string;
    count: number;
    summary: string;
  }> => {
    const { location, query, maxPrice, cuisine, dietaryTags, limit } = args;

    // Query Convex restaurants table
    const candidates: any[] = await ctx.runQuery(api.restaurants.searchForSuggestions as any, {
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
      await ctx.runMutation(internal.artifacts_helpers.saveMealSuggestionsArtifact as any, {
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
  handler: async (ctx, args): Promise<{
    status: string;
    added: { restaurantName: string; title: string };
  }> => {
    const { displayIndex, suggestionId, notes } = args;
    const threadId = (ctx as any).threadId;

    if (!threadId) {
      throw new Error("No thread context available");
    }

    // Fetch latest meal suggestions
    const artifact: any = await ctx.runQuery(
      api.artifacts_helpers.getLatestMealSuggestionsForThread as any,
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
    const orderPlan: any = await ctx.runQuery(api.order_plans.getByThread as any, { threadId });

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
      await ctx.runMutation(internal.order_plans.create as any, {
        threadId,
        item,
      });
    } else {
      await ctx.runMutation(internal.order_plans.appendItem as any, {
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

/**
 * Unified MealOutpost Assistant
 * 
 * Single agent that handles:
 * - Meal program planning
 * - Lead qualification (future)
 * - Analytics queries (future)
 * - General Q&A about MealOutpost
 */
export const mealoutpostAgent = new Agent(components.agent, {
  name: "MealOutpost Founder Agent",
  chat: languageModel as any,
  instructions: `You are the unified founder agent for MealOutpost - a strategic assistant for founders building their office meal program business.

**Core Capabilities:**
1. **Q&A**: Answer general questions about strategy, product, operations, and meal planning best practices. Use your reasoning first.
2. **Web Research**: For questions about markets, competitors, vendors, or industry trends, use searchWebTool to get current data.
3. **Program Planning**: Design structured meal programs using mealPlanTool.
4. **Lead Qualification**: Research and score potential customers (coming soon).
5. **Analytics**: Query and analyze business metrics (coming soon).

**Tool Usage Guidelines:**
- **searchWebTool**: Call when the user needs external data:
  - Market research ("What are competitors charging?")
  - Vendor discovery ("Find catering vendors in Boston")
  - Industry benchmarks ("Average office lunch budgets")
  - MODE:SEARCH queries (always search for these)
  
- **mealPlanTool**: Call when designing/creating a meal program:
  - Specific date ranges and budgets
  - Office-specific meal schedules
  - Dietary constraint planning

- **suggestMealsFromDoorDash**: Call when user wants individual meal recommendations:
  - "Find me dinner options in Austin"
  - "Suggest spicy vegetarian meals under $20"
  - Always ask for location if not provided
  - Tell user they can browse the carousel and say "Add #3"
  
- **addMealToOrderPlan**: Call when user selects meals:
  - "Add #3 to my plan"
  - "Add the spicy tofu bowl"
  - Reference meals by displayIndex or name

**Important Rules:**
- If a question can be answered from your own knowledge, answer directly without tools
- Never hallucinate tool results - only call a tool if clearly needed
- When using searchWebTool, cite sources with URLs
- After calling tools, save artifacts and mention they're accessible in the sidebar

**Response Style:**
- Be concise, structured, and action-focused
- Use markdown formatting for clarity
- Provide concrete next steps when applicable
- Always prioritize founder productivity`,
  tools: {
    searchWebTool,
    mealPlanTool,
    suggestMealsFromDoorDash,
    addMealToOrderPlan,
    // Future: qualifyLeadTool, analyticsTool
  },
});
