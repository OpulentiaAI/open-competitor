'use client';

import { useState, useEffect } from 'react';
import { FiGrid, FiList, FiShoppingCart } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { MealSearchBar, type MealFilters } from './MealSearchBar';
import { MealCard, type MealData } from './MealCard';
import { MealDetailView, type PurchaseOptions } from './MealDetailView';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MealOutpostProps {
  className?: string;
}

// Sample meal data - in production, this would come from an API
const SAMPLE_MEALS: MealData[] = [
  {
    id: '1',
    name: 'Mediterranean Chicken Bowl',
    description: 'Grilled chicken with quinoa, roasted vegetables, and tzatziki sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    prepTime: 25,
    servings: 2,
    rating: 4.8,
    reviewCount: 342,
    dietary: ['High-Protein', 'Gluten-Free'],
    category: 'Lunch',
    nutrition: {
      calories: 520,
      protein: 42,
      carbs: 48,
      fat: 18
    },
    stock: 8
  },
  {
    id: '2',
    name: 'Vegan Buddha Bowl',
    description: 'Colorful mix of roasted chickpeas, sweet potato, kale, and tahini dressing',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    prepTime: 30,
    servings: 2,
    rating: 4.9,
    reviewCount: 528,
    dietary: ['Vegan', 'Gluten-Free', 'High-Protein'],
    category: 'Dinner',
    nutrition: {
      calories: 480,
      protein: 18,
      carbs: 62,
      fat: 16
    },
    stock: 12
  },
  {
    id: '3',
    name: 'Salmon Teriyaki with Rice',
    description: 'Pan-seared salmon glazed with homemade teriyaki sauce, jasmine rice, and steamed broccoli',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
    prepTime: 20,
    servings: 2,
    rating: 4.7,
    reviewCount: 287,
    dietary: ['High-Protein', 'Dairy-Free'],
    category: 'Dinner',
    nutrition: {
      calories: 590,
      protein: 38,
      carbs: 54,
      fat: 22
    },
    stock: 15
  },
  {
    id: '4',
    name: 'Classic Breakfast Burrito',
    description: 'Scrambled eggs, black beans, cheese, salsa, and avocado wrapped in a flour tortilla',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    prepTime: 15,
    servings: 2,
    rating: 4.6,
    reviewCount: 419,
    dietary: ['Vegetarian', 'High-Protein'],
    category: 'Breakfast',
    nutrition: {
      calories: 420,
      protein: 24,
      carbs: 38,
      fat: 20
    },
    stock: 3
  },
  {
    id: '5',
    name: 'Keto Chicken Alfredo',
    description: 'Creamy alfredo sauce with grilled chicken over zucchini noodles',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    prepTime: 25,
    servings: 2,
    rating: 4.5,
    reviewCount: 203,
    dietary: ['Keto', 'Low-Carb', 'Gluten-Free'],
    category: 'Dinner',
    nutrition: {
      calories: 380,
      protein: 35,
      carbs: 12,
      fat: 24
    },
    stock: 20
  },
  {
    id: '6',
    name: 'Thai Green Curry',
    description: 'Aromatic coconut curry with vegetables, tofu, and jasmine rice',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
    prepTime: 35,
    servings: 2,
    rating: 4.9,
    reviewCount: 651,
    dietary: ['Vegan', 'Dairy-Free'],
    category: 'Dinner',
    nutrition: {
      calories: 450,
      protein: 16,
      carbs: 58,
      fat: 18
    },
    stock: 7
  }
];

export function MealOutpost({ className }: MealOutpostProps) {
  const [meals, setMeals] = useState<MealData[]>(SAMPLE_MEALS);
  const [filteredMeals, setFilteredMeals] = useState<MealData[]>(SAMPLE_MEALS);
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MealFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cartCount, setCartCount] = useState(0);

  // Filter meals based on search and filters
  useEffect(() => {
    let result = [...meals];

    // Search filter
    if (searchQuery) {
      result = result.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All Meals') {
      result = result.filter(meal => meal.category === filters.category);
    }

    // Dietary filter
    if (filters.dietary && filters.dietary.length > 0) {
      result = result.filter(meal =>
        filters.dietary?.some(diet => meal.dietary.includes(diet))
      );
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange !== 'All Prices') {
      const priceFilters: { [key: string]: (price: number) => boolean } = {
        'Under $10': (price) => price < 10,
        '$10 - $20': (price) => price >= 10 && price <= 20,
        '$20 - $30': (price) => price >= 20 && price <= 30,
        'Over $30': (price) => price > 30
      };
      const filterFn = priceFilters[filters.priceRange];
      if (filterFn) {
        result = result.filter(meal => filterFn(meal.price));
      }
    }

    // Prep time filter
    if (filters.prepTime && filters.prepTime !== 'All Times') {
      const timeFilters: { [key: string]: (time: number) => boolean } = {
        'Under 15 min': (time) => time < 15,
        '15-30 min': (time) => time >= 15 && time <= 30,
        '30-45 min': (time) => time >= 30 && time <= 45,
        'Over 45 min': (time) => time > 45
      };
      const filterFn = timeFilters[filters.prepTime];
      if (filterFn) {
        result = result.filter(meal => filterFn(meal.prepTime));
      }
    }

    setFilteredMeals(result);
  }, [searchQuery, filters, meals]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: MealFilters) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (meal: MealData) => {
    setSelectedMeal(meal);
  };

  const handleAddToCart = (meal: MealData) => {
    setCartCount(prev => prev + 1);
    // In production, this would add to actual cart
    console.log('Added to cart:', meal);
  };

  const handlePurchase = (meal: MealData, options: PurchaseOptions) => {
    // In production, this would process the purchase
    console.log('Purchase:', { meal, options });
    setCartCount(prev => prev + options.quantity);
    setSelectedMeal(null);
    // Show success message or redirect to checkout
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MealOutpost</h1>
              <p className="text-gray-600 text-sm">Fresh, delicious meals delivered to your door</p>
            </div>
            <Button type="button" className="relative">
              <FiShoppingCart className="mr-2 h-5 w-5" />
              Cart
              {cartCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 min-w-6 flex items-center justify-center"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <MealSearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {filteredMeals.length} {filteredMeals.length === 1 ? 'Meal' : 'Meals'} Available
            </h2>
            {searchQuery && (
              <p className="text-gray-600 text-sm mt-1">
                Showing results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <FiGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <FiList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Meals Grid */}
        {filteredMeals.length > 0 ? (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredMeals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <MealCard
                  meal={meal}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No meals found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailView
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
          onPurchase={handlePurchase}
        />
      )}
    </div>
  );
}
