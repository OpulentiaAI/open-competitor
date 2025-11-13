'use client';

import { useState } from 'react';
import { FiX, FiStar, FiClock, FiShoppingCart, FiHeart, FiShare2, FiTruck, FiShield, FiCheckCircle, FiMinus, FiPlus } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { MealData } from './MealCard';

interface MealDetailViewProps {
  meal: MealData;
  onClose: () => void;
  onPurchase: (meal: MealData, options: PurchaseOptions) => void;
}

export interface PurchaseOptions {
  quantity: number;
  servingSize: number;
  deliveryDate: string;
  addons: string[];
  specialInstructions?: string;
}

export function MealDetailView({ meal, onClose, onPurchase }: MealDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [servingSize, setServingSize] = useState(meal.servings);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sample images (would normally come from meal.images array)
  const images = [meal.image, meal.image, meal.image];

  // Sample addons with prices
  const addons = [
    { id: 'bread', name: 'Artisan Bread', price: 3.99 },
    { id: 'salad', name: 'Side Salad', price: 4.99 },
    { id: 'dessert', name: 'Dessert', price: 5.99 },
    { id: 'drink', name: 'Beverage', price: 2.99 },
  ];

  // Calculate pricing
  const basePrice = meal.price * servingSize;
  const subtotal = basePrice * quantity;
  const addonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = addons.find(a => a.id === addonId);
    return sum + (addon ? addon.price * quantity : 0);
  }, 0);
  const deliveryFee = 4.99;
  const tax = (subtotal + addonsTotal) * 0.08;
  const total = subtotal + addonsTotal + deliveryFee + tax;

  // Delivery dates (next 7 days)
  const getDeliveryDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return dates;
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta));
    setQuantity(newQuantity);
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleBuyNow = () => {
    const options: PurchaseOptions = {
      quantity,
      servingSize,
      deliveryDate,
      addons: selectedAddons
    };
    onPurchase(meal, options);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all"
            aria-label="Close"
          >
            <FiX className="h-6 w-6 text-gray-700" />
          </button>

          <div className="grid md:grid-cols-2 gap-0 overflow-y-auto max-h-[90vh]">
            {/* Left Column - Images */}
            <div className="p-8 bg-gray-50">
              <div className="sticky top-8 space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-lg">
                  <img
                    src={images[selectedImage]}
                    alt={meal.name}
                    className="w-full h-full object-cover"
                  />
                  {meal.stock !== undefined && meal.stock < 5 && (
                    <Badge variant="warning" className="absolute top-4 left-4">
                      Only {meal.stock} left!
                    </Badge>
                  )}
                </div>

                {/* Thumbnail Images */}
                <div className="flex gap-3">
                  {images.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={cn(
                        "relative aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all",
                        selectedImage === idx
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-transparent hover:border-gray-300"
                      )}
                    >
                      <img
                        src={img}
                        alt={`${meal.name} view ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <FiHeart className={cn("mr-2 h-4 w-4", isFavorite && "fill-current text-red-500")} />
                    {isFavorite ? 'Saved' : 'Save'}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1">
                    <FiShare2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Details & Purchase */}
            <div className="p-8 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 pr-12">
                    {meal.name}
                  </h1>
                </div>

                {/* Rating & Category */}
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <FiStar className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{meal.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">
                      ({meal.reviewCount} reviews)
                    </span>
                  </div>
                  <Badge variant="secondary">{meal.category}</Badge>
                </div>

                {/* Dietary Tags */}
                <div className="flex flex-wrap gap-2">
                  {meal.dietary.map(diet => (
                    <Badge key={diet} variant="success">
                      {diet}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">{meal.description}</p>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div className="flex items-center gap-2">
                  <FiClock className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Prep Time</div>
                    <div className="font-semibold">{meal.prepTime} minutes</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍽️</span>
                  <div>
                    <div className="text-sm text-gray-500">Default Servings</div>
                    <div className="font-semibold">{meal.servings} servings</div>
                  </div>
                </div>
              </div>

              {/* Nutrition Facts */}
              {meal.nutrition && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Nutrition Facts (per serving)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {meal.nutrition.calories}
                        </div>
                        <div className="text-xs text-gray-500">Calories</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {meal.nutrition.protein}g
                        </div>
                        <div className="text-xs text-gray-500">Protein</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {meal.nutrition.carbs}g
                        </div>
                        <div className="text-xs text-gray-500">Carbs</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {meal.nutrition.fat}g
                        </div>
                        <div className="text-xs text-gray-500">Fat</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Options */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="font-semibold text-lg">Customize Your Order</h3>

                {/* Serving Size */}
                <div>
                  <label htmlFor="servingSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Servings
                  </label>
                  <Select
                    value={servingSize.toString()}
                    onValueChange={(value) => setServingSize(Number(value))}
                  >
                    <SelectTrigger id="servingSize">
                      <SelectValue placeholder="Select servings" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 4, 6, 8, 10].map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} servings (${(meal.price * size).toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <FiMinus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                    >
                      <FiPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Delivery Date */}
                <div>
                  <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date
                  </label>
                  <Select
                    value={deliveryDate}
                    onValueChange={setDeliveryDate}
                  >
                    <SelectTrigger id="deliveryDate">
                      <SelectValue placeholder="Select delivery date" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDeliveryDates().map(date => (
                        <SelectItem key={date.value} value={date.value}>
                          {date.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Add-ons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add-ons (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {addons.map(addon => (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-left",
                          selectedAddons.includes(addon.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{addon.name}</div>
                            <div className="text-sm text-gray-600">
                              +${addon.price.toFixed(2)}
                            </div>
                          </div>
                          {selectedAddons.includes(addon.id) && (
                            <FiCheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <Card className="bg-gray-50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Meal ({quantity}x @ ${basePrice.toFixed(2)})
                    </span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Add-ons</span>
                      <span className="font-medium">${addonsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-3xl font-bold text-blue-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="flex flex-col items-center gap-1">
                  <FiTruck className="h-5 w-5 text-green-600" />
                  <span className="text-gray-600">Free Delivery Over $50</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FiShield className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-600">100% Fresh Guarantee</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <FiCheckCircle className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-600">Easy Returns</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  type="button"
                  className="w-full h-14 text-lg font-semibold"
                  onClick={handleBuyNow}
                  disabled={!deliveryDate}
                >
                  <FiShoppingCart className="mr-2 h-5 w-5" />
                  Buy Now - ${total.toFixed(2)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
