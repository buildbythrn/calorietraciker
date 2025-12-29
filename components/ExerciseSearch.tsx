'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, Dumbbell } from 'lucide-react';
import { searchExercises, Exercise } from '@/lib/exerciseApi';

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  exerciseType?: 'cardio' | 'strength' | 'flexibility' | 'other';
}

export default function ExerciseSearch({ 
  onSelect, 
  value, 
  onChange, 
  placeholder = "Search for exercise...",
  exerciseType 
}: ExerciseSearchProps) {
  const [searchResults, setSearchResults] = useState<Exercise[]>([]);
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

  // Search for exercises when user types
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
        const results = await searchExercises(value);
        // Filter by type if specified
        const filtered = exerciseType 
          ? results.filter(ex => ex.type === exerciseType)
          : results;
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching exercises:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce for 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value, exerciseType]);

  const handleSelect = (exercise: Exercise) => {
    onChange(exercise.name);
    onSelect(exercise);
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

  const getTypeColor = (type: Exercise['type']) => {
    switch (type) {
      case 'cardio': return 'bg-red-100 text-red-700';
      case 'strength': return 'bg-blue-100 text-blue-700';
      case 'flexibility': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
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
          {searchResults.map((exercise, index) => (
            <button
              key={`${exercise.name}-${index}`}
              type="button"
              onClick={() => handleSelect(exercise)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-primary-50' : ''
              } ${index !== searchResults.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{exercise.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${getTypeColor(exercise.type)}`}>
                      {exercise.type}
                    </span>
                  </div>
                  {exercise.description && (
                    <p className="text-sm text-gray-600 mb-1">{exercise.description}</p>
                  )}
                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {exercise.muscleGroups.join(', ')}
                    </p>
                  )}
                </div>
                <div className="ml-4 text-right">
                  <p className="font-semibold text-primary-600">{exercise.caloriesPerMinute}</p>
                  <p className="text-xs text-gray-500">cal/min</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && !isSearching && searchResults.length === 0 && value.trim().length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No exercises found. Try a different search term.
        </div>
      )}
    </div>
  );
}

