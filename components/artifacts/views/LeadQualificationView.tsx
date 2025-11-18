import React from 'react';

export const LeadQualificationView = ({ data }: { data: any }) => {
  if (!data) return null;

  const fitColor = 
    (data.idealFitScore || data.fitScore || 0) >= 75 ? "text-green-600" :
    (data.idealFitScore || data.fitScore || 0) >= 50 ? "text-yellow-600" : "text-red-600";
  
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-800">{data.companyName || 'Company'}</p>
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
              {data.website}
            </a>
          )}
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${fitColor}`}>{data.idealFitScore || data.fitScore || 0}</p>
          <p className="text-xs text-gray-500">Fit Score</p>
        </div>
      </div>
      {data.idealFitReason && (
        <p className="text-xs text-gray-600 bg-blue-50 rounded p-2">{data.idealFitReason}</p>
      )}
    </div>
  );
};

