import React from 'react';
import { FiGrid } from 'react-icons/fi';

export const ToolRunView = ({ data }: { data: any }) => {
  if (!data) return null;
  
  // Detect if we have tabular data (array of objects)
  const isTabular = Array.isArray(data.output) && data.output.length > 0 && typeof data.output[0] === 'object';

  if (isTabular) {
    const headers = Object.keys(data.output[0]);
    return (
      <div className="h-full flex flex-col">
        <div className="flex-none p-4 bg-white border-b border-gray-200">
           <h3 className="font-semibold text-gray-900 flex items-center gap-2">
             <FiGrid className="text-green-600" />
             {data.toolName || 'Data Sheet'}
           </h3>
           <p className="text-xs text-gray-500">Generated {data.output.length} rows</p>
        </div>
        <div className="flex-1 overflow-auto bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {headers.map(header => (
                  <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.output.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {headers.map(header => (
                    <td key={`${idx}-${header}`} className="px-4 py-2 whitespace-nowrap text-gray-700">
                       {String(row[header] || '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback for non-tabular tool output
  const statusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    ok: "bg-emerald-50 text-emerald-700 border-emerald-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    error: "bg-red-50 text-red-700 border-red-200",
  };
  const status = data.status || 'ok';
  
  return (
    <div className={`rounded p-4 text-sm border ${statusColors[status as keyof typeof statusColors] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono font-semibold">{data.toolName || 'Tool Output'}</span>
        <span className="uppercase text-[10px] tracking-wide font-bold px-2 py-0.5 bg-white/50 rounded">{status}</span>
      </div>
      
      <div className="font-mono text-xs bg-white/50 p-3 rounded overflow-x-auto">
        {typeof data.output === 'object' ? JSON.stringify(data.output, null, 2) : (data.output || data.outputSummary || 'No output')}
      </div>
      
      {data.error && (
         <div className="mt-2 text-red-600 bg-red-50 p-2 rounded text-xs font-mono border border-red-100">
           Error: {data.error}
         </div>
      )}
    </div>
  );
};
