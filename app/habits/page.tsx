'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Flame, CheckCircle2 } from 'lucide-react';
import { getHabits, addHabit, deleteHabit, getHabitEntries, toggleHabitEntry, calculateHabitStreak } from '@/lib/db';
import { Habit, HabitEntry, Streak } from '@/lib/types';
import PetMascot from '@/components/mascots/PetMascot';

const habitColors = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Red', value: 'bg-red-500' },
];

export default function HabitsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<Record<string, HabitEntry[]>>({});
  const [streaks, setStreaks] = useState<Record<string, Streak>>({});
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'bg-blue-500',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  useEffect(() => {
    if (user && habits.length > 0) {
      loadHabitEntries();
    }
  }, [user, habits, selectedDate]);

  const loadHabits = async () => {
    if (!user) return;
    setLoadingHabits(true);
    try {
      const userHabits = await getHabits(user.id);
      setHabits(userHabits);
    } catch (error) {
      console.error('Error loading habits:', error);
    } finally {
      setLoadingHabits(false);
    }
  };

  const loadHabitEntries = async () => {
    if (!user || habits.length === 0) return;
    try {
      const entriesMap: Record<string, HabitEntry[]> = {};
      const streaksMap: Record<string, Streak> = {};

      for (const habit of habits) {
        const entries = await getHabitEntries(habit.id, user.id);
        entriesMap[habit.id] = entries;
        streaksMap[habit.id] = calculateHabitStreak(entries);
      }

      setHabitEntries(entriesMap);
      setStreaks(streaksMap);
    } catch (error) {
      console.error('Error loading habit entries:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addHabit({
        userId: user.id,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      });
      setFormData({ name: '', description: '', color: 'bg-blue-500' });
      setShowAddForm(false);
      loadHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
      alert('Failed to add habit');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit? All entries will be deleted too.')) return;
    try {
      await deleteHabit(id);
      loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
      alert('Failed to delete habit');
    }
  };

  const handleToggle = async (habitId: string) => {
    if (!user) return;
    try {
      await toggleHabitEntry(habitId, user.id, selectedDate);
      // Reload entries to reflect the change
      await loadHabitEntries();
    } catch (error) {
      console.error('Error toggling habit entry:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update habit: ${errorMessage}`);
    }
  };

  const isHabitCompleted = (habitId: string) => {
    const entries = habitEntries[habitId] || [];
    return entries.some(entry => entry.date === selectedDate && entry.completed);
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habit Tracker</h1>
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
            Add Habit
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Habit</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Drink 8 glasses of water"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Additional details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="flex gap-2 flex-wrap">
                  {habitColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-10 h-10 rounded-full ${color.value} ${
                        formData.color === color.value ? 'ring-4 ring-offset-2 ring-primary-500' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Habit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', description: '', color: 'bg-blue-500' });
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loadingHabits ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <PetMascot petType="bunny" size="md" iconType="default" mood="happy" className="animate-float" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">No habits yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Create your first habit to start tracking!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Your First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const completed = isHabitCompleted(habit.id);
              const streak = streaks[habit.id] || { current: 0, longest: 0, lastCompletedDate: null };
              
              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 ${habit.color} rounded-lg flex items-center justify-center`}>
                        {completed ? (
                          <CheckCircle2 className="text-white" size={24} />
                        ) : (
                          <div className="w-6 h-6 border-2 border-white rounded"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{habit.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(habit.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Flame className="text-orange-500" size={20} />
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Current Streak</p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">{streak.current} days</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Longest Streak</p>
                        <p className="font-bold text-lg text-gray-900 dark:text-white">{streak.longest} days</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(habit.id)}
                      className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                        completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {completed ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

