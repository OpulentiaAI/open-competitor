"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface FounderChatProps {
  onThreadChange?: (threadId: Id<"threads"> | null) => void;
}

export function FounderChat({ onThreadChange }: FounderChatProps) {
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(null);

  const startThread = useMutation(api.chat_superagent.startThread);
  const sendMessage = useMutation(api.chat_superagent.sendMessage);

  const messages = useQuery(
    api.chat_superagent.listMessages,
    threadId ? { threadId } : "skip"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    try {
      if (!threadId) {
        const { threadId: newThreadId } = await startThread({
          userId: "founder-console",
          prompt: text,
        });
        setThreadId(newThreadId as Id<"threads">);
        onThreadChange?.(newThreadId as Id<"threads">);
      } else {
        await sendMessage({ threadId, prompt: text, userId: "founder-console" });
      }

      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b px-4 py-3 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-900">
          MealOutpost Assistant
        </h2>
        <p className="text-xs text-slate-500">
          Ask about programs, leads, analytics, and more
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="text-4xl">🍽️</div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Welcome to MealOutpost Assistant
              </p>
              <p className="text-xs text-slate-500 mt-1">
                I can help you design meal programs, qualify leads, and analyze data
              </p>
            </div>
            <div className="text-xs text-slate-400 space-y-1">
              <p>Try asking:</p>
              <ul className="text-left list-disc list-inside">
                <li>"Design a 5-day lunch program for Acme NYC"</li>
                <li>"Qualify this lead: TechCorp at techcorp.com"</li>
                <li>"Show me meal program metrics for this month"</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  m.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-slate-100 text-slate-900"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                {m.role === "assistant" && (
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t p-3 bg-white flex gap-2"
      >
        <input
          className="flex-1 border border-slate-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about programs, leads, or analytics…"
          disabled={!threadId && input.length > 0 ? false : false}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
