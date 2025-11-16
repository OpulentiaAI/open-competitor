import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateText, generateObject } from "ai";
import { createAgent, SUPER_AGENT_PROMPT, MODELS } from "./agents";
import { api } from "./_generated/api";
import { youtubeTools } from "./tools";
import { ProgramPlanArtifactSchema } from "./artifacts";

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
  handler: async (ctx, { threadId, message }): Promise<{ success: boolean; threadId?: any; response?: string; error?: string }> => {
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
  handler: async (_ctx, { videoUrl, lang = "en" }) => {
    try {
      const result = await youtubeTools.getTranscript.execute(
        { videoUrl, lang },
        { 
          toolCallId: 'transcript-call',
          messages: [],
          abortSignal: undefined
        }
      );
      
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
  handler: async (_ctx, { videoUrl }) => {
    try {
      const result = await youtubeTools.getVideoInfo.execute(
        { videoUrl },
        { 
          toolCallId: 'info-call',
          messages: [],
          abortSignal: undefined
        }
      );
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const designProgramPlan = action({
  args: {
    companyId: v.optional(v.id("companies")),
    companyName: v.string(),
    officeId: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    budgetPerPerson: v.optional(v.number()),
    currency: v.optional(v.string()),
    constraints: v.optional(v.string()),
    threadId: v.optional(v.id("threads")),
  },
  handler: async (ctx, args): Promise<{ success: boolean; companyId?: any; programPlanId?: any; artifact?: any; error?: string }> => {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY not configured");
      }

      const agent = createAgent(apiKey);

      // Get or create company
      let companyId = args.companyId;
      if (!companyId) {
        companyId = await ctx.runMutation(api.companies.create, {
          name: args.companyName,
        });
      } else {
        await ctx.runMutation(api.companies.update, {
          companyId,
        });
      }

      const prompt = `You are an expert office meal program planner for workplace hospitality.

Design a coherent multi-day meal program for employees at the company described below.

Company: ${args.companyName}
Office ID: ${args.officeId}
Date range: ${args.startDate} to ${args.endDate}
Budget per person (if provided): ${args.budgetPerPerson ?? "not specified"}
Currency (if provided): ${args.currency ?? "USD"}
Additional constraints or notes (if provided): ${args.constraints ?? "none"}.

Return only a JSON object matching the provided schema. Use realistic meals and respect dietary, budget, and scheduling constraints.`;

      const { object } = await generateObject({
        model: agent(MODELS.MINIMAX_M2),
        schema: ProgramPlanArtifactSchema,
        prompt,
      });

      const artifact = ProgramPlanArtifactSchema.parse({
        ...object,
        type: "program_plan",
        companyId: String(companyId),
        officeId: args.officeId,
        timeRange: {
          startDate: args.startDate,
          endDate: args.endDate,
        },
        budgetPerPerson: args.budgetPerPerson,
        currency: args.currency ?? "USD",
      });

      // Create program plan via mutation
      const programPlanId = await ctx.runMutation(api.program_plans.create, {
        companyId,
        officeId: args.officeId,
        artifact,
        threadId: args.threadId,
      });

      return {
        success: true,
        companyId,
        programPlanId,
        artifact,
      };
    } catch (error) {
      console.error("designProgramPlan error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});