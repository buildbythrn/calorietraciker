'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { LogOut, Calendar, Target, Dumbbell, Flame } from 'lucide-react';
import { getCalorieEntries, getHabits, calculateWorkoutStreak } from '@/lib/db';
import { CalorieEntry, Habit } from '@/lib/types';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calories, setCalories] = useState<CalorieEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loadingCalories, setLoadingCalories] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workoutStreak, setWorkoutStreak] = useState({ current: 0, longest: 0, lastCompletedDate: null });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadCalories();
      loadStats();
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

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

  const loadStats = async () => {
    if (!user) return;
    setLoadingStats(true);
    try {
      const userHabits = await getHabits(user.id);
      setHabits(userHabits);
      
      const streak = await calculateWorkoutStreak(user.id);
      setWorkoutStreak(streak);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/calories" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Today's Calories</p>
                <p className="text-3xl font-bold text-primary-600">{totalCalories}</p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Calendar className="text-primary-600" size={24} />
              </div>
            </div>
          </Link>

          <Link href="/habits" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Habits</p>
                {loadingStats ? (
                  <p className="text-3xl font-bold text-blue-600">...</p>
                ) : (
                  <p className="text-3xl font-bold text-blue-600">{habits.length}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">active habits</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="text-blue-600" size={24} />
              </div>
            </div>
          </Link>

          <Link href="/workouts" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workout Streak</p>
                {loadingStats ? (
                  <p className="text-3xl font-bold text-purple-600">...</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <Flame className="text-orange-500" size={20} />
                    <p className="text-3xl font-bold text-purple-600">{workoutStreak.current}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">days</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Dumbbell className="text-purple-600" size={24} />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Calories */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Calories</h2>
          {loadingCalories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : calories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No calories logged for this date.</p>
              <Link href="/calories" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                Add your first entry →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {calories.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{entry.food}</p>
                    <p className="text-sm text-gray-600 capitalize">{entry.mealType}</p>
                  </div>
                  <p className="font-semibold text-primary-600">{entry.calories} cal</p>
                </div>
              ))}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Total</p>
                  <p className="font-bold text-xl text-primary-600">{totalCalories} cal</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

