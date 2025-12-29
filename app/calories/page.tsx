'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { getCalorieEntries, addCalorieEntry, deleteCalorieEntry } from '@/lib/db';
import FoodSearch from '@/components/FoodSearch';
import { FoodItem } from '@/lib/foodApi';
import { CalorieEntry } from '@/lib/types';

export default function CaloriesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calories, setCalories] = useState<CalorieEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loadingCalories, setLoadingCalories] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    food: '',
    calories: '',
    quantity: '1',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadCalories();
    }
  }, [user, selectedDate]);

  const loadCalories = async () => {
    if (!user) return;
    setLoadingCalories(true);
    try {
      const entries = await getCalorieEntries(user.id, selectedDate);
      setCalories(entries);
      setTotalCalories(entries.reduce((sum, entry) => sum + entry.calories, 0));
    } catch (error) {
      console.error('Error loading calories:', error);
    } finally {
      setLoadingCalories(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const quantity = parseFloat(formData.quantity) || 1;
      const baseCalories = parseFloat(formData.calories) || 0;
      const totalCalories = Math.round(baseCalories * quantity);
      
      await addCalorieEntry({
        userId: user.id,
        date: selectedDate,
        food: formData.food,
        calories: totalCalories,
        quantity: quantity > 1 ? quantity : undefined,
        mealType: formData.mealType,
      });
      setFormData({ food: '', calories: '', quantity: '1', mealType: 'breakfast' });
      setShowAddForm(false);
      loadCalories();
    } catch (error) {
      console.error('Error adding calorie entry:', error);
      alert('Failed to add entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteCalorieEntry(id);
      loadCalories();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calorie Tracker</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Entry
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add Calorie Entry</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Item
                  <span className="ml-2 text-xs text-gray-500 font-normal">
                    (Search to auto-fill calories)
                  </span>
                </label>
                <FoodSearch
                  value={formData.food}
                  onChange={(value) => setFormData({ ...formData, food: value })}
                  onSelect={(food: FoodItem) => {
                    setFormData({
                      ...formData,
                      food: food.label,
                      calories: food.calories.toString(),
                    });
                  }}
                  placeholder="e.g., Grilled Chicken Breast"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calories (per serving)
                  </label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    required
                    min="1"
                    step="1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    min="0.1"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="1"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">e.g., 2 servings, 1.5 cups</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meal Type
                  </label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>
              </div>
              {formData.calories && formData.quantity && (
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Total Calories: </span>
                    {Math.round((parseFloat(formData.calories) || 0) * (parseFloat(formData.quantity) || 1))} cal
                    {parseFloat(formData.quantity) > 1 && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        ({formData.calories} × {formData.quantity})
                      </span>
                    )}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ food: '', calories: '', quantity: '1', mealType: 'breakfast' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Entries for {format(new Date(selectedDate), 'MMMM d, yyyy')}</h2>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Calories</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{totalCalories}</p>
            </div>
          </div>

          {loadingCalories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : calories.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="mb-2">No entries for this date.</p>
              <p className="text-sm">Click "Add Entry" to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {calories.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {entry.food}
                      {entry.quantity && entry.quantity > 1 && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                          (×{entry.quantity})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{entry.mealType}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-xl text-primary-600 dark:text-primary-400">{entry.calories} cal</p>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

