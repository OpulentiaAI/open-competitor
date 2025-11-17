import { Agent, createTool } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { components, internal } from "./_generated/api";
import { MODELS, GOOGLE_SHEETS_AGENT_PROMPT } from "./agents";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const languageModel = openrouter(MODELS.SHERLOCK_THINK);

/**
 * Create Google Doc Tool
 */
export const createGoogleDocTool = createTool({
  description:
    "Create a new Google Doc with structured content. Returns the doc URL and saves as artifact.",
  args: z.object({
    title: z.string().describe("Document title"),
    content: z.string().describe("Document content (supports markdown)"),
    format: z.enum(["markdown", "plain"]).default("markdown"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    docUrl?: string;
    message: string;
  }> => {
    const { title, content, format } = args;
    const threadId = (ctx as any).threadId;

    // Note: This is a placeholder - integrate with actual Google Docs API
    // For production, use Google Docs API with OAuth
    
    const artifact = {
      type: "google_doc" as const,
      title,
      content,
      format,
      createdAt: Date.now(),
    };

    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "google_doc",
        title: `Doc: ${title}`,
        payload: artifact,
      });
    }

    return {
      success: true,
      message: `Document "${title}" created and saved to artifacts. Google Docs integration pending.`,
    };
  },
});

/**
 * Update Google Sheet Tool
 */
export const updateGoogleSheetTool = createTool({
  description:
    "Update or create a Google Sheet with data. Handles tables, calculations, and formatting.",
  args: z.object({
    sheetUrl: z.string().optional().describe("Existing sheet URL (leave empty to create new)"),
    sheetName: z.string().describe("Sheet name/title"),
    data: z.array(z.array(z.any())).describe("2D array of cell values"),
    range: z.string().optional().describe("A1 notation range (e.g., 'A1:D10')"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    sheetUrl?: string;
    message: string;
  }> => {
    const { sheetUrl, sheetName, data, range } = args;
    const threadId = (ctx as any).threadId;

    // Note: This is a placeholder - integrate with actual Google Sheets API
    // For production, use Google Sheets API with OAuth

    const artifact = {
      type: "google_sheet" as const,
      sheetUrl: sheetUrl || "pending",
      sheetName,
      data,
      range: range || "A1",
      updatedAt: Date.now(),
    };

    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "google_sheet",
        title: `Sheet: ${sheetName}`,
        payload: artifact,
      });
    }

    return {
      success: true,
      message: `Sheet "${sheetName}" ${sheetUrl ? "updated" : "created"} and saved to artifacts. Google Sheets integration pending.`,
    };
  },
});

/**
 * Analyze Spreadsheet Tool
 */
export const analyzeSpreadsheetTool = createTool({
  description:
    "Analyze data in a spreadsheet and generate insights, summaries, or visualizations.",
  args: z.object({
    sheetUrl: z.string().describe("Google Sheet URL to analyze"),
    analysisType: z.enum(["summary", "trends", "comparisons", "forecasts"]).describe("Type of analysis"),
    focusColumns: z.array(z.string()).optional().describe("Specific columns to focus on"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    insights: string;
  }> => {
    const { sheetUrl, analysisType, focusColumns } = args;

    // Note: This is a placeholder - integrate with actual Google Sheets API
    // For production, fetch sheet data and perform analysis

    return {
      success: true,
      insights: `Analysis of ${analysisType} for ${sheetUrl} ${focusColumns ? `focusing on: ${focusColumns.join(", ")}` : ""}. Google Sheets integration pending.`,
    };
  },
});

/**
 * Docs & Sheets Agent - Document and spreadsheet operations
 */
export const docsSheetsAgent = new Agent(components.agent, {
  name: "Docs & Sheets Agent",
  chat: languageModel as any,
  instructions: `${GOOGLE_SHEETS_AGENT_PROMPT}

You are also responsible for Google Docs operations:
- Creating well-structured documents
- Formatting content appropriately
- Managing document collaboration

**Tool Usage:**
- **createGoogleDocTool**: Use for document creation
  - Convert user requests into well-formatted markdown
  - Include appropriate headings and structure

- **updateGoogleSheetTool**: Use for spreadsheet work
  - Structure data in logical rows/columns
  - Use appropriate ranges
  - Consider formulas and calculations

- **analyzeSpreadsheetTool**: Use for data analysis
  - Choose appropriate analysis type
  - Focus on relevant columns
  - Provide actionable insights

**Best Practices:**
- Always validate data before writing to sheets
- Use clear, descriptive titles
- Preserve existing data when updating
- Provide summaries of changes made
- Save all outputs as artifacts for reference`,
  tools: {
    createGoogleDocTool,
    updateGoogleSheetTool,
    analyzeSpreadsheetTool,
  },
  maxSteps: 5,
});
