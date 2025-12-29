'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Calendar, Utensils } from 'lucide-react';
import { addMealPlan, getMealPlans, deleteMealPlan } from '@/lib/db';
import { MealPlan } from '@/lib/types';
import FoodSearch from '@/components/FoodSearch';
import { FoodItem } from '@/lib/foodApi';

export default function MealPlanningPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snacks'>('breakfast');
  const [formData, setFormData] = useState({
    food: '',
    calories: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadMealPlans();
    }
  }, [user, weekStart]);

  const loadMealPlans = async () => {
    if (!user) return;
    setLoadingPlans(true);
    try {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const plans: MealPlan[] = [];
      
      const currentDate = new Date(weekStart);
      while (currentDate <= weekEnd) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayPlans = await getMealPlans(user.id, dateStr);
        if (dayPlans.length > 0) {
          plans.push(...dayPlans);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleAddMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Get or create meal plan for selected date
      let mealPlan = mealPlans.find(p => p.date === selectedDate);
      
      if (!mealPlan) {
        // Create new meal plan
        const newPlan = await addMealPlan({
          userId: user.id,
          date: selectedDate,
          meals: {
            [selectedMealType]: [formData.food],
          },
          totalCalories: parseInt(formData.calories) || undefined,
        });
        mealPlan = newPlan;
      } else {
        // Update existing meal plan
        const updatedMeals = {
          ...mealPlan.meals,
          [selectedMealType]: [...(mealPlan.meals[selectedMealType] || []), formData.food],
        };
        const totalCalories = (mealPlan.totalCalories || 0) + (parseInt(formData.calories) || 0);
        
        // Note: We'd need an updateMealPlan function, for now we'll delete and recreate
        await deleteMealPlan(mealPlan.id);
        await addMealPlan({
          userId: user.id,
          date: selectedDate,
          meals: updatedMeals,
          totalCalories,
        });
      }

      setFormData({ food: '', calories: '' });
      setShowAddForm(false);
      loadMealPlans();
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Failed to add meal');
    }
  };

  const handleFoodSelect = (food: FoodItem) => {
    setFormData({
      food: food.label,
      calories: food.calories.toString(),
    });
  };

  const handleRemoveMeal = async (planId: string, mealType: string, foodIndex: number) => {
    if (!user) return;
    try {
      const plan = mealPlans.find(p => p.id === planId);
      if (!plan) return;

      const updatedMeals = { ...plan.meals };
      const mealArray = updatedMeals[mealType as keyof typeof updatedMeals] as string[] | undefined;
      if (mealArray) {
        mealArray.splice(foodIndex, 1);
        if (mealArray.length === 0) {
          delete updatedMeals[mealType as keyof typeof updatedMeals];
        }
      }

      // Recalculate total calories
      // For simplicity, we'll just delete and recreate
      await deleteMealPlan(planId);
      if (Object.keys(updatedMeals).length > 0) {
        await addMealPlan({
          userId: user.id,
          date: plan.date,
          meals: updatedMeals,
        });
      }

      loadMealPlans();
    } catch (error) {
      console.error('Error removing meal:', error);
      alert('Failed to remove meal');
    }
  };

  const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 1 }) });

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meal Planning</h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              Add Meal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              ← Previous Week
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">
              {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </span>
            <button
              onClick={() => setWeekStart(addDays(weekStart, 7))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Next Week →
            </button>
          </div>
        </div>

        {/* Add Meal Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Meal to Plan</h2>
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snacks">Snacks</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Food Item
                </label>
                <FoodSearch
                  value={formData.food}
                  onChange={(value) => setFormData({ ...formData, food: value })}
                  onSelect={handleFoodSelect}
                  placeholder="Search for food..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calories
                </label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add to Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ food: '', calories: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Weekly Meal Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayPlan = mealPlans.find(p => p.date === dateStr);
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={dateStr}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 ${
                  isToday ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(day, 'EEE')}
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {format(day, 'MMM d')}
                  </p>
                  {dayPlan?.totalCalories && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      {dayPlan.totalCalories} cal
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealType) => {
                    const meals = dayPlan?.meals[mealType] || [];
                    return (
                      <div key={mealType} className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">
                          {mealType}
                        </p>
                        {meals.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500">No meals</p>
                        ) : (
                          <ul className="space-y-1">
                            {meals.map((food, index) => (
                              <li
                                key={index}
                                className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-700 rounded p-1"
                              >
                                <span className="truncate flex-1">{food}</span>
                                {dayPlan && (
                                  <button
                                    onClick={() => handleRemoveMeal(dayPlan.id, mealType, index)}
                                    className="ml-2 text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

