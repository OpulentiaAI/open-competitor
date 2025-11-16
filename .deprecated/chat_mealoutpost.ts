import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mealoutpostAgent } from "./agent_mealoutpost";
import { saveMessage } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { internal } from "./_generated/api";

/**
 * Create a new thread and send the first message
 * Returns threadId and messageId for tracking
 */
export const startThread = mutation({
  args: {
    userId: v.optional(v.string()),
    prompt: v.string(),
  },
  handler: async (ctx, { userId, prompt }) => {
    // Create thread using Convex Agent component
    const { threadId } = await mealoutpostAgent.createThread(ctx, { userId });
    
    // Save user message
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
      userId,
    });

    // Kick off async response generation
    await ctx.scheduler.runAfter(0, internal.chat_mealoutpost.generateResponse, {
      threadId: threadId as any,
      promptMessageId: messageId,
      userId,
    });

    return { 
      threadId, 
      promptMessageId: messageId 
    };
  },
});

/**
 * Send a message to an existing thread
 */
export const sendMessage = mutation({
  args: {
    threadId: v.id("threads"),
    userId: v.optional(v.string()),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, userId, prompt }) => {
    // Save user message
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
      userId,
    });

    // Kick off async response generation
    await ctx.scheduler.runAfter(0, internal.chat_mealoutpost.generateResponse, {
      threadId: threadId as any,
      promptMessageId: messageId,
      userId,
    });

    return { messageId };
  },
});

/**
 * Internal action that generates AI response
 * This is async and will stream deltas to the thread
 */
export const generateResponse = internalAction({
  args: {
    threadId: v.id("threads"),
    promptMessageId: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, { threadId, promptMessageId, userId }) => {
    try {
      await mealoutpostAgent.generateText(
        ctx,
        { threadId, userId },
        { promptMessageId }
      );
    } catch (error) {
      console.error("[generateResponse] Error:", error);
      throw error;
    }
  },
});

/**
 * List messages for a thread
 */
export const listMessages = query({
  args: {
    threadId: v.id("threads"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, limit = 50 }) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", threadId))
      .order("desc")
      .take(limit);

    return messages.reverse(); // Chronological order
  },
});

/**
 * Get thread by ID
 */
export const getThread = query({
  args: {
    threadId: v.id("threads"),
  },
  handler: async (ctx, { threadId }) => {
    return await ctx.db.get(threadId);
  },
});

/**
 * List all threads for a user
 */
export const listUserThreads = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 20 }) => {
    if (!userId) {
      return [];
    }

    const threads = await ctx.db
      .query("threads")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .take(limit);

    return threads;
  },
});
