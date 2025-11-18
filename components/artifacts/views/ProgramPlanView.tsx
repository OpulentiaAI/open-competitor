import React from 'react';

export const ProgramPlanView = ({ data }: { data: any }) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2 text-sm">
      {data.days?.map((day: any, idx: number) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="font-semibold text-gray-700">Day {day.day}:</span>
          <span className="text-gray-600">{day.meals?.join(', ')}</span>
        </div>
      ))}
      {data.notes && (
        <div className="mt-2 text-xs text-gray-500 italic">
          {data.notes}
        </div>
      )}
    </div>
  );
};

