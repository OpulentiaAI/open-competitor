import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { founderAgent } from "./agent_founder";
import { researchAgent } from "./agent_research";
import { docsSheetsAgent } from "./agent_docs_sheets";
import { mediaAgent } from "./agent_media";
import { youtubeTools } from "./tools";
import { todoSetTool, todoGetTool } from "./tools_todo";
import { internal } from "./_generated/api";

/**
 * Central Tool Registry for SuperAgent
 * All capabilities exposed as tools including subagents
 */

// ==================== SUBAGENT TOOLS ====================

/**
 * Founder Agent Tool
 * Wraps the founder/MealOutpost specialist agent
 */
export const founderAgentTool = createTool({
  description: "Ask the Founder Agent for MealOutpost-specific strategy, meal programs, lead insights, and business intelligence. Use when user discusses office meals, catering, programs, or MealOutpost business operations.",
  args: z.object({
    message: z.string().describe("The message or question to send to the Founder Agent."),
  }),
  handler: async (ctx, args, options): Promise<string> => {
    const { userId } = ctx;

    // Create child thread for subagent
    const { threadId: childThreadId } = await founderAgent.createThread(ctx, { userId });

    const result = await founderAgent.generateText(
      ctx,
      { threadId: childThreadId, userId },
      { prompt: args.message },
    );

    return result.text;
  },
});

/**
 * Research Agent Tool
 * Wraps the deep research and market intelligence agent
 */
export const researchAgentTool = createTool({
  description: "Conduct deep research, market analysis, competitive intelligence, or vendor discovery. Use for comprehensive investigation of markets, trends, competitors, or industry benchmarks.",
  args: z.object({
    message: z.string().describe("The research question or investigation request."),
  }),
  handler: async (ctx, args, options): Promise<string> => {
    const { userId } = ctx;

    const { threadId: childThreadId } = await researchAgent.createThread(ctx, { userId });

    const result = await researchAgent.generateText(
      ctx,
      { threadId: childThreadId, userId },
      { prompt: args.message },
    );

    return result.text;
  },
});

/**
 * Docs & Sheets Agent Tool
 * Wraps the document and spreadsheet operations agent
 */
export const docsSheetsAgentTool = createTool({
  description: "Create or manage Google Docs and Google Sheets. Use for document creation, spreadsheet data manipulation, or data analysis tasks.",
  args: z.object({
    message: z.string().describe("The document/spreadsheet operation request."),
  }),
  handler: async (ctx, args, options): Promise<string> => {
    const { userId } = ctx;

    const { threadId: childThreadId } = await docsSheetsAgent.createThread(ctx, { userId });

    const result = await docsSheetsAgent.generateText(
      ctx,
      { threadId: childThreadId, userId },
      { prompt: args.message },
    );

    return result.text;
  },
});

/**
 * Media Agent Tool
 * Wraps the multimedia content generation agent
 */
export const mediaAgentTool = createTool({
  description: "Generate presentations, images, or video content. Use for slide decks, visual assets, promotional materials, or multimedia production.",
  args: z.object({
    message: z.string().describe("The media generation request."),
  }),
  handler: async (ctx, args, options): Promise<string> => {
    const { userId } = ctx;

    const { threadId: childThreadId } = await mediaAgent.createThread(ctx, { userId });

    const result = await mediaAgent.generateText(
      ctx,
      { threadId: childThreadId, userId },
      { prompt: args.message },
    );

    return result.text;
  },
});

// ==================== DIRECT TOOLS ====================

/**
 * YouTube Transcript Tool
 */
export const youtube_getTranscript = createTool({
  description: "Get the transcript/captions from a YouTube video. Provide either a full YouTube URL or just the video ID.",
  args: z.object({
    videoUrl: z.string().describe("YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID) or just the video ID"),
    lang: z.string().optional().default("en").describe("Language code for transcript (e.g., 'en', 'es', 'fr')"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    videoId?: string;
    transcript?: string;
    segments?: number;
    language?: string;
    error?: string;
    hint?: string;
  }> => {
    const threadId = (ctx as any).threadId;

    // Execute the YouTube tool
    const result = await youtubeTools.getTranscript.execute(args, {} as any);

    // Save as artifact if successful
    if (result.success && threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "youtube_transcript",
        title: `YouTube Transcript: ${result.videoId}`,
        payload: {
          videoId: result.videoId,
          transcript: result.transcript,
          language: result.language,
          createdAt: Date.now(),
        },
      });
    }

    return result;
  },
});

/**
 * YouTube Video Info Tool
 */
export const youtube_getVideoInfo = createTool({
  description: "Get information about a YouTube video including title, description, duration, and view count",
  args: z.object({
    videoUrl: z.string().describe("YouTube video URL or video ID"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    videoId?: string;
    title?: string;
    author?: string;
    duration?: number;
    viewCount?: number;
    likeCount?: number;
    description?: string;
    publishDate?: string;
    error?: string;
  }> => {
    return await youtubeTools.getVideoInfo.execute(args, {} as any);
  },
});

/**
 * Web Search Tool
 * Quick web search for specific information
 */
export const web_search = createTool({
  description: "Search the web for current information, news, or specific facts. Returns summaries and sources.",
  args: z.object({
    query: z.string().describe("Search query"),
    limit: z.number().min(1).max(10).optional().default(5).describe("Max number of results"),
  }),
  handler: async (ctx, args): Promise<{
    query: string;
    results: Array<{
      title: string;
      url: string;
      summary?: string;
    }>;
  }> => {
    const { query, limit } = args;

    if (!process.env.FIRECRAWL_API_KEY) {
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
          limit: limit || 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (!res.ok) {
        return { query, results: [] };
      }

      const data = await res.json();
      const results = data?.data?.map((item: any) => ({
        title: item.title || "Untitled",
        url: item.url,
        summary: item.summary,
      })) || [];

      return { query, results };
    } catch (error) {
      return { query, results: [] };
    }
  },
});

// ==================== TOOL REGISTRY ====================

/**
 * All SuperAgent tools
 * Orchestrator decides which to use based on context
 */
export const superAgentTools = {
  // Subagents
  founderAgentTool,
  researchAgentTool,
  docsSheetsAgentTool,
  mediaAgentTool,

  // Direct tools
  youtube_getTranscript,
  youtube_getVideoInfo,
  web_search,
  
  // Planning tools
  todoSetTool,
  todoGetTool,
};

/**
 * Typed tool names for reference
 */
export const SUPER_AGENT_TOOL_NAMES = [
  "founderAgentTool",
  "researchAgentTool",
  "docsSheetsAgentTool",
  "mediaAgentTool",
  "youtube_getTranscript",
  "youtube_getVideoInfo",
  "web_search",
  "todoSetTool",
  "todoGetTool",
] as const;
