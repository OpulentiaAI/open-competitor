import { Agent } from "@convex-dev/agent";
import { createOpenAI } from "@ai-sdk/openai";
import { components } from "./_generated/api";
import { MODELS, SUPER_AGENT_PROMPT } from "./agents";
import { superAgentTools } from "./tools_superagent";

/**
 * SuperAgent - The central orchestrator
 * 
 * Single agent that routes to all capabilities:
 * - Subagents (founder, research, docs/sheets, media)
 * - Direct tools (YouTube, web search)
 * - Workflows (future)
 * 
 * All functionality unified under one intelligent interface
 */

// Configure OpenRouter provider
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const languageModel = openrouter(MODELS.SHERLOCK_THINK);

/**
 * The Opulentia SuperAgent
 * Production-grade orchestrator with intelligent routing
 */
export const superAgent = new Agent(components.agent, {
  name: "Opulentia SuperAgent",
  chat: languageModel as any,
  instructions: SUPER_AGENT_PROMPT,
  tools: superAgentTools,
  maxSteps: 10, // Allow multi-step tool usage for complex tasks
});
