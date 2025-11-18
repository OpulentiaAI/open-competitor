import React from 'react';

export const MarketAnalysisView = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Summary</p>
        <p className="text-gray-700 mt-1">{data.summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-500">Trends</p>
          <ul className="mt-1 space-y-1 text-xs text-gray-600">
            {(data.trends || []).map((trend: string) => (
              <li key={trend}>• {trend}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500">Opportunities</p>
          <ul className="mt-1 space-y-1 text-xs text-gray-600">
            {(data.opportunities || []).map((opp: string) => (
              <li key={opp}>• {opp}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

