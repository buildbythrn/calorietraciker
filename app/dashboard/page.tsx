'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { LogOut, Calendar, Target, Dumbbell, Flame, TrendingUp, Scale, Droplet, Ruler, Trophy, Settings, Utensils, CheckCircle2 } from 'lucide-react';
import { getCalorieEntries, getHabits, calculateWorkoutStreak, getWeightEntries, getDailyWaterTotal, getGoals } from '@/lib/db';
import { CalorieEntry, Habit } from '@/lib/types';
import PetMascot from '@/components/mascots/PetMascot';
import WeeklyReminderBanner from '@/components/WeeklyReminderBanner';

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calories, setCalories] = useState<CalorieEntry[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [loadingCalories, setLoadingCalories] = useState(true);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [workoutStreak, setWorkoutStreak] = useState<{ current: number; longest: number; lastCompletedDate: string | null }>({ current: 0, longest: 0, lastCompletedDate: null });
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [dailyWater, setDailyWater] = useState(0);
  const [activeGoals, setActiveGoals] = useState(0);

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

      // Load weight
      const weightEntries = await getWeightEntries(user.id);
      if (weightEntries.length > 0) {
        setCurrentWeight(weightEntries[0].weight);
      }

      // Load water
      const today = format(new Date(), 'yyyy-MM-dd');
      const waterTotal = await getDailyWaterTotal(user.id, today);
      setDailyWater(waterTotal);

      // Load goals
      const goals = await getGoals(user.id, true);
      setActiveGoals(goals.length);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <PetMascot petType="panda" size="sm" iconType="default" mood="happy" className="animate-float" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weekly Reminders */}
        <WeeklyReminderBanner />
        
        {/* Date Selector */}
        <div className="mb-6">
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

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Link href="/calories" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Calories</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalCalories}</p>
              </div>
              <Calendar className="text-primary-600" size={20} />
            </div>
          </Link>

          <Link href="/workouts" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Streak</p>
                {loadingStats ? (
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">...</p>
                ) : (
                  <div className="flex items-center gap-1">
                    <Flame className="text-orange-500" size={16} />
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{workoutStreak.current}</p>
                  </div>
                )}
              </div>
              <Dumbbell className="text-purple-600" size={20} />
            </div>
          </Link>

          <Link href="/habits" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Habits</p>
                {loadingStats ? (
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">...</p>
                ) : (
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{habits.length}</p>
                )}
              </div>
              <CheckCircle2 className="text-blue-600" size={20} />
            </div>
          </Link>

          <Link href="/weight" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Weight</p>
                {loadingStats ? (
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">...</p>
                ) : currentWeight ? (
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{currentWeight}kg</p>
                ) : (
                  <p className="text-sm font-bold text-gray-400">--</p>
                )}
              </div>
              <Scale className="text-amber-600" size={20} />
            </div>
          </Link>

          <Link href="/water" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Water</p>
                {loadingStats ? (
                  <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">...</p>
                ) : (
                  <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">{Math.round(dailyWater / 100) / 10}L</p>
                )}
              </div>
              <Droplet className="text-blue-500" size={20} />
            </div>
          </Link>

          <Link href="/goals" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Goals</p>
                {loadingStats ? (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">...</p>
                ) : (
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{activeGoals}</p>
                )}
              </div>
              <Target className="text-green-600" size={20} />
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/analytics" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
            <TrendingUp className="text-indigo-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Analytics</p>
          </Link>
          <Link href="/meal-planning" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
            <Utensils className="text-orange-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Meal Plan</p>
          </Link>
          <Link href="/nutrition" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
            <Target className="text-green-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Nutrition</p>
          </Link>
          <Link href="/achievements" className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow text-center">
            <Trophy className="text-yellow-600 mx-auto mb-2" size={24} />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Achievements</p>
          </Link>
        </div>

        {/* Recent Calories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Today's Calories</h2>
          {loadingCalories ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : calories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="flex justify-center mb-4">
                <PetMascot petType="panda" size="md" iconType="food" mood="hungry" className="animate-float" />
              </div>
              <p className="mb-2">No calories logged for this date.</p>
              <Link href="/calories" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mt-2 inline-block">
                Add your first entry →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {calories.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{entry.food}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{entry.mealType}</p>
                  </div>
                  <p className="font-semibold text-primary-600 dark:text-primary-400">{entry.calories} cal</p>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Total</p>
                  <p className="font-bold text-xl text-primary-600 dark:text-primary-400">{totalCalories} cal</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

