'use client';

import { useState } from 'react';
import { useAction, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function ProgramPlansPage() {
  const [companyName, setCompanyName] = useState('MealOutpost Demo Co');
  const [officeId, setOfficeId] = useState('nyc-office');
  const [startDate, setStartDate] = useState('2025-12-01');
  const [endDate, setEndDate] = useState('2025-12-05');
  const [budgetPerPerson, setBudgetPerPerson] = useState('20');
  const [constraints, setConstraints] = useState('At least one vegetarian option per day.');

  const designProgramPlan = useAction(api.actions.designProgramPlan);

  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);

  const plans = useQuery(
    api.program_plans.listByCompanyOffice,
    currentCompanyId
      ? { companyId: currentCompanyId as any, officeId }
      : 'skip'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await designProgramPlan({
        companyName,
        officeId,
        startDate,
        endDate,
        budgetPerPerson: budgetPerPerson ? Number(budgetPerPerson) : undefined,
        currency: 'USD',
        constraints,
      });

      if (result && (result as any).success && (result as any).companyId) {
        setCurrentCompanyId((result as any).companyId as string);
      } else if (result && !(result as any).success && (result as any).error) {
        setError((result as any).error as string);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Program Plan Generator</h1>
          <p className="mt-1 text-sm text-gray-600">
            Generate and persist structured meal program plans for a company office using the MealOutpost agent backend.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Office ID</label>
              <input
                type="text"
                value={officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Budget per person (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={budgetPerPerson}
                onChange={(e) => setBudgetPerPerson(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Constraints / preferences</label>
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Generating plan…' : 'Generate program plan'}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Latest plans</h2>
          {!currentCompanyId && (
            <p className="text-sm text-gray-500">No company selected yet. Generate a plan to view persisted artifacts.</p>
          )}
          {currentCompanyId && plans === undefined && (
            <p className="text-sm text-gray-500">Loading plans…</p>
          )}
          {currentCompanyId && Array.isArray(plans) && plans.length === 0 && (
            <p className="text-sm text-gray-500">No plans found for this company/office yet.</p>
          )}
          {currentCompanyId && Array.isArray(plans) && plans.length > 0 && (
            <div className="space-y-4">
              {plans.map((plan: any) => (
                <div
                  key={plan._id}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Program plan for {plan.artifact.officeId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {plan.artifact.timeRange?.startDate} → {plan.artifact.timeRange?.endDate}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Created {new Date(plan.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {plan.artifact?.mealsByDay && plan.artifact.mealsByDay.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Sample day:</p>
                      <div className="text-xs text-gray-700 bg-white rounded-md border border-gray-200 p-2">
                        <p>
                          {plan.artifact.mealsByDay[0].date} –{' '}
                          {plan.artifact.mealsByDay[0].meals
                            .map((m: any) => `${m.type}: ${m.name}`)
                            .join('; ')}
                        </p>
                      </div>
                    </div>
                  )}
                  {plan.artifact?.notes && (
                    <p className="text-xs text-gray-600 mt-1">
                      Notes: {plan.artifact.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
