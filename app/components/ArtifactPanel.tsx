"use client";

import type {
  ProgramPlanArtifact,
  LeadQualificationArtifact,
  SearchResultArtifact,
  ToolRunArtifact,
  MealSuggestionsArtifact,
  AnyArtifact,
} from "@/lib/artifacts";
import { MealSuggestionsCard } from "./MealSuggestionsCard";

/**
 * Unified artifact renderer
 * Displays structured outputs from agent tools in a consistent format
 */
export function ArtifactPanel({
  artifact,
  threadId,
}: {
  artifact: AnyArtifact;
  threadId?: string;
}) {
  if (artifact.type === "program_plan") {
    return <ProgramPlanCard artifact={artifact} />;
  }
  
  if (artifact.type === "lead_qualification") {
    return <LeadQualificationCard artifact={artifact} />;
  }
  
  if (artifact.type === "search_result") {
    return <SearchResultCard artifact={artifact} />;
  }
  
  if (artifact.type === "tool_run") {
    return <ToolRunCard artifact={artifact} />;
  }
  
  if (artifact.type === "meal_suggestions" && threadId) {
    return <MealSuggestionsCard artifact={artifact} threadId={threadId} />;
  }
  
  return null;
}

/**
 * Program Plan Artifact Card
 * Displays a structured meal program in a readable format
 */
