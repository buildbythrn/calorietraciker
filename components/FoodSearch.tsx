'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X } from 'lucide-react';
import { searchFood, searchFoodUSDA, FoodItem } from '@/lib/foodApi';

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function FoodSearch({ onSelect, value, onChange, placeholder = "Search for food..." }: FoodSearchProps) {
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for food when user types
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Try Edamam first, fallback to USDA
        let results = await searchFood(value);
        
        // If Edamam returns no results or is not configured, try USDA
        if (results.length === 0) {
          results = await searchFoodUSDA(value);
        }

        setSearchResults(results);
      } catch (error) {
        console.error('Error searching food:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce for 500ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  const handleSelect = (food: FoodItem) => {
    onChange(food.label);
    onSelect(food);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.trim().length >= 2 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" size={20} />
        )}
        {value && !isSearching && (
          <button
            onClick={() => {
              onChange('');
              setSearchResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {searchResults.map((food, index) => (
            <button
              key={food.foodId || index}
              type="button"
              onClick={() => handleSelect(food)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-primary-50' : ''
              } ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{food.label}</p>
                  {food.brand && (
                    <p className="text-sm text-gray-500">{food.brand}</p>
                  )}
                  {food.nutrients && (
                    <div className="flex gap-3 mt-1 text-xs text-gray-600">
                      {food.nutrients.protein !== undefined && (
                        <span>P: {food.nutrients.protein}g</span>
                      )}
                      {food.nutrients.carbs !== undefined && (
                        <span>C: {food.nutrients.carbs}g</span>
                      )}
                      {food.nutrients.fat !== undefined && (
                        <span>F: {food.nutrients.fat}g</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <p className="font-semibold text-primary-600">{food.calories}</p>
                  <p className="text-xs text-gray-500">cal</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && !isSearching && searchResults.length === 0 && value.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No food items found. Try a different search term.
        </div>
      )}
    </div>
  );
}

