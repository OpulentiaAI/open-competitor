"use client";

import type { MealSuggestionsArtifact, MealSuggestion } from "@/lib/artifacts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

interface Props {
  artifact: MealSuggestionsArtifact;
  threadId: string;
}

export function MealSuggestionsCard({ artifact, threadId }: Props) {
  const addToPlan = useMutation(api.order_plans.addFromSuggestion);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleAdd = async (suggestion: MealSuggestion) => {
    setAddingId(suggestion.id);
    try {
      await addToPlan({ threadId, suggestionId: suggestion.id });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
      {/* Header */}
      <header className="border-b pb-3">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
          Meal Suggestions
        </div>
        <div className="text-sm font-medium text-slate-900 mt-1">
          "{artifact.query}"
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {artifact.location} • {artifact.suggestions.length} options
        </div>
      </header>

      {/* Meal Grid */}
      <div className="grid grid-cols-2 gap-2">
        {artifact.suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform"
          >
            {/* Background Image */}
            <img
              src={
                suggestion.imageUrl ??
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=533&fit=crop"
              }
              alt={suggestion.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              {/* Top: Index + Rating */}
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-white bg-black/40 rounded-full px-2 py-0.5">
                  #{suggestion.displayIndex}
                </span>
                {suggestion.rating && (
                  <span className="text-xs text-white bg-black/40 rounded-full px-2 py-0.5">
                    ⭐ {suggestion.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Bottom: Info + Button */}
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white drop-shadow-lg line-clamp-2">
                  {suggestion.title}
                </div>
                <div className="text-[11px] text-white/90 drop-shadow line-clamp-1">
                  {suggestion.restaurantName}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/90 drop-shadow">
                    {suggestion.price != null
                      ? `$${suggestion.price.toFixed(2)}`
                      : "See menu"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdd(suggestion)}
                    disabled={addingId === suggestion.id}
                    className="text-[11px] px-3 py-1 rounded-full bg-white text-slate-900 hover:bg-white/90 font-medium disabled:opacity-50 transition-all"
                  >
                    {addingId === suggestion.id ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
