'use client';

import { useState } from 'react';
import { FiHeart, FiClock, FiDollarSign, FiEye, FiStar } from 'react-icons/fi';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MealData {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  prepTime: number;
  servings: number;
  rating: number;
  reviewCount: number;
  dietary: string[];
  category: string;
  ingredients?: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  stock?: number;
}

interface MealCardProps {
  meal: MealData;
  onViewDetails: (meal: MealData) => void;
  onAddToCart?: (meal: MealData) => void;
}

export function MealCard({ meal, onViewDetails, onAddToCart }: MealCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isLowStock = meal.stock !== undefined && meal.stock < 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
          )}
          <img
            src={meal.image}
            alt={meal.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-300 hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Overlays */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {meal.dietary.slice(0, 2).map(diet => (
              <Badge key={diet} variant="success" className="text-xs">
                {diet}
              </Badge>
            ))}
            {isLowStock && (
              <Badge variant="warning" className="text-xs">
                Only {meal.stock} left!
              </Badge>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
              isFavorite 
                ? "bg-red-500 text-white" 
                : "bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white"
            )}
            aria-label="Add to favorites"
          >
            <FiHeart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </button>

          {/* Quick View Button */}
          <button
            type="button"
            onClick={() => onViewDetails(meal)}
            className="absolute inset-x-0 bottom-0 bg-black/60 text-white py-2 px-4 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2"
          >
            <FiEye className="h-4 w-4" />
            <span className="text-sm font-medium">Quick View</span>
          </button>
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4 space-y-3">
          {/* Header */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 mb-1">
              {meal.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {meal.description}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FiStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {meal.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              ({meal.reviewCount} reviews)
            </span>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <FiClock className="h-4 w-4" />
              <span>{meal.prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🍽️</span>
              <span>{meal.servings} servings</span>
            </div>
          </div>

          {/* Nutrition Info (if available) */}
          {meal.nutrition && (
            <div className="flex gap-2 text-xs text-gray-600 pt-2 border-t">
              <span>{meal.nutrition.calories} cal</span>
              <span>•</span>
              <span>{meal.nutrition.protein}g protein</span>
              <span>•</span>
              <span>{meal.nutrition.carbs}g carbs</span>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="p-4 pt-0 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              ${meal.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">per serving</span>
          </div>
          <Button
            type="button"
            onClick={() => onAddToCart?.(meal)}
            className="flex-1 max-w-[140px]"
          >
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
