import { internalAction, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { superAgent } from "./agent_superagent";
import { saveMessage } from "@convex-dev/agent";
import { components, internal } from "./_generated/api";

/**
 * SuperAgent Chat Module
 * Unified chat interface using the orchestrator superagent
 */

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
    // Create agent thread using SuperAgent (agent's internal thread store)
    const { threadId: agentThreadId } = await superAgent.createThread(ctx, {
      userId,
    });

    // Create Convex thread document to track this conversation in our own schema
    const convexThreadId = await ctx.db.insert("threads", {
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: { agentThreadId },
    });

    // Save user message into the agent's message log
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: agentThreadId,
      prompt,
      userId,
    });

    // Kick off async response generation, keyed by our Convex thread id
    await ctx.scheduler.runAfter(0, internal.chat_superagent.generateResponse, {
      threadId: convexThreadId,
      promptMessageId: messageId,
      userId,
    });

    return {
      threadId: convexThreadId,
      promptMessageId: messageId,
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
    // Look up the Convex thread to find the associated agent thread id
    const threadDoc = await ctx.db.get(threadId);
    if (!threadDoc) {
      throw new Error(`Thread ${threadId} not found`);
    }
    const agentThreadId = (threadDoc.metadata as any)?.agentThreadId ?? threadId;

    // Save user message into the agent's message log
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: agentThreadId,
      prompt,
      userId,
    });

    // Kick off async response generation, keyed by our Convex thread id
    await ctx.scheduler.runAfter(0, internal.chat_superagent.generateResponse, {
      threadId,
      promptMessageId: messageId,
      userId,
    });

    return { messageId };
  },
});

/**
 * Helper query to get thread metadata
 * Used by generateResponse action to resolve agentThreadId
 */
export const getThreadMetadata = query({
  args: { threadId: v.id("threads") },
  handler: async (ctx, { threadId }) => {
    const threadDoc = await ctx.db.get(threadId);
    if (!threadDoc) {
      throw new Error(`Thread ${threadId} not found`);
    }
    const agentThreadId = (threadDoc.metadata as any)?.agentThreadId;
    if (!agentThreadId) {
      throw new Error(`Missing agentThreadId for thread ${threadId}`);
    }
    return { agentThreadId };
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
      // Actions must use runQuery to access DB
      const { agentThreadId } = await ctx.runQuery(internal.chat_superagent.getThreadMetadata, {
        threadId,
      });

      await superAgent.generateText(
        ctx,
        { threadId: agentThreadId, userId },
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
    const threadDoc = await ctx.db.get(threadId);
    if (!threadDoc) {
      throw new Error(`Thread ${threadId} not found`);
    }
    const agentThreadId = (threadDoc.metadata as any)?.agentThreadId ?? threadId;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_thread", (q) => q.eq("threadId", agentThreadId))
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

/**
 * Alternative: Use SuperAgent's built-in action helper
 * This is equivalent to generateResponse above
 */
export const generateResponseAlt = superAgent.asTextAction();

/**
 * Create thread using SuperAgent's built-in helper
 */
export const createThread = superAgent.createThreadMutation();
