import React from 'react';

export const PresentationView = ({ data }: { data: any }) => {
  if (!data) return null;
  const slides = data.slides || [];

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">Slides</p>
        <span className="text-xs font-medium text-gray-600">{slides.length} slides</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {slides.slice(0, 4).map((slide: any, idx: number) => (
          <div key={idx} className="bg-white border border-gray-200 rounded p-2">
            <p className="text-xs font-semibold text-gray-700 line-clamp-1">{slide.title || `Slide ${idx + 1}`}</p>
            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{slide.content || slide.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

