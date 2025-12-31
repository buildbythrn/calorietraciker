'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Scale } from 'lucide-react';
import { addWeightEntry, getWeightEntries, deleteWeightEntry } from '@/lib/db';
import { WeightEntry } from '@/lib/types';
import WeightChart from '@/components/charts/WeightChart';
import { calculateWeightStats } from '@/lib/analytics';

export default function WeightPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWeightEntries();
    }
  }, [user]);

  const loadWeightEntries = async () => {
    if (!user) return;
    setLoadingEntries(true);
    try {
      const entries = await getWeightEntries(user.id);
      setWeightEntries(entries);
    } catch (error) {
      console.error('Error loading weight entries:', error);
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addWeightEntry({
        userId: user.id,
        weight: parseFloat(formData.weight),
        date: formData.date,
        notes: formData.notes || undefined,
      });
      setFormData({ weight: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
      setShowAddForm(false);
      loadWeightEntries();
    } catch (error) {
      console.error('Error adding weight entry:', error);
      alert('Failed to add weight entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight entry?')) return;
    try {
      await deleteWeightEntry(id);
      loadWeightEntries();
    } catch (error) {
      console.error('Error deleting weight entry:', error);
      alert('Failed to delete weight entry');
    }
  };

  const weightStats = calculateWeightStats(weightEntries, height || undefined);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Weight Tracking</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {weightStats.currentWeight !== null && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Current Weight</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">{weightStats.currentWeight} kg</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600 mb-1">Weight Change</p>
              <p className={`text-2xl font-bold ${weightStats.weightChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {weightStats.weightChange >= 0 ? '+' : ''}{weightStats.weightChange} kg
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600 mb-1">Average Weight</p>
              <p className="text-2xl font-bold text-blue-600">{weightStats.averageWeight} kg</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <p className="text-sm text-gray-600 mb-1">BMI</p>
              <p className="text-2xl font-bold text-purple-600">
                {weightStats.bmi ? weightStats.bmi.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Height Input for BMI */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height (cm) - for BMI calculation
          </label>
          <input
            type="number"
            value={height || ''}
            onChange={(e) => setHeight(e.target.value ? parseFloat(e.target.value) : null)}
            min="100"
            max="250"
            className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., 175"
          />
        </div>

        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Weight Entry
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Weight Entry</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 70.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., After workout, morning weight..."
                />
              </div>
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
                    setFormData({ weight: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Weight Chart */}
        {weightStats.weightTrend.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Weight Trend</h2>
            <WeightChart data={weightStats.weightTrend} />
          </div>
        )}

        {/* Weight History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Weight History</h2>
          {loadingEntries ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : weightEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Scale size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No weight entries yet.</p>
              <p className="text-sm">Click "Add Weight Entry" to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weightEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">{entry.weight} kg</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(entry.date), 'MMMM d, yyyy')}
                      </p>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

