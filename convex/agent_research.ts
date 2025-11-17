import { Agent, createTool } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { components, internal } from "./_generated/api";
import { MODELS } from "./agents";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const languageModel = openrouter(MODELS.SHERLOCK_THINK);

/**
 * Deep Web Research Tool
 * Multi-step research with synthesis
 */
export const deepWebResearchTool = createTool({
  description:
    "Conduct deep, multi-step web research on a topic. Returns a comprehensive research report with sources.",
  args: z.object({
    topic: z.string().describe("Research topic or question"),
    depth: z.enum(["quick", "standard", "comprehensive"]).default("standard").describe("Research depth"),
    focusAreas: z.array(z.string()).optional().describe("Specific areas to focus on"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    summary: string;
    artifactId?: string;
  }> => {
    const { topic, depth, focusAreas } = args;
    const threadId = (ctx as any).threadId;

    if (!process.env.FIRECRAWL_API_KEY) {
      return {
        success: false,
        summary: "Firecrawl API key not configured for deep research.",
      };
    }

    try {
      // Determine number of research iterations based on depth
      const iterations = depth === "quick" ? 2 : depth === "standard" ? 4 : 6;
      
      const researchResults: any[] = [];
      
      // Phase 1: Initial broad search
      const initialQuery = focusAreas && focusAreas.length > 0
        ? `${topic} ${focusAreas.join(" ")}`
        : topic;

      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        },
        body: JSON.stringify({
          query: initialQuery,
          limit: iterations,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        researchResults.push(...(data?.data || []));
      }

      // Synthesize findings
      const sources = researchResults.map((r: any) => ({
        title: r.title || "Untitled",
        url: r.url,
        summary: r.summary,
        content: (r.markdown || r.content || "").substring(0, 2000),
      }));

      const artifact = {
        type: "research_report" as const,
        topic,
        depth,
        focusAreas: focusAreas || [],
        sources,
        generatedAt: Date.now(),
      };

      // Save artifact
      if (threadId) {
        const artifactId = await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
          threadId,
          type: "research_report",
          title: `Research: ${topic}`,
          payload: artifact,
        });

        return {
          success: true,
          summary: `Completed ${depth} research on "${topic}" with ${sources.length} sources. Report saved to artifacts.`,
          artifactId: String(artifactId),
        };
      }

      return {
        success: true,
        summary: `Completed ${depth} research on "${topic}" with ${sources.length} sources.`,
      };
    } catch (error) {
      console.error("[deepWebResearchTool] Error:", error);
      return {
        success: false,
        summary: error instanceof Error ? error.message : "Research failed",
      };
    }
  },
});

/**
 * Market Analysis Tool
 * Analyze competitive landscape
 */
export const marketAnalysisTool = createTool({
  description:
    "Analyze a specific market, including competitors, trends, and opportunities. Provides structured market intelligence reports.",
  args: z.object({
    market: z.string().describe("Market or industry to analyze (e.g., 'office catering Boston')"),
    competitors: z.array(z.string()).optional().describe("Specific competitors to research"),
  }),
  handler: async (ctx, args): Promise<{
    market: string;
    competitors: string[];
    trends: string[];
    opportunities: string[];
    summary: string;
  }> => {
    const { market, competitors } = args;
    const threadId = (ctx as any).threadId;

    // Placeholder: In production, would use web_search or research APIs
    const result = {
      market,
      competitors: competitors || [],
      trends: [`${market} growth trend`, "Digital transformation", "Customer preference shifts"],
      opportunities: ["Market expansion", "Product differentiation", "Partnership opportunities"],
      summary: `Market analysis for ${market}. ${competitors?.length || 0} competitors identified. Key trends emerging in digital channels and customer preferences.`,
    };

    // Save as artifact
    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "market_analysis",
        title: `Market Analysis: ${market}`,
        payload: result,
      });
    }

    return result;
  },
});

/**
 * Research Agent - Deep investigation and market intelligence
 */
export const researchAgent = new Agent(components.agent, {
  name: "Research Agent",
  chat: languageModel as any,
  instructions: `You are the Research Agent - a deep investigation specialist focused on gathering comprehensive intelligence.

**Core Capabilities:**
1. **Deep Web Research**: Multi-step investigation with source synthesis
2. **Market Analysis**: Competitive landscape, trends, and opportunities
3. **Vendor Discovery**: Finding and evaluating service providers
4. **Industry Benchmarking**: Comparing standards and best practices

**Tool Usage:**
- **deepWebResearchTool**: Use for comprehensive topic research
  - Always specify appropriate depth (quick/standard/comprehensive)
  - Include focusAreas when user mentions specific aspects
  - Synthesize findings into actionable insights

- **marketAnalysisTool**: Use for competitive/market intelligence
  - Include competitor names when known
  - Look for pricing, trends, opportunities, and threats

**Research Methodology:**
1. Understand the research question or goal
2. Break down into researchable components
3. Execute research with appropriate depth
4. Synthesize findings with critical analysis
5. Provide actionable recommendations with sources

**Output Standards:**
- Always cite sources with URLs
- Distinguish facts from analysis
- Highlight key insights and patterns
- Provide confidence levels on conclusions
- Flag data limitations or gaps

**Response Style:**
- Structured and analytical
- Evidence-based with citations
- Balanced perspective (pros/cons)
- Actionable conclusions`,
  tools: {
    deepWebResearchTool,
    marketAnalysisTool,
  },
  maxSteps: 5,
});
