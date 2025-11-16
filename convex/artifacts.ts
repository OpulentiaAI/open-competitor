import { z } from "zod";

/**
 * ProgramPlanArtifact schema for Convex server code.
 *
 * NOTE: This file intentionally lives inside the `convex/` directory so it can
 * be imported by Convex actions without relying on cross-root imports.
 */
export const ProgramPlanArtifactSchema = z.object({
  type: z.literal("program_plan"),
  companyId: z.string(),
  officeId: z.string(),
  timeRange: z.object({
    startDate: z
      .string()
      .describe("ISO date (YYYY-MM-DD) when the program starts"),
    endDate: z
      .string()
      .describe("ISO date (YYYY-MM-DD) when the program ends"),
  }),
  budgetPerPerson: z
    .number()
    .positive()
    .optional()
    .describe("Target budget per person per day in the company currency"),
  currency: z.string().default("USD"),
  mealsByDay: z
    .array(
      z.object({
        date: z.string().describe("ISO date for this day"),
        notes: z.string().optional(),
        meals: z.array(
          z.object({
            name: z.string(),
            type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
            cuisine: z.string().optional(),
            dietaryTags: z.array(z.string()).default([]),
            vendorHint: z
              .string()
              .optional()
              .describe(
                "Optional vendor/restaurant hint the planner had in mind",
              ),
            estimatedPricePerPerson: z.number().positive().optional(),
            description: z.string().optional(),
          }),
        ),
      }),
    )
    .default([]),
  constraints: z
    .object({
      maxBudgetPerPerson: z
        .number()
        .positive()
        .optional()
        .describe("Hard ceiling on budget per person per day"),
      dietarySummary: z
        .string()
        .optional()
        .describe("Natural language summary of key dietary constraints"),
      serviceDaysPerWeek: z
        .number()
        .int()
        .min(1)
        .max(7)
        .optional(),
    })
    .partial()
    .default({}),
  notes: z
    .string()
    .optional()
    .describe(
      "Free-form rationale, tradeoffs, or implementation notes for this plan",
    ),
});

export type ProgramPlanArtifact = z.infer<typeof ProgramPlanArtifactSchema>;

/**
 * LeadQualificationArtifact schema
 * 
 * Structured output from lead research and qualification
 */
export const LeadQualificationArtifactSchema = z.object({
  type: z.literal("lead_qualification"),
  companyName: z.string(),
  website: z.string().optional(),
  sizeBucket: z.enum(["1-20", "21-100", "101-500", "500+"]).nullable(),
  vertical: z.string().nullable(),
  idealFitScore: z.number().min(0).max(100),
  idealFitReason: z.string(),
  recommendedNextStep: z.string(),
  notes: z.string().optional(),
});

export type LeadQualificationArtifact = z.infer<typeof LeadQualificationArtifactSchema>;

/**
 * SearchResultArtifact schema
 * 
 * Captures web search results from searchWebTool
 */
export const SearchResultArtifactSchema = z.object({
  type: z.literal("search_result"),
  query: z.string(),
  results: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      summary: z.string().optional(),
      source: z.string().optional(),
    }),
  ),
});

export type SearchResultArtifact = z.infer<typeof SearchResultArtifactSchema>;

/**
 * ToolRunArtifact schema
 * 
 * Records tool execution for debugging and transparency
 */
export const ToolRunArtifactSchema = z.object({
  type: z.literal("tool_run"),
  toolName: z.string(),
  status: z.enum(["pending", "ok", "error"]),
  input: z.record(z.any()).optional(),
  outputSummary: z.string().optional(),
  error: z.string().optional(),
});

export type ToolRunArtifact = z.infer<typeof ToolRunArtifactSchema>;

/**
 * MealSuggestion schema
 * 
 * Individual meal suggestion from DoorDash-style restaurant data
 */
export const MealSuggestionSchema = z.object({
  id: z.string(), // stable id for selection
  displayIndex: z.number(), // 1-based index for "add #3" commands
  restaurantName: z.string(),
  restaurantSlug: z.string().optional(),
  location: z.string().optional(), // e.g. "San Francisco, CA"
  cuisine: z.string().optional(),
  title: z.string(), // meal name / menu item
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().default("USD"),
  rating: z.number().min(0).max(5).optional(),
  deliveryEtaMinutes: z.number().optional(),
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().url().optional(),
  doordashRestaurantId: z.string().optional(),
  doordashUrl: z.string().optional(),
});

/**
 * MealSuggestionsArtifact schema
 * 
 * Collection of meal suggestions from DoorDash data
 */
export const MealSuggestionsArtifactSchema = z.object({
  type: z.literal("meal_suggestions"),
  query: z.string(), // "spicy vegetarian bowls under $20"
  location: z.string(), // resolved delivery location
  filters: z
    .object({
      maxPrice: z.number().optional(),
      minRating: z.number().optional(),
      cuisine: z.string().optional(),
      dietaryTags: z.array(z.string()).optional(),
    })
    .partial()
    .optional(),
  suggestions: z.array(MealSuggestionSchema),
});

export type MealSuggestion = z.infer<typeof MealSuggestionSchema>;
export type MealSuggestionsArtifact = z.infer<typeof MealSuggestionsArtifactSchema>;
