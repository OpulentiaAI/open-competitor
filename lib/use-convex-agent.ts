"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * Custom hook for interacting with Convex agent actions
 * Provides type-safe access to AI-powered features
 */
export function useConvexAgent() {
  const chat = useAction(api.actions.chat);
  const getYouTubeTranscript = useAction(api.actions.getYouTubeTranscript);
  const getYouTubeInfo = useAction(api.actions.getYouTubeInfo);
  const addMessage = useMutation(api.messages.add);
  
  return {
    /**
     * Send a chat message and get a response (includes YouTube tools)
     */
    chat: async (message: string, threadId?: string) => {
      return await chat({ message, threadId });
    },
    
    /**
     * Get YouTube video transcript
     */
    getYouTubeTranscript: async (videoUrl: string, lang?: string) => {
      return await getYouTubeTranscript({ videoUrl, lang });
    },
    
    /**
     * Get YouTube video information
     */
    getYouTubeInfo: async (videoUrl: string) => {
      return await getYouTubeInfo({ videoUrl });
    },
    
    /**
     * Add a message directly to a thread
     */
    addMessage: async (
      threadId: string,
      role: "user" | "assistant" | "system",
      content: string
    ) => {
      return await addMessage({ threadId, role, content });
    },
  };
}

/**
 * Hook to get messages from a thread
 */
export function useMessages(threadId: any) {
  return useQuery(api.messages.list, { threadId });
}

/**
 * Hook to create a new thread
 */
export function useCreateThread() {
  return useMutation(api.threads.create);
}
