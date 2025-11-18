"use client";

import { useState } from 'react';
import { Star, QrCode, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type MessageFeedbackProps = {
  messageId?: string;
  onRatingChange?: (rating: number) => void;
  onGenerateQR?: () => void;
  showQR?: boolean;
  qrData?: string;
};

export default function MessageFeedback({
  messageId,
  onRatingChange,
  onGenerateQR,
  showQR = false,
  qrData
}: MessageFeedbackProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleRating = (value: number) => {
    setRating(value);
    onRatingChange?.(value);
  };

  return (
    <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-3">
      {/* Rating Component */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500 mr-1">Rate:</span>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className="transition-colors"
            aria-label={`Rate ${value} stars`}
          >
            <Star
              className={cn(
                "w-4 h-4 transition-all",
                (hoveredRating >= value || rating >= value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>

      {/* QR Code Button */}
      {onGenerateQR && (
        <button
          type="button"
          onClick={onGenerateQR}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Generate QR Code"
        >
          <QrCode className="w-4 h-4" />
          <span>QR</span>
        </button>
      )}

      {/* Share Button */}
      <button
        type="button"
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Share"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {/* Simple QR Code Display */}
      {showQR && qrData && (
        <div className="ml-auto bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Scan to view</div>
          <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
            <QrCode className="w-16 h-16 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}