function ProgramPlanCard({ artifact }: { artifact: ProgramPlanArtifact }) {
  const firstDay = artifact.mealsByDay[0];
  const totalDays = artifact.mealsByDay.length;
  
  // Calculate total meals
  const totalMeals = artifact.mealsByDay.reduce(
    (sum, day) => sum + day.meals.length,
    0
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
      {/* Header */}
      <header className="flex justify-between items-start border-b pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Meal Program: {artifact.officeId}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {artifact.timeRange.startDate} → {artifact.timeRange.endDate}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-slate-900">
            {artifact.currency}
            {artifact.budgetPerPerson ?? "?"}
            <span className="text-xs text-slate-500">/person/day</span>
          </div>
          <div className="text-xs text-slate-500">
            {totalDays} days · {totalMeals} meals
          </div>
        </div>
      </header>

      {/* Sample Day */}
      {firstDay && (
        <section className="bg-slate-50 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Sample Day: {firstDay.date}
          </h3>
          <ul className="space-y-2">
            {firstDay.meals.map((meal, idx) => (
              <li
                key={idx}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <div className="flex-1">
                  <div className="font-medium text-slate-900">
                    <span className="text-xs uppercase text-slate-500 mr-2">
                      {meal.type}
                    </span>
                    {meal.name}
                  </div>
                  {meal.cuisine && (
                    <div className="text-xs text-slate-600 mt-0.5">
                      {meal.cuisine}
                    </div>
                  )}
                  {meal.description && (
                    <div className="text-xs text-slate-500 mt-1">
                      {meal.description}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {meal.estimatedPricePerPerson && (
                    <span className="text-xs font-medium text-slate-700">
                      {artifact.currency}
                      {meal.estimatedPricePerPerson.toFixed(2)}
                    </span>
                  )}
                  {meal.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end">
                      {meal.dietaryTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {firstDay.notes && (
            <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
              {firstDay.notes}
            </p>
          )}
        </section>
      )}

      {/* Constraints Summary */}
      {artifact.constraints && Object.keys(artifact.constraints).length > 0 && (
        <section className="text-xs text-slate-600">
          <h4 className="font-medium text-slate-700 mb-1">Constraints:</h4>
          <ul className="space-y-0.5 pl-3">
            {artifact.constraints.maxBudgetPerPerson && (
              <li>
                • Max budget: {artifact.currency}
                {artifact.constraints.maxBudgetPerPerson}/person/day
              </li>
            )}
            {artifact.constraints.dietarySummary && (
              <li>• {artifact.constraints.dietarySummary}</li>
            )}
            {artifact.constraints.serviceDaysPerWeek && (
              <li>
                • Service: {artifact.constraints.serviceDaysPerWeek} days/week
              </li>
            )}
          </ul>
        </section>
      )}

      {/* Notes */}
      {artifact.notes && (
        <section className="border-t pt-3">
          <p className="text-xs text-slate-600">
            <span className="font-medium text-slate-700">Notes:</span>{" "}
            {artifact.notes}
          </p>
        </section>
      )}

      {/* Action Hint */}
      <div className="border-t pt-3">
        <p className="text-xs text-slate-500">
          💡 View full details in{" "}
          <a
            href="/program-plans"
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Program Plans
          </a>
        </p>
      </div>
    </div>
  );
}

/**
 * Lead Qualification Artifact Card
 * Displays lead research and qualification results
 */
function LeadQualificationCard({ artifact }: { artifact: LeadQualificationArtifact }) {
  const fitColor = 
    artifact.idealFitScore >= 75 ? "text-green-600" :
    artifact.idealFitScore >= 50 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
      {/* Header */}
      <header className="flex justify-between items-start border-b pb-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {artifact.companyName}
          </h2>
          {artifact.website && (
            <a
              href={artifact.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline"
            >
              {artifact.website}
            </a>
          )}
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${fitColor}`}>
            {artifact.idealFitScore}
          </div>
          <div className="text-xs text-slate-500">Fit Score</div>
        </div>
      </header>

      {/* Company Details */}
      <section className="bg-slate-50 rounded-xl p-4 space-y-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {artifact.sizeBucket && (
            <div>
              <div className="text-xs text-slate-500">Company Size</div>
              <div className="font-medium">{artifact.sizeBucket} employees</div>
            </div>
          )}
          {artifact.vertical && (
            <div>
              <div className="text-xs text-slate-500">Industry</div>
              <div className="font-medium">{artifact.vertical}</div>
            </div>
          )}
        </div>
      </section>

      {/* Fit Reason */}
      <section>
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          Why This Lead Fits
        </h4>
        <p className="text-sm text-slate-600">{artifact.idealFitReason}</p>
      </section>

      {/* Recommended Next Step */}
      <section className="bg-blue-50 rounded-xl p-3">
        <h4 className="text-sm font-semibold text-blue-900 mb-1">
          Recommended Next Step
        </h4>
        <p className="text-sm text-blue-800">{artifact.recommendedNextStep}</p>
      </section>

      {/* Notes */}
      {artifact.notes && (
        <section className="border-t pt-3">
          <p className="text-xs text-slate-600">
            <span className="font-medium text-slate-700">Notes:</span>{" "}
            {artifact.notes}
          </p>
        </section>
      )}
    </div>
  );
}

/**
 * Search Result Artifact Card
 * Displays web search results with citations
 */
function SearchResultCard({ artifact }: { artifact: SearchResultArtifact }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
      {/* Header */}
      <header className="flex items-start justify-between border-b pb-2">
        <div className="flex-1">
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">
            Web Search
          </div>
          <div className="text-sm font-medium text-slate-900 mt-1">
            "{artifact.query}"
          </div>
        </div>
        <div className="text-xs text-slate-400">
          {artifact.results.length} results
        </div>
      </header>

      {/* Results */}
      <ul className="space-y-2">
        {artifact.results.slice(0, 5).map((result, idx) => (
          <li key={`${result.url}-${idx}`} className="text-sm">
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              {result.title}
            </a>
            {result.summary && (
              <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                {result.summary}
              </p>
            )}
            <div className="text-[10px] text-slate-400 mt-0.5">
              {new URL(result.url).hostname}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Tool Run Artifact Card
 * Displays tool execution details for debugging
 */
function ToolRunCard({ artifact }: { artifact: ToolRunArtifact }) {
  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div
      className={`rounded-xl border p-3 text-xs space-y-2 ${statusColors[artifact.status]}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="font-mono font-semibold">{artifact.toolName}</span>
        <span className="uppercase text-[10px] tracking-wide font-bold">
          {artifact.status}
        </span>
      </div>

      {/* Output Summary */}
      {artifact.outputSummary && (
        <p className="text-xs line-clamp-3 opacity-90">
          {artifact.outputSummary}
        </p>
      )}

      {/* Error Message */}
      {artifact.error && (
        <p className="text-xs line-clamp-3 font-medium">
          Error: {artifact.error}
        </p>
      )}
    </div>
  );
}
