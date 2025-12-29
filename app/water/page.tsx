'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Droplet } from 'lucide-react';
import { addWaterEntry, getWaterEntries, getDailyWaterTotal, deleteWaterEntry } from '@/lib/db';
import { WaterEntry } from '@/lib/types';

export default function WaterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [waterGoal, setWaterGoal] = useState(2000); // Default 2L in ml

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWaterEntries();
    }
  }, [user, selectedDate]);

  const loadWaterEntries = async () => {
    if (!user) return;
    setLoadingEntries(true);
    try {
      const entries = await getWaterEntries(user.id, selectedDate);
      setWaterEntries(entries);
      const total = await getDailyWaterTotal(user.id, selectedDate);
      setDailyTotal(total);
    } catch (error) {
      console.error('Error loading water entries:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleQuickAdd = async (amount: number) => {
    if (!user) return;
    try {
      await addWaterEntry({
        userId: user.id,
        date: selectedDate,
        amount,
      });
      loadWaterEntries();
    } catch (error) {
      console.error('Error adding water entry:', error);
      alert('Failed to add water entry');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWaterEntry(id);
      loadWaterEntries();
    } catch (error) {
      console.error('Error deleting water entry:', error);
      alert('Failed to delete water entry');
    }
  };

  const progressPercentage = Math.min((dailyTotal / waterGoal) * 100, 100);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Water Intake</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Progress Circle */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 80}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * (1 - progressPercentage / 100)}`}
                  className="text-blue-500 transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplet className="text-blue-500 dark:text-blue-400 mb-2" size={32} />
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{dailyTotal}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">ml / {waterGoal} ml</p>
              </div>
            </div>
            <div className="w-full max-w-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Quick Add</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => handleQuickAdd(250)}
              className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              +250 ml
            </button>
            <button
              onClick={() => handleQuickAdd(500)}
              className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              +500 ml
            </button>
            <button
              onClick={() => handleQuickAdd(750)}
              className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              +750 ml
            </button>
            <button
              onClick={() => handleQuickAdd(1000)}
              className="px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
            >
              +1 L
            </button>
          </div>
        </div>

        {/* Custom Amount */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Custom Amount</h2>
          <div className="flex gap-3">
            <input
              type="number"
              id="customAmount"
              min="1"
              step="50"
              placeholder="Enter amount in ml"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => {
                const input = document.getElementById('customAmount') as HTMLInputElement;
                const amount = parseFloat(input.value);
                if (amount > 0) {
                  handleQuickAdd(amount);
                  input.value = '';
                }
              }}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Water Goal Setting */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Daily Water Goal</h2>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              value={waterGoal}
              onChange={(e) => setWaterGoal(parseFloat(e.target.value) || 2000)}
              min="500"
              step="100"
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <span className="text-gray-600 dark:text-gray-400">ml per day</span>
          </div>
        </div>

        {/* Water History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Water Intake for {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </h2>
          {loadingEntries ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : waterEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Droplet size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="mb-2">No water logged for this date.</p>
              <p className="text-sm">Use the quick add buttons above to track your water intake!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {waterEntries
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Droplet className="text-blue-500 dark:text-blue-400" size={20} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{entry.amount} ml</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {format(entry.createdAt, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <span className="text-sm">Remove</span>
                    </button>
                  </div>
                ))}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900 dark:text-white">Total</p>
                  <p className="font-bold text-xl text-blue-600 dark:text-blue-400">{dailyTotal} ml</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

