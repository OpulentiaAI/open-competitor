import React from 'react';

export const YouTubeTranscriptView = ({ data }: { data: any }) => {
  if (!data) return null;

  const formatTimestamp = (value: number | string) => {
    if (typeof value === 'string' && value.includes(':')) return value;
    const seconds = typeof value === 'number' ? value : Number(value) || 0;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const segments = [hrs, mins, secs]
      .map((unit) => String(unit).padStart(2, '0'))
      .join(':');
    return segments.replace(/^00:/, '');
  };

  const segments = data.segments || data.chunks || data.captionSegments;
  if (segments && Array.isArray(segments)) {
    return (
      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
        {segments.slice(0, 6).map((segment: any, idx: number) => (
          <div key={`segment-${idx}`} className="text-sm text-gray-700">
            <span className="text-xs font-mono text-gray-500 mr-2">{formatTimestamp(segment.timestamp ?? segment.start)}</span>
            <span>{segment.text || segment.caption}</span>
          </div>
        ))}
      </div>
    );
  }

  if (data.transcript) {
    return (
      <div className="text-sm text-gray-700 max-h-48 overflow-y-auto">
        <p className="whitespace-pre-wrap">{data.transcript.substring(0, 500)}...</p>
      </div>
    );
  }
  
  return null;
};

