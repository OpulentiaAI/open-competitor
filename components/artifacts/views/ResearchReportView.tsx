import React from 'react';

export const ResearchReportView = ({ data }: { data: any }) => {
  if (!data) return null;

  const focusAreas = data.focusAreas || [];
  const sources = data.sources || [];

  if (focusAreas.length === 0 && sources.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Generating research report...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {focusAreas.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Focus Areas</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {focusAreas.map((area: string) => (
              <span
                key={area}
                className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Top Sources</p>
          <ul className="space-y-2">
            {sources.slice(0, 4).map((source: any, idx: number) => (
              <li key={`source-${idx}`} className="text-sm">
                <div className="font-medium text-gray-800">
                  <span className="text-xs text-gray-400 mr-2">[{idx + 1}]</span>
                  {source.title || 'Untitled'}
                </div>
                {source.summary && (
                  <p className="text-xs text-gray-500 line-clamp-2">{source.summary}</p>
                )}
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {new URL(source.url).hostname}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
