'use client';

import { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface MealSearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: MealFilters) => void;
}

export interface MealFilters {
  category?: string;
  dietary?: string[];
  priceRange?: string;
  prepTime?: string;
}

export function MealSearchBar({ onSearch, onFilterChange }: MealSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MealFilters>({
    dietary: []
  });

  const categories = [
    'All Meals',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks',
    'Desserts',
    'Beverages'
  ];

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Low-Carb',
    'High-Protein'
  ];

  const priceRanges = [
    'All Prices',
    'Under $10',
    '$10 - $20',
    '$20 - $30',
    'Over $30'
  ];

  const prepTimes = [
    'All Times',
    'Under 15 min',
    '15-30 min',
    '30-45 min',
    'Over 45 min'
  ];

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleDietary = (option: string) => {
    const newDietary = filters.dietary?.includes(option)
      ? filters.dietary.filter(d => d !== option)
      : [...(filters.dietary || []), option];
    
    const newFilters = { ...filters, dietary: newDietary };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const updateFilter = (key: keyof MealFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: MealFilters = { dietary: [] };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = 
    (filters.category && filters.category !== 'All Meals' ? 1 : 0) +
    (filters.dietary?.length || 0) +
    (filters.priceRange && filters.priceRange !== 'All Prices' ? 1 : 0) +
    (filters.prepTime && filters.prepTime !== 'All Times' ? 1 : 0);

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search for meals, ingredients, or cuisines..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          variant={showFilters ? "default" : "outline"}
          className="h-12 px-6 relative"
        >
          <FiFilter className="mr-2 h-5 w-5" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 min-w-5 flex items-center justify-center">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-lg border p-6 space-y-6">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Category
                </label>
                <Select
                  value={filters.category || 'All Meals'}
                  onValueChange={(value) => updateFilter('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dietary Preferences */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(option => (
                    <Badge
                      key={option}
                      variant={filters.dietary?.includes(option) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-gray-100 transition-colors px-3 py-1.5"
                      onClick={() => toggleDietary(option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Price Range
                  </label>
                  <Select
                    value={filters.priceRange || 'All Prices'}
                    onValueChange={(value) => updateFilter('priceRange', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map(range => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prep Time */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Preparation Time
                  </label>
                  <Select
                    value={filters.prepTime || 'All Times'}
                    onValueChange={(value) => updateFilter('prepTime', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prepTimes.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="text-sm"
                  >
                    <FiX className="mr-1 h-4 w-4" />
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.category && filters.category !== 'All Meals' && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <FiX
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('category', 'All Meals')}
              />
            </Badge>
          )}
          {filters.dietary?.map(diet => (
            <Badge key={diet} variant="secondary" className="gap-1">
              {diet}
              <FiX
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleDietary(diet)}
              />
            </Badge>
          ))}
          {filters.priceRange && filters.priceRange !== 'All Prices' && (
            <Badge variant="secondary" className="gap-1">
              {filters.priceRange}
              <FiX
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('priceRange', 'All Prices')}
              />
            </Badge>
          )}
          {filters.prepTime && filters.prepTime !== 'All Times' && (
            <Badge variant="secondary" className="gap-1">
              {filters.prepTime}
              <FiX
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('prepTime', 'All Times')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
