import React from 'react';

export const MealSuggestionsView = ({ data }: { data: any }) => {
  if (!data || !data.suggestions) return null;

  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs text-gray-500 mb-2">
        Found {data.suggestions.length} options in {data.location}
      </p>
      <div className="space-y-2">
        {data.suggestions.slice(0, 3).map((meal: any, idx: number) => (
          <div key={idx} className="flex gap-3 bg-white p-2 rounded border border-gray-100">
            {meal.imageUrl && (
              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                <img src={meal.imageUrl} alt={meal.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">{meal.title}</p>
              <p className="text-xs text-gray-500 truncate">{meal.restaurantName}</p>
              <div className="flex items-center gap-2 mt-1">
                {meal.price && (
                  <span className="text-xs font-medium text-green-600">${meal.price}</span>
                )}
                {meal.rating && (
                  <span className="text-xs text-yellow-600">★ {meal.rating}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

