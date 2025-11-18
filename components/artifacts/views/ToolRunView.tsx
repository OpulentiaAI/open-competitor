import React from 'react';

export const ToolRunView = ({ data }: { data: any }) => {
  if (!data) return null;

  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };
  const status = data.status || 'ok';
  
  return (
    <div className={`rounded p-3 text-xs ${statusColors[status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700'}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono font-semibold">{data.toolName || 'Tool'}</span>
        <span className="uppercase text-[10px] tracking-wide font-bold">{status}</span>
      </div>
      {data.outputSummary && (
        <p className="line-clamp-2 opacity-90">{data.outputSummary}</p>
      )}
      {data.error && (
        <p className="line-clamp-2 font-medium">Error: {data.error}</p>
      )}
    </div>
  );
};

