'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { 
  getCalorieEntries, 
  getWorkouts, 
  getHabits, 
  getHabitEntries, 
  getWeightEntries 
} from '@/lib/db';
import { 
  calculateCalorieStats, 
  calculateWorkoutStats, 
  calculateHabitStats, 
  calculateWeightStats,
  getDateRange,
  DateRange 
} from '@/lib/analytics';
import CalorieChart from '@/components/charts/CalorieChart';
import WorkoutChart from '@/components/charts/WorkoutChart';
import HabitChart from '@/components/charts/HabitChart';
import WeightChart from '@/components/charts/WeightChart';
import ProgressChart from '@/components/charts/ProgressChart';
import { exportToPDF } from '@/lib/export';
import PetMascot from '@/components/mascots/PetMascot';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [loadingData, setLoadingData] = useState(true);
  const [calorieStats, setCalorieStats] = useState<any>(null);
  const [workoutStats, setWorkoutStats] = useState<any>(null);
  const [habitStats, setHabitStats] = useState<any>(null);
  const [weightStats, setWeightStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // Load all data
      const allCalorieEntries: any[] = [];
      const allWorkouts = await getWorkouts(user.id);
      const habits = await getHabits(user.id);
      const weightEntries = await getWeightEntries(user.id);

      // Get calorie entries for date range
      const { start, end } = getDateRangeForEntries();
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const entries = await getCalorieEntries(user.id, dateStr);
        allCalorieEntries.push(...entries);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Get habit entries
      const allHabitEntries: any[] = [];
      for (const habit of habits) {
        const entries = await getHabitEntries(habit.id, user.id);
        allHabitEntries.push(...entries);
      }

      // Calculate stats
      setCalorieStats(calculateCalorieStats(allCalorieEntries, dateRange));
      setWorkoutStats(calculateWorkoutStats(allWorkouts, dateRange));
      setHabitStats(calculateHabitStats(habits, allHabitEntries, dateRange));
      setWeightStats(calculateWeightStats(weightEntries));
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getDateRangeForEntries = () => {
    return getDateRange(dateRange);
  };

  const handleExportPDF = async () => {
    if (!user) return;
    try {
      await exportToPDF(user.id, dateRange);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <PetMascot petType="owl" size="sm" iconType="analytics" mood="happy" className="animate-float flex-shrink-0" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Analytics</h1>
              </div>
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 sm:gap-2 bg-primary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex-shrink-0 text-sm sm:text-base"
            >
              <Download size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {loadingData ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Calorie Statistics */}
            {calorieStats && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Calorie Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Calories</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{calorieStats.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Daily</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calorieStats.average}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Min Daily</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{calorieStats.min}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Max Daily</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{calorieStats.max}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
                  {calorieStats.trend === 'up' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Increasing</span>
                    </div>
                  )}
                  {calorieStats.trend === 'down' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown size={16} />
                      <span className="text-sm font-medium">Decreasing</span>
                    </div>
                  )}
                  {calorieStats.trend === 'stable' && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <Minus size={16} />
                      <span className="text-sm font-medium">Stable</span>
                    </div>
                  )}
                </div>
                {calorieStats.dailyAverages.length > 0 && (
                  <CalorieChart data={calorieStats.dailyAverages} />
                )}
              </div>
            )}

            {/* Workout Statistics */}
            {workoutStats && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Workout Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Workouts</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{workoutStats.totalWorkouts}</p>
                  </div>
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calories Burned</p>
                    <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{workoutStats.totalCaloriesBurned.toLocaleString()}</p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg per Workout</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{workoutStats.averageCaloriesPerWorkout}</p>
                  </div>
                  <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Most Common</p>
                    <p className="text-lg font-bold text-violet-600 dark:text-violet-400 truncate">{workoutStats.mostCommonExercise || 'N/A'}</p>
                  </div>
                </div>
                {workoutStats.workoutFrequency.length > 0 && (
                  <WorkoutChart 
                    frequencyData={workoutStats.workoutFrequency}
                    caloriesData={workoutStats.caloriesBurnedByDay}
                  />
                )}
              </div>
            )}

            {/* Habit Statistics */}
            {habitStats && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Habit Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Habits</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{habitStats.totalHabits}</p>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Completion</p>
                    <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{habitStats.averageCompletionRate}%</p>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Best Habit</p>
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400 truncate">{habitStats.bestHabit || 'N/A'}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Needs Work</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">{habitStats.worstHabit || 'N/A'}</p>
                  </div>
                </div>
                {habitStats.completionByDay.length > 0 && (
                  <HabitChart data={habitStats.completionByDay} />
                )}
              </div>
            )}

            {/* Weight Statistics */}
            {weightStats && weightStats.weightTrend.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Weight Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Weight</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {weightStats.currentWeight ? `${weightStats.currentWeight} kg` : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weight Change</p>
                    <p className={`text-2xl font-bold ${weightStats.weightChange >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {weightStats.weightChange >= 0 ? '+' : ''}{weightStats.weightChange} kg
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Weight</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{weightStats.averageWeight} kg</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">BMI</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {weightStats.bmi ? weightStats.bmi.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                </div>
                <WeightChart data={weightStats.weightTrend} />
              </div>
            )}

            {/* Combined Progress Chart */}
            {calorieStats && workoutStats && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Calories In vs Out</h2>
                <ProgressChart 
                  calorieData={calorieStats.dailyAverages}
                  workoutData={workoutStats.caloriesBurnedByDay}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

