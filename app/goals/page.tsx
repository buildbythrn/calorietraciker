'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Target } from 'lucide-react';
import { getGoals, addGoal, updateGoal, deleteGoal } from '@/lib/db';
import { getCalorieEntries, getWorkouts, getHabits, getHabitEntries } from '@/lib/db';
import { Goal } from '@/lib/types';
import GoalCard from '@/components/GoalCard';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import PetMascot from '@/components/mascots/PetMascot';

export default function GoalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    type: 'calorie' as 'calorie' | 'workout' | 'habit' | 'weight',
    target: '',
    period: 'daily' as 'daily' | 'weekly' | 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
  });
  const [goalProgress, setGoalProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  useEffect(() => {
    if (user && goals.length > 0) {
      calculateProgress();
    }
  }, [user, goals]);

  const loadGoals = async () => {
    if (!user) return;
    setLoadingGoals(true);
    try {
      const userGoals = await getGoals(user.id, true);
      setGoals(userGoals);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoadingGoals(false);
    }
  };

  const calculateProgress = async () => {
    if (!user) return;
    const progress: Record<string, number> = {};

    for (const goal of goals) {
      let current = 0;

      try {
        if (goal.type === 'calorie') {
          const { start, end } = getDateRange(goal.period);
          const currentDate = new Date(start);
          while (currentDate <= end) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const entries = await getCalorieEntries(user.id, dateStr);
            current += entries.reduce((sum, e) => sum + e.calories, 0);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else if (goal.type === 'workout') {
          const workouts = await getWorkouts(user.id);
          const { start, end } = getDateRange(goal.period);
          const filtered = workouts.filter(w => {
            const workoutDate = parseISO(w.date);
            return isWithinInterval(workoutDate, { start, end });
          });
          if (goal.period === 'daily') {
            current = filtered.length;
          } else {
            current = filtered.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          }
        } else if (goal.type === 'habit') {
          const habits = await getHabits(user.id);
          const { start, end } = getDateRange(goal.period);
          let totalCompleted = 0;
          let totalDays = 0;
          
          for (const habit of habits) {
            const entries = await getHabitEntries(habit.id, user.id);
            const filtered = entries.filter(e => {
              const entryDate = parseISO(e.date);
              return isWithinInterval(entryDate, { start, end });
            });
            totalCompleted += filtered.filter(e => e.completed).length;
            totalDays += filtered.length;
          }
          current = totalDays > 0 ? (totalCompleted / totalDays) * 100 : 0;
        }
      } catch (error) {
        console.error(`Error calculating progress for goal ${goal.id}:`, error);
      }

      progress[goal.id] = current;
    }

    setGoalProgress(progress);
  };

  const getDateRange = (period: 'daily' | 'weekly' | 'monthly') => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    let start: Date;
    if (period === 'daily') {
      start = new Date(end);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      start = startOfWeek(end, { weekStartsOn: 1 });
    } else {
      start = startOfMonth(end);
    }
    start.setHours(0, 0, 0, 0);
    
    return { start, end };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, {
          type: formData.type,
          target: parseFloat(formData.target),
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
        });
      } else {
        await addGoal({
          userId: user.id,
          type: formData.type,
          target: parseFloat(formData.target),
          period: formData.period,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          isActive: true,
        });
      }
      
      setFormData({
        type: 'calorie',
        target: '',
        period: 'daily',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
      });
      setEditingGoal(null);
      setShowAddForm(false);
      loadGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      type: goal.type,
      target: goal.target.toString(),
      period: goal.period,
      startDate: goal.startDate,
      endDate: goal.endDate || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal(id);
      loadGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <PetMascot petType="bunny" size="sm" iconType="goal" mood="excited" className="animate-float" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
              </div>
            </div>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingGoal(null);
                setFormData({
                  type: 'calorie',
                  target: '',
                  period: 'daily',
                  startDate: format(new Date(), 'yyyy-MM-dd'),
                  endDate: '',
                });
              }}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              Add Goal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="calorie">Calories</option>
                  <option value="workout">Workouts</option>
                  <option value="habit">Habits</option>
                  <option value="weight">Weight</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target
                  </label>
                  <input
                    type="number"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    required
                    min="1"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period
                  </label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingGoal(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loadingGoals ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : goals.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <PetMascot petType="bunny" size="md" iconType="goal" mood="hungry" className="animate-float" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No goals set yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Create your first goal to start tracking your progress!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                currentProgress={goalProgress[goal.id] || 0}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

