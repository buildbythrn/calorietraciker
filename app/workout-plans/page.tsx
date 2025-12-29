'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Dumbbell, Play } from 'lucide-react';
import { addWorkoutPlan, getWorkoutPlans, deleteWorkoutPlan } from '@/lib/db';
import { WorkoutPlan } from '@/lib/types';
import ExerciseSearch from '@/components/ExerciseSearch';
import { Exercise } from '@/lib/exerciseApi';

export default function WorkoutPlansPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'strength' as 'cardio' | 'strength' | 'flexibility' | 'other',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    exercises: [] as { name: string; sets: number; reps: number; weight?: number; restSeconds?: number; notes?: string }[],
  });
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    restSeconds: '',
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWorkoutPlans();
    }
  }, [user]);

  const loadWorkoutPlans = async () => {
    if (!user) return;
    setLoadingPlans(true);
    try {
      const plans = await getWorkoutPlans(user.id);
      setWorkoutPlans(plans);
    } catch (error) {
      console.error('Error loading workout plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleAddExercise = () => {
    if (!currentExercise.name || !currentExercise.sets || !currentExercise.reps) {
      alert('Please fill in exercise name, sets, and reps');
      return;
    }

    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          name: currentExercise.name,
          sets: parseInt(currentExercise.sets),
          reps: parseInt(currentExercise.reps),
          weight: currentExercise.weight ? parseFloat(currentExercise.weight) : undefined,
          restSeconds: currentExercise.restSeconds ? parseInt(currentExercise.restSeconds) : undefined,
          notes: currentExercise.notes || undefined,
        },
      ],
    });

    setCurrentExercise({
      name: '',
      sets: '',
      reps: '',
      weight: '',
      restSeconds: '',
      notes: '',
    });
  };

  const handleRemoveExercise = (index: number) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.exercises.length === 0) {
      alert('Please add at least one exercise to the plan');
      return;
    }

    try {
      await addWorkoutPlan({
        userId: user.id,
        name: formData.name,
        description: formData.description || undefined,
        exercises: formData.exercises,
        type: formData.type,
        difficulty: formData.difficulty,
      });

      setFormData({
        name: '',
        description: '',
        type: 'strength',
        difficulty: 'beginner',
        exercises: [],
      });
      setShowAddForm(false);
      loadWorkoutPlans();
    } catch (error) {
      console.error('Error creating workout plan:', error);
      alert('Failed to create workout plan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout plan?')) return;
    try {
      await deleteWorkoutPlan(id);
      loadWorkoutPlans();
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      alert('Failed to delete workout plan');
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setCurrentExercise({ ...currentExercise, name: exercise.name });
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Plans</h1>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={20} />
              Create Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Create Workout Plan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Full Body Strength"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your workout plan..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Add Exercise */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add Exercises</h3>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exercise Name
                    </label>
                    <ExerciseSearch
                      value={currentExercise.name}
                      onChange={(value) => setCurrentExercise({ ...currentExercise, name: value })}
                      onSelect={handleExerciseSelect}
                      exerciseType={formData.type}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={currentExercise.sets}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={currentExercise.reps}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={currentExercise.weight}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rest (sec)
                      </label>
                      <input
                        type="number"
                        value={currentExercise.restSeconds}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, restSeconds: e.target.value })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes (optional)
                    </label>
                    <input
                      type="text"
                      value={currentExercise.notes}
                      onChange={(e) => setCurrentExercise({ ...currentExercise, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExercise}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Add Exercise to Plan
                  </button>
                </div>

                {/* Exercise List */}
                {formData.exercises.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Exercises in Plan:</h4>
                    {formData.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{exercise.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}kg`}
                            {exercise.restSeconds && ` | Rest: ${exercise.restSeconds}s`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({
                      name: '',
                      description: '',
                      type: 'strength',
                      difficulty: 'beginner',
                      exercises: [],
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Workout Plans List */}
        {loadingPlans ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : workoutPlans.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Dumbbell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No workout plans created yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Create your first workout plan to get started!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workoutPlans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded capitalize">
                        {plan.type}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded capitalize">
                        {plan.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {plan.exercises.length} Exercise{plan.exercises.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {plan.exercises.map((exercise, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">{exercise.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {exercise.sets} × {exercise.reps}
                          {exercise.weight && ` @ ${exercise.weight}kg`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

