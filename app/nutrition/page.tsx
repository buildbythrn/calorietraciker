'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { getCalorieEntries } from '@/lib/db';
import { CalorieEntry } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function NutritionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [calorieEntries, setCalorieEntries] = useState<CalorieEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [nutritionData, setNutritionData] = useState({
    totalCalories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    proteinCalories: 0,
    carbsCalories: 0,
    fatCalories: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadNutritionData();
    }
  }, [user, selectedDate]);

  const loadNutritionData = async () => {
    if (!user) return;
    setLoadingEntries(true);
    try {
      const entries = await getCalorieEntries(user.id, selectedDate);
      setCalorieEntries(entries);
      
      // Calculate macros (simplified - in real app, get from food API)
      // For now, we'll estimate based on calories
      const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
      const estimatedProtein = Math.round(totalCalories * 0.25 / 4); // 25% protein, 4 cal/g
      const estimatedCarbs = Math.round(totalCalories * 0.45 / 4); // 45% carbs, 4 cal/g
      const estimatedFat = Math.round(totalCalories * 0.30 / 9); // 30% fat, 9 cal/g
      
      setNutritionData({
        totalCalories: totalCalories,
        protein: estimatedProtein,
        carbs: estimatedCarbs,
        fat: estimatedFat,
        proteinCalories: estimatedProtein * 4,
        carbsCalories: estimatedCarbs * 4,
        fatCalories: estimatedFat * 9,
      });
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const macroData = [
    { name: 'Protein', value: nutritionData.proteinCalories, grams: nutritionData.protein, color: '#3b82f6' },
    { name: 'Carbs', value: nutritionData.carbsCalories, grams: nutritionData.carbs, color: '#22c55e' },
    { name: 'Fat', value: nutritionData.fatCalories, grams: nutritionData.fat, color: '#f59e0b' },
  ];

  const mealTypeData = [
    { name: 'Breakfast', calories: calorieEntries.filter(e => e.mealType === 'breakfast').reduce((sum, e) => sum + e.calories, 0) },
    { name: 'Lunch', calories: calorieEntries.filter(e => e.mealType === 'lunch').reduce((sum, e) => sum + e.calories, 0) },
    { name: 'Dinner', calories: calorieEntries.filter(e => e.mealType === 'dinner').reduce((sum, e) => sum + e.calories, 0) },
    { name: 'Snacks', calories: calorieEntries.filter(e => e.mealType === 'snack').reduce((sum, e) => sum + e.calories, 0) },
  ];

  const nutritionScore = calculateNutritionScore(nutritionData);

  function calculateNutritionScore(data: typeof nutritionData): number {
    // Simple scoring algorithm (0-100)
    let score = 100;
    
    // Deduct points for imbalances
    const proteinPercent = (data.proteinCalories / data.totalCalories) * 100;
    const carbsPercent = (data.carbsCalories / data.totalCalories) * 100;
    const fatPercent = (data.fatCalories / data.totalCalories) * 100;
    
    // Ideal ranges: Protein 20-30%, Carbs 40-50%, Fat 25-35%
    if (proteinPercent < 20 || proteinPercent > 30) score -= 10;
    if (carbsPercent < 40 || carbsPercent > 50) score -= 10;
    if (fatPercent < 25 || fatPercent > 35) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  const getRecommendations = () => {
    const recommendations: string[] = [];
    const proteinPercent = (nutritionData.proteinCalories / nutritionData.totalCalories) * 100;
    const carbsPercent = (nutritionData.carbsCalories / nutritionData.totalCalories) * 100;
    const fatPercent = (nutritionData.fatCalories / nutritionData.totalCalories) * 100;

    if (proteinPercent < 20) {
      recommendations.push('Consider adding more protein to your meals');
    }
    if (carbsPercent > 50) {
      recommendations.push('Try reducing carbohydrate intake');
    }
    if (fatPercent < 25) {
      recommendations.push('Include healthy fats in your diet');
    }
    if (nutritionData.totalCalories < 1200) {
      recommendations.push('Your calorie intake is very low. Consider eating more.');
    }
    if (nutritionData.totalCalories > 3000) {
      recommendations.push('Your calorie intake is high. Consider portion control.');
    }

    return recommendations.length > 0 ? recommendations : ['Your nutrition looks balanced! Keep it up!'];
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nutrition Insights</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {loadingEntries ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Nutrition Score */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-sm p-6 mb-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Nutrition Score</p>
                  <p className="text-5xl font-bold">{nutritionScore}</p>
                  <p className="text-sm opacity-90 mt-1">out of 100</p>
                </div>
                <TrendingUp size={64} className="opacity-20" />
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Macro Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, grams }) => `${name}: ${grams}g`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {macroData.map((macro) => (
                    <div key={macro.name} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: macro.color }}
                          />
                          <span className="font-semibold text-gray-900 dark:text-white">{macro.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{macro.grams}g</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {macro.value} calories ({Math.round((macro.value / nutritionData.totalCalories) * 100)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Calories by Meal Type */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Calories by Meal Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mealTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="calories" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Recommendations</h2>
              <ul className="space-y-2">
                {getRecommendations().map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-primary-600 dark:text-primary-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

