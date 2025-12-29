'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Flame, Dumbbell } from 'lucide-react';
import { getWorkouts, addWorkout, deleteWorkout, calculateWorkoutStreak } from '@/lib/db';
import { Workout, Streak } from '@/lib/types';

export default function WorkoutsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastCompletedDate: null });
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cardio' as 'cardio' | 'strength' | 'flexibility' | 'other',
    duration: '',
    caloriesBurned: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWorkouts();
      loadStreak();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadWorkoutsForDate();
    }
  }, [user, selectedDate]);

  const loadWorkouts = async () => {
    if (!user) return;
    setLoadingWorkouts(true);
    try {
      const userWorkouts = await getWorkouts(user.id);
      setWorkouts(userWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const loadWorkoutsForDate = async () => {
    if (!user) return;
    try {
      const dateWorkouts = await getWorkouts(user.id, selectedDate);
      setWorkouts(dateWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    }
  };

  const loadStreak = async () => {
    if (!user) return;
    try {
      const workoutStreak = await calculateWorkoutStreak(user.id);
      setStreak(workoutStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addWorkout({
        userId: user.id,
        name: formData.name,
        type: formData.type,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
        date: selectedDate,
      });
      setFormData({ name: '', type: 'cardio', duration: '', caloriesBurned: '' });
      setShowAddForm(false);
      loadWorkoutsForDate();
      loadStreak();
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await deleteWorkout(id);
      loadWorkoutsForDate();
      loadStreak();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Workout Tracker</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Streak Display */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Workout Streak</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Flame size={24} />
                  <div>
                    <p className="text-xs opacity-90">Current</p>
                    <p className="text-3xl font-bold">{streak.current} days</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs opacity-90">Longest</p>
                  <p className="text-3xl font-bold">{streak.longest} days</p>
                </div>
              </div>
            </div>
            <Dumbbell size={48} className="opacity-20" />
          </div>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
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
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Workout
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Workout</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Morning Run"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Workout Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calories Burned
                  </label>
                  <input
                    type="number"
                    value={formData.caloriesBurned}
                    onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Workout
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', type: 'cardio', duration: '', caloriesBurned: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            Workouts for {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </h2>

          {loadingWorkouts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : workouts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Dumbbell size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-2">No workouts logged for this date.</p>
              <p className="text-sm">Click "Add Workout" to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex justify-between items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">{workout.name}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="capitalize bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {workout.type}
                      </span>
                      {workout.duration && (
                        <span>⏱️ {workout.duration} min</span>
                      )}
                      {workout.caloriesBurned && (
                        <span>🔥 {workout.caloriesBurned} cal</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(workout.id)}
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

