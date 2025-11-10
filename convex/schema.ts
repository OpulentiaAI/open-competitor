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
});

export default schema;
