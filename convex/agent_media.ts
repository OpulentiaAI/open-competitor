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
 * Generate Slides Tool
 */
export const generateSlidesTool = createTool({
  description:
    "Generate a professional presentation with custom styling and content. Creates slide decks for pitches, reports, or proposals.",
  args: z.object({
    topic: z.string().describe("Presentation topic or title"),
    slideCount: z.number().min(3).max(20).describe("Number of slides to generate"),
    style: z.enum(["professional", "modern", "minimal", "creative"]).default("professional"),
    keyPoints: z.array(z.string()).optional().describe("Key points to cover in the presentation"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    slideCount: number;
    message: string;
  }> => {
    const { topic, slideCount, style, keyPoints } = args;
    const threadId = (ctx as any).threadId;

    // Generate slide structure
    const slides = [];
    
    // Title slide
    slides.push({
      type: "title",
      title: topic,
      subtitle: "Generated Presentation",
    });

    // Content slides
    const contentSlideCount = slideCount - 2; // Excluding title and closing
    const points = keyPoints || [`Overview of ${topic}`, "Key Features", "Benefits", "Implementation"];
    
    for (let i = 0; i < contentSlideCount; i++) {
      slides.push({
        type: "content",
        title: points[i % points.length] || `Slide ${i + 2}`,
        content: `Content for slide ${i + 2}`,
        style,
      });
    }

    // Closing slide
    slides.push({
      type: "closing",
      title: "Thank You",
      content: "Questions?",
    });

    const artifact = {
      type: "presentation" as const,
      topic,
      style,
      slides,
      createdAt: Date.now(),
    };

    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "presentation",
        title: `Presentation: ${topic}`,
        payload: artifact,
      });
    }

    return {
      success: true,
      slideCount: slides.length,
      message: `Generated ${slides.length}-slide presentation on "${topic}" with ${style} styling. Saved to artifacts.`,
    };
  },
});

/**
 * Generate Image Tool
 */
export const generateImageTool = createTool({
  description:
    "Generate images using AI. Creates custom visuals for presentations, marketing, or design work.",
  args: z.object({
    prompt: z.string().describe("Description of the image to generate"),
    style: z.enum(["photorealistic", "illustration", "abstract", "logo"]).optional(),
    aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3"]).default("16:9"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
  }> => {
    const { prompt, style, aspectRatio } = args;
    const threadId = (ctx as any).threadId;

    // Note: Placeholder for actual image generation API (DALL-E, Midjourney, etc.)
    const artifact = {
      type: "image" as const,
      prompt,
      style: style || "photorealistic",
      aspectRatio,
      imageUrl: "pending", // Would be actual URL from image generation service
      createdAt: Date.now(),
    };

    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "image",
        title: `Image: ${prompt.substring(0, 50)}...`,
        payload: artifact,
      });
    }

    return {
      success: true,
      message: `Image generation queued for: "${prompt}". Integration with image generation API pending.`,
    };
  },
});

/**
 * Generate Video Tool
 */
export const generateVideoTool = createTool({
  description:
    "Generate or edit video content. Creates promotional videos, explainers, or social media content.",
  args: z.object({
    concept: z.string().describe("Video concept or script"),
    duration: z.number().min(5).max(300).describe("Duration in seconds"),
    format: z.enum(["landscape", "portrait", "square"]).default("landscape"),
  }),
  handler: async (ctx, args): Promise<{
    success: boolean;
    message: string;
  }> => {
    const { concept, duration, format } = args;
    const threadId = (ctx as any).threadId;

    const artifact = {
      type: "video" as const,
      concept,
      duration,
      format,
      videoUrl: "pending", // Would be actual URL from video generation service
      createdAt: Date.now(),
    };

    if (threadId) {
      await ctx.runMutation(internal.artifacts_helpers.saveArtifact as any, {
        threadId,
        type: "video",
        title: `Video: ${concept.substring(0, 50)}...`,
        payload: artifact,
      });
    }

    return {
      success: true,
      message: `Video generation queued: "${concept}" (${duration}s, ${format}). Integration with video generation API pending.`,
    };
  },
});

/**
 * Media Agent - Presentation, image, and video generation
 */
export const mediaAgent = new Agent(components.agent, {
  name: "Media Agent",
  chat: languageModel as any,
  instructions: `You are the Media Agent - a multimedia content creation specialist.

**Core Capabilities:**
1. **Presentation Generation**: Create professional slide decks with custom styling
2. **Image Generation**: Generate custom visuals and graphics
3. **Video Content**: Produce video content for various formats

**Tool Usage:**
- **generateSlidesTool**: Use for presentation creation
  - Determine appropriate slide count (typically 5-15 slides)
  - Choose style based on use case (professional for business, creative for marketing)
  - Extract key points from user requirements
  - Always include title and closing slides

- **generateImageTool**: Use for visual content
  - Write detailed, specific prompts
  - Choose appropriate style for the use case
  - Consider aspect ratio for intended platform

- **generateVideoTool**: Use for video production
  - Break down concept into clear narrative
  - Choose appropriate duration
  - Match format to platform (portrait for mobile, landscape for web)

**Quality Standards:**
- Always generate complete, polished artifacts
- Maintain consistency in style and branding
- Provide professional-grade outputs
- Include all necessary elements (titles, transitions, etc.)

**Response Style:**
- Creative yet professional
- Detail-oriented descriptions
- Clear about what was generated
- Offer variations or alternatives`,
  tools: {
    generateSlidesTool,
    generateImageTool,
    generateVideoTool,
  },
  maxSteps: 5,
});
