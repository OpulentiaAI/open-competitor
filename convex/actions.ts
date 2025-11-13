import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { createAgent, SUPER_AGENT_PROMPT, MODELS } from "./agents";
import { api } from "./_generated/api";
import { youtubeTools } from "./tools";

/**
 * Public API actions for the Convex backend
 * These provide type-safe, scalable endpoints for AI interactions
 */

/**
 * Send a chat message and get a response
 * Now includes YouTube transcription tools
 */
export const chat = action({
  args: {
    threadId: v.optional(v.id("threads")),
    message: v.string(),
  },
  handler: async (ctx, { threadId, message }) => {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY not configured");
      }

      // Create or use existing thread
      let actualThreadId = threadId;
      if (!actualThreadId) {
        actualThreadId = await ctx.runMutation(api.threads.create, {});
      }
      
      // Save user message
      await ctx.runMutation(api.messages.add, {
        threadId: actualThreadId,
        role: "user",
        content: message,
      });

      // Generate AI response with YouTube tools
      const agent = createAgent(apiKey);
      const { text } = await generateText({
        model: agent(MODELS.CLAUDE_SONNET),
        system: SUPER_AGENT_PROMPT,
        prompt: message,
        tools: youtubeTools,
        maxSteps: 5, // Allow multi-step tool usage
      });

      // Save assistant message
      await ctx.runMutation(api.messages.add, {
        threadId: actualThreadId,
        role: "assistant",
        content: text,
      });

      return {
        success: true,
        threadId: actualThreadId,
        response: text,
      };
    } catch (error) {
      console.error("Chat error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Get YouTube video transcript
 */
export const getYouTubeTranscript = action({
  args: {
    videoUrl: v.string(),
    lang: v.optional(v.string()),
  },
  handler: async (ctx, { videoUrl, lang = "en" }) => {
    try {
      const result = await youtubeTools.getTranscript.execute({
        videoUrl,
        lang,
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

/**
 * Get YouTube video information
 */
export const getYouTubeInfo = action({
  args: {
    videoUrl: v.string(),
  },
  handler: async (ctx, { videoUrl }) => {
    try {
      const result = await youtubeTools.getVideoInfo.execute({
        videoUrl,
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});