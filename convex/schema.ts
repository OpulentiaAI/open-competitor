import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the database schema for the Convex backend
// Includes tables for conversation threads, messages, and file management
const schema = defineSchema({
  threads: defineTable({
    userId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.any()),
  }),

  messages: defineTable({
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
    metadata: v.optional(v.any()),
  }).index("by_thread", ["threadId"]),

  files: defineTable({
    storageId: v.id("_storage"),
    filename: v.string(),
    mimeType: v.string(),
    size: v.number(),
    createdAt: v.number(),
  }),

  // Company-level configuration and metadata for MealOutpost programs
  companies: defineTable({
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    metadata: v.optional(v.any()),
  }),

  // Persisted office meal program plans backed by ProgramPlanArtifact
  program_plans: defineTable({
    companyId: v.id("companies"),
    officeId: v.string(),
    artifact: v.any(), // Validated at the edge using ProgramPlanArtifactSchema
    threadId: v.optional(v.id("threads")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_company_office", ["companyId", "officeId"]),

  // DoorDash-style restaurant data for meal suggestions
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
      filterFields: ["city", "cuisine"],
    }),

  // Order plans - meals selected by users
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

  // Meal suggestions artifacts
  meal_suggestions: defineTable({
    threadId: v.optional(v.string()),
    artifact: v.any(),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),

  // Unified artifacts table for all agent outputs
  artifacts: defineTable({
    threadId: v.id("threads"),
    type: v.string(), // "presentation", "research_report", "youtube_transcript", "google_doc", etc.
    title: v.string(),
    payload: v.any(),
    meta: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),

  // TODO/Planning lists for task management
  todos: defineTable({
    threadId: v.id("threads"),
    userId: v.optional(v.string()),
    content: v.string(), // Markdown formatted todo list
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_thread", ["threadId"]),
});

export default schema;