"use client";

import { FounderChat } from "@/app/components/FounderChat";
import { ArtifactPanel } from "@/app/components/ArtifactPanel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * Founder Console
 * 
 * Unified interface for founders to interact with the MealOutpost Assistant
 * 
 * Left: Thread-based chat with the agent
 * Right: Artifacts generated in the current conversation (program plans, leads, analytics)
 */
export default function FounderConsolePage() {
  const [threadId, setThreadId] = useState<Id<"threads"> | null>(null);

  const artifacts = useQuery(
    api.artifacts_queries.listByThread,
    threadId ? { threadId } : "skip"
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              🍽️ MealOutpost Founder Console
            </h1>
            <p className="text-sm text-slate-600">
              Design programs · Qualify leads · Analyze data
            </p>
          </div>
          {threadId && (
            <button
              type="button"
              onClick={() => setThreadId(null)}
              className="text-sm px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              New Conversation
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[2fr,1fr] overflow-hidden">
        {/* Chat Panel */}
        <div className="border-r overflow-hidden">
          <FounderChat onThreadChange={setThreadId} />
        </div>

        {/* Artifacts Sidebar */}
        <aside className="bg-slate-50 overflow-y-auto">
          <div className="sticky top-0 bg-slate-50 border-b px-4 py-3 z-10">
            <h2 className="text-sm font-semibold text-slate-900">
              Artifacts
            </h2>
            <p className="text-xs text-slate-500">
              Generated in this conversation
            </p>
          </div>

          <div className="p-4 space-y-3">
            {!threadId ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-sm text-slate-600 font-medium">
                  No artifacts yet
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Start a conversation to generate program plans, lead qualifications, and analytics insights
                </p>
              </div>
            ) : artifacts === undefined ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : artifacts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm text-slate-600 font-medium">
                  No artifacts yet
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Ask the assistant to design a program, qualify a lead, or analyze data
                </p>
              </div>
            ) : (
              artifacts.map((artifact) => (
                <ArtifactPanel key={artifact._id} artifact={artifact.artifact} />
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
