import { tool } from "ai";
import { z } from "zod";

/**
 * YouTube transcription tool
 * Fetches transcript/captions from YouTube videos
 */
export const youtubeTranscriptTool = tool({
  description: "Get the transcript/captions from a YouTube video. Provide either a full YouTube URL or just the video ID.",
  parameters: z.object({
    videoUrl: z.string().describe("YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID) or just the video ID"),
    lang: z.string().optional().default("en").describe("Language code for transcript (e.g., 'en', 'es', 'fr')"),
  }),
  execute: async ({ videoUrl, lang }) => {
    try {
      // Extract video ID from URL if needed
      let videoId = videoUrl;
      const urlMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
      if (urlMatch) {
        videoId = urlMatch[1];
      }

      // Import dynamically to avoid issues with Convex bundling
      const { YoutubeTranscript } = await import("youtube-transcript");
      
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: lang,
      });

      // Combine all transcript segments into a single text
      const fullText = transcript.map((item: any) => item.text).join(" ");

      return {
        success: true,
        videoId,
        transcript: fullText,
        segments: transcript.length,
        language: lang,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch YouTube transcript",
        hint: "Make sure the video has captions/subtitles available and the video ID is correct",
      };
    }
  },
});

/**
 * YouTube video info tool
 * Get metadata about a YouTube video
 */
export const youtubeInfoTool = tool({
  description: "Get information about a YouTube video including title, description, duration, and view count",
  parameters: z.object({
    videoUrl: z.string().describe("YouTube video URL or video ID"),
  }),
  execute: async ({ videoUrl }) => {
    try {
      // Extract video ID
      let videoId = videoUrl;
      const urlMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
      if (urlMatch) {
        videoId = urlMatch[1];
      }

      const { Innertube } = await import("youtubei.js");
      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);

      return {
        success: true,
        videoId,
        title: info.basic_info.title,
        author: info.basic_info.author,
        duration: info.basic_info.duration,
        viewCount: info.basic_info.view_count,
        likeCount: info.basic_info.like_count,
        description: info.basic_info.short_description,
        publishDate: info.basic_info.start_timestamp?.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch YouTube video info",
      };
    }
  },
});

// Export all tools
export const youtubeTools = {
  getTranscript: youtubeTranscriptTool,
  getVideoInfo: youtubeInfoTool,
};
