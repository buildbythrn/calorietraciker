'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, Trash2, User, Plus, X, Dumbbell } from 'lucide-react';
import { getUserSettings, updateUserSettings } from '@/lib/db';
import { exportToCSV, backupData, restoreData } from '@/lib/export';
import { UserSettings, WorkoutRoutine } from '@/lib/types';
import NotificationSettings from '@/components/NotificationSettings';
import { useTheme } from '@/components/ThemeProvider';
import ExerciseSearch from '@/components/ExerciseSearch';
import { Exercise, calculateCaloriesBurned } from '@/lib/exerciseApi';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null);
  const [showRoutineForm, setShowRoutineForm] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<WorkoutRoutine | null>(null);
  const [routineFormData, setRoutineFormData] = useState({
    name: '',
    exercises: [] as Array<{
      name: string;
      type: 'cardio' | 'strength' | 'flexibility' | 'other';
      duration?: number | string;
      caloriesBurned?: number | string;
      weight?: number | string;
      sets?: number | string;
      reps?: number | string;
      exercise?: Exercise | null;
    }>,
  });
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    type: 'strength' as 'cardio' | 'strength' | 'flexibility' | 'other',
    duration: '',
    caloriesBurned: '',
    weight: '',
    sets: '',
    reps: '',
    exercise: null as Exercise | null,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    setLoadingSettings(true);
    try {
      const userSettings = await getUserSettings(user.id);
      if (userSettings) {
        setSettings(userSettings);
      } else {
        // Set default settings if null
        setSettings({
          id: user.id,
          userId: user.id,
          darkMode: false,
          notificationsEnabled: false,
          reminderTimes: {},
          units: {
            weight: 'kg',
            distance: 'km',
            volume: 'ml',
          },
          workoutRoutines: [],
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Set default settings on error
      setSettings({
        id: user.id,
        userId: user.id,
        darkMode: false,
        notificationsEnabled: false,
        reminderTimes: {},
        units: {
          weight: 'kg',
          distance: 'km',
          volume: 'ml',
        },
        workoutRoutines: [],
        updatedAt: new Date(),
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleExportCSV = async () => {
    if (!user) return;
    try {
      await exportToCSV(user.id);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV');
    }
  };

  const handleBackup = async () => {
    if (!user) return;
    try {
      await backupData(user.id);
      alert('Backup created successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup');
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;
    
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup = await restoreData(user.id, content);
        alert('Backup restored successfully! Please refresh the page.');
        window.location.reload();
      } catch (error) {
        console.error('Error restoring backup:', error);
        alert('Failed to restore backup. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  const handleUpdateUnits = async (unitType: 'weight' | 'distance' | 'volume', value: string) => {
    if (!user || !settings) return;
    try {
      const updatedUnits = {
        ...(settings?.units || { weight: 'kg', distance: 'km', volume: 'ml' }),
        [unitType]: value as any,
      };
      await updateUserSettings(user.id, { units: updatedUnits });
      setSettings({ ...settings, units: updatedUnits });
    } catch (error) {
      console.error('Error updating units:', error);
    }
  };

  if (loading || !user || loadingSettings || !settings) {
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="text-primary-600 dark:text-primary-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark theme</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Body Goal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fitness Goal</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Body Goal
            </label>
            <select
              value={settings?.bodyGoal || ''}
              onChange={async (e) => {
                const value = e.target.value || undefined;
                try {
                  await updateUserSettings(user.id, { bodyGoal: value as any });
                  const updated = await getUserSettings(user.id);
                  if (updated) setSettings(updated);
                } catch (error) {
                  console.error('Error updating body goal:', error);
                }
              }}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Not set</option>
              <option value="fat_loss">Fat Loss</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="muscle_gain">Muscle Gain</option>
              <option value="maintain">Maintain Weight</option>
              <option value="body_recomposition">Body Recomposition</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Your primary fitness goal helps personalize your experience
            </p>
          </div>
        </div>

        {/* Units */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Units</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight
              </label>
              <select
                value={settings?.units?.weight || 'kg'}
                onChange={(e) => handleUpdateUnits('weight', e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="lbs">Pounds (lbs)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Distance
              </label>
              <select
                value={settings?.units?.distance || 'km'}
                onChange={(e) => handleUpdateUnits('distance', e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="km">Kilometers (km)</option>
                <option value="miles">Miles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Volume
              </label>
              <select
                value={settings?.units?.volume || 'ml'}
                onChange={(e) => handleUpdateUnits('volume', e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="ml">Milliliters (ml)</option>
                <option value="oz">Ounces (oz)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <NotificationSettings />
        </div>

        {/* Workout Routines */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Workout Routines</h3>
            <button
              onClick={() => {
                setShowRoutineForm(true);
                setEditingRoutine(null);
                setRoutineFormData({ name: '', exercises: [] });
                setCurrentExercise({ name: '', type: 'strength', duration: '', caloriesBurned: '', weight: '', sets: '', reps: '', exercise: null });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus size={18} />
              Add Routine
            </button>
          </div>

          {settings && settings.workoutRoutines && settings.workoutRoutines.length > 0 ? (
            <div className="space-y-3">
              {settings.workoutRoutines.map((routine) => (
                <div key={routine.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="text-primary-600 dark:text-primary-400" size={20} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{routine.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingRoutine(routine);
                        setRoutineFormData({
                          name: routine.name,
                          exercises: routine.exercises.map(ex => ({
                            ...ex,
                            exercise: null,
                            duration: ex.duration?.toString() || '',
                            caloriesBurned: ex.caloriesBurned?.toString() || '',
                            weight: ex.weight?.toString() || '',
                            sets: ex.sets?.toString() || '',
                            reps: ex.reps?.toString() || '',
                          })),
                        });
                        setShowRoutineForm(true);
                      }}
                      className="px-3 py-1 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Delete routine "${routine.name}"?`)) return;
                        const updated = settings.workoutRoutines?.filter(r => r.id !== routine.id) || [];
                        await updateUserSettings(user.id, { workoutRoutines: updated });
                        const updatedSettings = await getUserSettings(user.id);
                        if (updatedSettings) setSettings(updatedSettings);
                      }}
                      className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No workout routines yet. Create one to quickly log your workouts!
            </p>
          )}

          {showRoutineForm && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {editingRoutine ? 'Edit Routine' : 'New Routine'}
                </h4>
                <button
                  onClick={() => {
                    setShowRoutineForm(false);
                    setEditingRoutine(null);
                    setRoutineFormData({ name: '', exercises: [] });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Routine Name
                  </label>
                  <input
                    type="text"
                    value={routineFormData.name}
                    onChange={(e) => setRoutineFormData({ ...routineFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    placeholder="e.g., Chest + Triceps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add Exercise
                  </label>
                  <div className="space-y-3">
                    <ExerciseSearch
                      value={currentExercise.name}
                      onChange={(value) => setCurrentExercise({ ...currentExercise, name: value })}
                      onSelect={(ex: Exercise) => {
                        setCurrentExercise({
                          ...currentExercise,
                          name: ex.name,
                          type: ex.type,
                          exercise: ex,
                        });
                      }}
                      exerciseType={currentExercise.type}
                      placeholder="Search exercise..."
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="number"
                        value={currentExercise.duration}
                        onChange={(e) => {
                          const duration = e.target.value;
                          setCurrentExercise({
                            ...currentExercise,
                            duration,
                            caloriesBurned: currentExercise.exercise && duration
                              ? calculateCaloriesBurned(currentExercise.exercise, parseInt(duration) || 0).toString()
                              : currentExercise.caloriesBurned,
                          });
                        }}
                        placeholder="Duration (min)"
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                      />
                      <input
                        type="number"
                        value={currentExercise.caloriesBurned}
                        onChange={(e) => setCurrentExercise({ ...currentExercise, caloriesBurned: e.target.value })}
                        placeholder="Calories"
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                      />
                      {(currentExercise.type === 'strength' || currentExercise.type === 'other') && (
                        <>
                          <input
                            type="number"
                            value={currentExercise.weight}
                            onChange={(e) => setCurrentExercise({ ...currentExercise, weight: e.target.value })}
                            placeholder="Weight (kg)"
                            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                          />
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={currentExercise.sets}
                              onChange={(e) => setCurrentExercise({ ...currentExercise, sets: e.target.value })}
                              placeholder="Sets"
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                            />
                            <span className="self-center text-gray-500">×</span>
                            <input
                              type="number"
                              value={currentExercise.reps}
                              onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                              placeholder="Reps"
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentExercise.name) {
                          alert('Please enter an exercise name');
                          return;
                        }
                        setRoutineFormData({
                          ...routineFormData,
                          exercises: [
                            ...routineFormData.exercises,
                            {
                              name: currentExercise.name,
                              type: currentExercise.type,
                              duration: currentExercise.duration || undefined,
                              caloriesBurned: currentExercise.caloriesBurned || undefined,
                              weight: currentExercise.weight || undefined,
                              sets: currentExercise.sets || undefined,
                              reps: currentExercise.reps || undefined,
                              exercise: currentExercise.exercise,
                            },
                          ],
                        });
                        setCurrentExercise({ name: '', type: 'strength', duration: '', caloriesBurned: '', weight: '', sets: '', reps: '', exercise: null });
                      }}
                      className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Add Exercise
                    </button>
                  </div>
                </div>

                {routineFormData.exercises.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercises:</p>
                    {routineFormData.exercises.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                        <span className="text-sm text-gray-900 dark:text-white">{ex.name}</span>
                        <button
                          onClick={() => {
                            setRoutineFormData({
                              ...routineFormData,
                              exercises: routineFormData.exercises.filter((_, i) => i !== idx),
                            });
                          }}
                          className="text-red-600 dark:text-red-400"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!routineFormData.name || routineFormData.exercises.length === 0) {
                        alert('Please enter a routine name and add at least one exercise');
                        return;
                      }
                      const routines = settings?.workoutRoutines || [];
                      // Convert form data (strings) to WorkoutRoutine format (numbers)
                      const exercises: WorkoutRoutine['exercises'] = routineFormData.exercises.map(ex => ({
                        name: ex.name,
                        type: ex.type,
                        duration: typeof ex.duration === 'string' ? (ex.duration ? parseInt(ex.duration) : undefined) : ex.duration,
                        caloriesBurned: typeof ex.caloriesBurned === 'string' ? (ex.caloriesBurned ? parseInt(ex.caloriesBurned) : undefined) : ex.caloriesBurned,
                        weight: typeof ex.weight === 'string' ? (ex.weight ? parseFloat(ex.weight) : undefined) : ex.weight,
                        sets: typeof ex.sets === 'string' ? (ex.sets ? parseInt(ex.sets) : undefined) : ex.sets,
                        reps: typeof ex.reps === 'string' ? (ex.reps ? parseInt(ex.reps) : undefined) : ex.reps,
                      }));
                      
                      if (editingRoutine) {
                        const updated = routines.map(r =>
                          r.id === editingRoutine.id
                            ? { 
                                id: editingRoutine.id, 
                                name: routineFormData.name,
                                exercises,
                                createdAt: editingRoutine.createdAt 
                              }
                            : r
                        );
                        await updateUserSettings(user.id, { workoutRoutines: updated });
                      } else {
                        const newRoutine: WorkoutRoutine = {
                          id: Date.now().toString(),
                          name: routineFormData.name,
                          exercises,
                          createdAt: new Date(),
                        };
                        await updateUserSettings(user.id, { workoutRoutines: [...routines, newRoutine] });
                      }
                      const updated = await getUserSettings(user.id);
                      if (updated) setSettings(updated);
                      setShowRoutineForm(false);
                      setEditingRoutine(null);
                      setRoutineFormData({ name: '', exercises: [] });
                    }}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingRoutine ? 'Update Routine' : 'Save Routine'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRoutineForm(false);
                      setEditingRoutine(null);
                      setRoutineFormData({ name: '', exercises: [] });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export to CSV</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download your data as CSV file</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Backup Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create a backup of all your data</p>
              </div>
              <button
                onClick={handleBackup}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={18} />
                Backup
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Restore Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Restore from a backup file</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
                <Upload size={18} />
                Restore
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="hidden"
                  ref={(el) => setFileInput(el)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
          <button
            onClick={async () => {
              await logout();
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Logout
          </button>
        </div>
      </main>
    </div>
  );
}

