import React from 'react';
import { FiMapPin, FiStar, FiDollarSign } from 'react-icons/fi';

export const MealSuggestionsView = ({ data }: { data: any }) => {
  if (!data || !data.suggestions) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none p-4 bg-white border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">
          Meal Suggestions
        </h3>
        <p className="text-sm text-gray-500">
          Found {data.suggestions.length} options in {data.location}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {data.suggestions.map((meal: any, idx: number) => (
          <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Image Header */}
            <div className="h-32 w-full bg-gray-200 relative">
              {meal.imageUrl ? (
                <img src={meal.imageUrl} alt={meal.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
              {meal.price && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-green-700 shadow-sm flex items-center gap-1">
                  <FiDollarSign className="w-3 h-3" />
                  {meal.price}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-gray-900 text-base">{meal.title}</h4>
                {meal.rating && (
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium bg-yellow-50 px-1.5 py-0.5 rounded">
                    <FiStar className="fill-current w-3 h-3" />
                    {meal.rating}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <span className="font-medium text-gray-700">{meal.restaurantName}</span>
                <span>•</span>
                <span>{meal.cuisine || 'Various'}</span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {meal.description || "A delicious meal option perfect for your team."}
              </p>

              {/* Footer / Metadata */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                 <div className="flex items-center gap-4 text-xs text-gray-400">
                   <div className="flex items-center gap-1">
                     <FiMapPin className="w-3 h-3" />
                     <span>{meal.distance || '0.5 miles'}</span>
                   </div>
                   <span>{meal.calories ? `${meal.calories} cal` : ''}</span>
                 </div>
                 <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                   View Details
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

