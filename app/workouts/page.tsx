'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format, parseISO, subDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Flame, Dumbbell, Calendar, ChevronLeft, ChevronRight, X, CheckCircle2, Circle } from 'lucide-react';
import { getWorkouts, addWorkout, deleteWorkout, calculateWorkoutStreak, getUserSettings } from '@/lib/db';
import { Workout, Streak, WorkoutRoutine } from '@/lib/types';
import ExerciseSearch from '@/components/ExerciseSearch';
import { Exercise, calculateCaloriesBurned } from '@/lib/exerciseApi';
import FitFlowMascot from '@/components/FitFlowMascot';

interface DayWorkouts {
  date: string;
  workouts: Workout[];
  totalCalories: number;
}

export default function WorkoutsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allWorkouts, setAllWorkouts] = useState<Workout[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastCompletedDate: null });
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'all'>('week');
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [workoutMode, setWorkoutMode] = useState<'routine' | 'new'>('routine');
  const [savedRoutines, setSavedRoutines] = useState<WorkoutRoutine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<WorkoutRoutine | null>(null);
  const [checkedExercises, setCheckedExercises] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    name: '',
    type: 'cardio' as 'cardio' | 'strength' | 'flexibility' | 'other',
    duration: '',
    caloriesBurned: '',
    weight: '',
    sets: '',
    reps: '',
    routine: '',
    selectedDates: [] as string[],
  });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [routineExercises, setRoutineExercises] = useState<Array<{
    name: string;
    type: 'cardio' | 'strength' | 'flexibility' | 'other';
    duration?: string;
    caloriesBurned?: string;
    weight?: string;
    sets?: string;
    reps?: string;
    exercise?: Exercise | null;
  }>>([]);

  // Predefined workout routines
  const workoutRoutines = [
    { name: 'Chest + Triceps', type: 'strength' as const },
    { name: 'Back + Biceps', type: 'strength' as const },
    { name: 'Legs + Abs', type: 'strength' as const },
    { name: 'Shoulder + Triceps + Abs', type: 'strength' as const },
    { name: 'Chest + Shoulder', type: 'strength' as const },
    { name: 'Back + Biceps', type: 'strength' as const },
    { name: 'Recovery Day', type: 'flexibility' as const },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAllWorkouts();
      loadStreak();
      loadSavedRoutines();
    }
  }, [user]);

  const loadSavedRoutines = async () => {
    if (!user) return;
    try {
      const settings = await getUserSettings(user.id);
      setSavedRoutines(settings?.workoutRoutines || []);
    } catch (error) {
      console.error('Error loading saved routines:', error);
    }
  };

  const loadAllWorkouts = async () => {
    if (!user) return;
    setLoadingWorkouts(true);
    try {
      const workouts = await getWorkouts(user.id);
      setAllWorkouts(workouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoadingWorkouts(false);
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

  // Group workouts by date
  const groupWorkoutsByDate = (workouts: Workout[]): DayWorkouts[] => {
    const grouped: Record<string, Workout[]> = {};
    
    workouts.forEach(workout => {
      if (!grouped[workout.date]) {
        grouped[workout.date] = [];
      }
      grouped[workout.date].push(workout);
    });

    return Object.entries(grouped)
      .map(([date, dayWorkouts]) => ({
        date,
        workouts: dayWorkouts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        totalCalories: dayWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  // Get workouts for current view
  const getWorkoutsForView = (): DayWorkouts[] => {
    const grouped = groupWorkoutsByDate(allWorkouts);
    
    if (viewMode === 'week') {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      return grouped.filter(day => {
        const dayDate = parseISO(day.date);
        return dayDate >= weekStart && dayDate <= weekEnd;
      });
    }
    
    return grouped.slice(0, 14); // Show last 14 days
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (formData.routine && routineExercises.length === 0) {
      alert('Please add at least one exercise to the routine');
      return;
    }
    if (!formData.routine && !formData.name) {
      alert('Please enter an exercise name');
      return;
    }

    const datesToAdd = formData.selectedDates.length > 0 
      ? formData.selectedDates 
      : [format(new Date(), 'yyyy-MM-dd')];

    try {
      // If routine is selected and has exercises, add all exercises
      if (formData.routine && routineExercises.length > 0) {
        for (const date of datesToAdd) {
          for (const exercise of routineExercises) {
            await addWorkout({
              userId: user.id,
              name: exercise.name,
              type: exercise.type,
              duration: exercise.duration ? parseInt(exercise.duration) : undefined,
              caloriesBurned: exercise.caloriesBurned ? parseInt(exercise.caloriesBurned) : undefined,
              weight: exercise.weight ? parseFloat(exercise.weight) : undefined,
              sets: exercise.sets ? parseInt(exercise.sets) : undefined,
              reps: exercise.reps ? parseInt(exercise.reps) : undefined,
              routine: formData.routine || undefined,
              date,
            });
          }
        }
      } else {
        // Add single workout for each selected date
        for (const date of datesToAdd) {
          await addWorkout({
            userId: user.id,
            name: formData.name,
            type: formData.type,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            caloriesBurned: formData.caloriesBurned ? parseInt(formData.caloriesBurned) : undefined,
            weight: formData.weight ? parseFloat(formData.weight) : undefined,
            sets: formData.sets ? parseInt(formData.sets) : undefined,
            reps: formData.reps ? parseInt(formData.reps) : undefined,
            routine: formData.routine || undefined,
            date,
          });
        }
      }

      setFormData({ 
        name: '', 
        type: 'cardio', 
        duration: '', 
        caloriesBurned: '', 
        weight: '', 
        sets: '', 
        reps: '',
        routine: '',
        selectedDates: [],
      });
      setSelectedExercise(null);
      setRoutineExercises([]);
      setShowAddForm(false);
      loadAllWorkouts();
      loadStreak();
    } catch (error) {
      console.error('Error adding workout:', error);
      alert('Failed to add workout');
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setFormData(prev => ({ ...prev, type: exercise.type }));
    
    if (formData.duration) {
      const duration = parseInt(formData.duration);
      if (duration > 0) {
        const calories = calculateCaloriesBurned(exercise, duration);
        setFormData(prev => ({ ...prev, caloriesBurned: calories.toString() }));
      }
    }
  };

  const handleDurationChange = (duration: string) => {
    setFormData(prev => ({ ...prev, duration }));
    
    if (selectedExercise && duration) {
      const durationNum = parseInt(duration);
      if (durationNum > 0) {
        const calories = calculateCaloriesBurned(selectedExercise, durationNum);
        setFormData(prev => ({ ...prev, caloriesBurned: calories.toString() }));
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await deleteWorkout(id);
      loadAllWorkouts();
      loadStreak();
    } catch (error) {
      console.error('Error deleting workout:', error);
      alert('Failed to delete workout');
    }
  };

  const toggleDateSelection = (date: string) => {
    setFormData(prev => {
      const dates = [...prev.selectedDates];
      const index = dates.indexOf(date);
      if (index > -1) {
        dates.splice(index, 1);
      } else {
        dates.push(date);
      }
      return { ...prev, selectedDates: dates.sort() };
    });
  };

  const selectWeek = () => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dateStrings = weekDays.map(day => format(day, 'yyyy-MM-dd'));
    setFormData(prev => ({ ...prev, selectedDates: dateStrings }));
  };

  const workoutsByDay = getWorkoutsForView();

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
            <div className="flex items-center gap-3">
              <FitFlowMascot variant="workout" size="sm" className="animate-float" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workout Tracker</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div className="flex items-center gap-4">
              <FitFlowMascot variant={streak.current > 0 ? "celebrate" : "workout"} size="lg" className="animate-float" />
              <Dumbbell size={48} className="opacity-20" />
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                This Week
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Last 14 Days
              </button>
            </div>
            {viewMode === 'week' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekStart(subDays(weekStart, 7))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[120px] text-center">
                  {format(weekStart, 'MMM d')} - {format(endOfWeek(weekStart, { weekStartsOn: 1 }), 'MMM d')}
                </span>
                <button
                  onClick={() => setWeekStart(subDays(weekStart, -7))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              if (!showAddForm) {
                setWorkoutMode('new');
                setSelectedRoutine(null);
                setCheckedExercises({});
              }
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            Add Workout
          </button>
        </div>

        {/* Mode Tabs */}
        {showAddForm && (
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setWorkoutMode('routine');
                setSelectedRoutine(null);
                setCheckedExercises({});
                loadSavedRoutines();
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                workoutMode === 'routine'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Routine
            </button>
            <button
              onClick={() => {
                setWorkoutMode('new');
                setSelectedRoutine(null);
                setCheckedExercises({});
              }}
              className={`px-6 py-3 font-medium transition-colors ${
                workoutMode === 'new'
                  ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              New Workout
            </button>
          </div>
        )}

        {/* Routine Mode */}
        {showAddForm && workoutMode === 'routine' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Select Routine</h2>
            
            {savedRoutines.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <FitFlowMascot variant="encourage" size="md" className="animate-float" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-2">No routines saved yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  Go to Settings to create your workout routines
                </p>
                <Link
                  href="/settings"
                  className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to Settings
                </Link>
              </div>
            ) : !selectedRoutine ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedRoutines.map((routine) => (
                  <button
                    key={routine.id}
                    onClick={() => {
                      setSelectedRoutine(routine);
                      // Initialize all exercises as checked
                      const initialChecked: Record<string, boolean> = {};
                      routine.exercises.forEach((_, idx) => {
                        initialChecked[idx.toString()] = true;
                      });
                      setCheckedExercises(initialChecked);
                    }}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Dumbbell className="text-primary-600 dark:text-primary-400" size={24} />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{routine.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {routine.exercises.length} exercise{routine.exercises.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedRoutine.name}</h3>
                  <button
                    onClick={() => {
                      setSelectedRoutine(null);
                      setCheckedExercises({});
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedRoutine.exercises.map((exercise, idx) => {
                    const isChecked = checkedExercises[idx.toString()] ?? true;
                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          isChecked
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800'
                            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setCheckedExercises({
                                ...checkedExercises,
                                [idx.toString()]: !isChecked,
                              });
                            }}
                            className="mt-1"
                          >
                            {isChecked ? (
                              <CheckCircle2 className="text-primary-600 dark:text-primary-400" size={24} />
                            ) : (
                              <Circle className="text-gray-400" size={24} />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className={`font-semibold ${isChecked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                              {exercise.name}
                            </p>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm">
                              {exercise.duration && (
                                <span className={`${isChecked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                                  ⏱️ {exercise.duration} min
                                </span>
                              )}
                              {exercise.caloriesBurned && (
                                <span className={`${isChecked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                                  🔥 {exercise.caloriesBurned} cal
                                </span>
                              )}
                              {exercise.weight && (
                                <span className={`${isChecked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                                  💪 {exercise.weight} kg
                                </span>
                              )}
                              {exercise.sets && exercise.reps && (
                                <span className={`${isChecked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}`}>
                                  {exercise.sets} × {exercise.reps}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Calories (from checked exercises):
                    </span>
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {selectedRoutine.exercises
                        .filter((_, idx) => checkedExercises[idx.toString()] !== false)
                        .reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0)} cal
                    </span>
                  </div>

                  {/* Date Selection for Routine */}
                  <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Days <span className="text-gray-400 font-normal">(optional - defaults to today)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
                          const weekDays = eachDayOfInterval({ 
                            start: startOfWeek(new Date(), { weekStartsOn: 1 }), 
                            end: weekEnd 
                          });
                          const dateStrings = weekDays.map(day => format(day, 'yyyy-MM-dd'));
                          setFormData(prev => ({ ...prev, selectedDates: dateStrings }));
                        }}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        Select This Week
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {eachDayOfInterval({ 
                        start: startOfWeek(new Date(), { weekStartsOn: 1 }), 
                        end: endOfWeek(new Date(), { weekStartsOn: 1 }) 
                      }).map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isSelected = formData.selectedDates.includes(dateStr);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => toggleDateSelection(dateStr)}
                            className={`p-2 rounded-lg text-center text-sm transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : isToday
                                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                            <div className="text-sm font-semibold">{format(day, 'd')}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!user) return;
                        const datesToAdd = formData.selectedDates.length > 0 
                          ? formData.selectedDates 
                          : [format(new Date(), 'yyyy-MM-dd')];

                        try {
                          for (const date of datesToAdd) {
                            // Only add checked exercises
                            for (let idx = 0; idx < selectedRoutine.exercises.length; idx++) {
                              if (checkedExercises[idx.toString()] !== false) {
                                const exercise = selectedRoutine.exercises[idx];
                                await addWorkout({
                                  userId: user.id,
                                  name: exercise.name,
                                  type: exercise.type,
                                  duration: exercise.duration,
                                  caloriesBurned: exercise.caloriesBurned,
                                  weight: exercise.weight,
                                  sets: exercise.sets,
                                  reps: exercise.reps,
                                  routine: selectedRoutine.name,
                                  date,
                                });
                              }
                            }
                          }
                          setShowAddForm(false);
                          setSelectedRoutine(null);
                          setCheckedExercises({});
                          loadAllWorkouts();
                          loadStreak();
                        } catch (error) {
                          console.error('Error adding routine workout:', error);
                          alert('Failed to add workout');
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Save Workout
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRoutine(null);
                        setCheckedExercises({});
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
        )}

        {/* New Workout Form */}
        {showAddForm && workoutMode === 'new' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Workout</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workout Routine (Optional)
                </label>
                <select
                  value={formData.routine}
                  onChange={(e) => {
                    const routine = e.target.value;
                    const selectedRoutine = workoutRoutines.find(r => r.name === routine);
                    setFormData({ 
                      ...formData, 
                      routine: routine,
                      name: routine || formData.name,
                      type: selectedRoutine?.type || formData.type
                    });
                    // Clear routine exercises when routine is cleared
                    if (!routine) {
                      setRoutineExercises([]);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a routine (optional)</option>
                  {workoutRoutines.map((routine) => (
                    <option key={routine.name} value={routine.name}>
                      {routine.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quick select: Chest + Triceps, Back + Biceps, Legs + Abs, etc.
                </p>
              </div>

              {/* Routine Exercises Section */}
              {formData.routine && (
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Exercises for {formData.routine}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setRoutineExercises([...routineExercises, {
                          name: '',
                          type: formData.type,
                          duration: '',
                          caloriesBurned: '',
                          weight: '',
                          sets: '',
                          reps: '',
                          exercise: null,
                        }]);
                      }}
                      className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus size={16} />
                      Add Exercise
                    </button>
                  </div>
                  
                  {routineExercises.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                      Click "Add Exercise" to add exercises to this routine
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {routineExercises.map((exercise, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              Exercise {index + 1}
                            </h4>
                            <button
                              type="button"
                              onClick={() => {
                                setRoutineExercises(routineExercises.filter((_, i) => i !== index));
                              }}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Exercise Name
                              </label>
                              <ExerciseSearch
                                value={exercise.name}
                                onChange={(value) => {
                                  const updated = [...routineExercises];
                                  updated[index].name = value;
                                  setRoutineExercises(updated);
                                }}
                                onSelect={(ex: Exercise) => {
                                  const updated = [...routineExercises];
                                  updated[index] = {
                                    ...updated[index],
                                    name: ex.name,
                                    type: ex.type,
                                    exercise: ex,
                                  };
                                  if (exercise.duration) {
                                    const duration = parseInt(exercise.duration);
                                    if (duration > 0) {
                                      updated[index].caloriesBurned = calculateCaloriesBurned(ex, duration).toString();
                                    }
                                  }
                                  setRoutineExercises(updated);
                                }}
                                exerciseType={exercise.type}
                                placeholder="e.g., Bench Press, Squats"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Duration (min)
                                </label>
                                <input
                                  type="number"
                                  value={exercise.duration || ''}
                                  onChange={(e) => {
                                    const updated = [...routineExercises];
                                    updated[index].duration = e.target.value;
                                    if (exercise.exercise && e.target.value) {
                                      const duration = parseInt(e.target.value);
                                      if (duration > 0) {
                                        updated[index].caloriesBurned = calculateCaloriesBurned(exercise.exercise, duration).toString();
                                      }
                                    }
                                    setRoutineExercises(updated);
                                  }}
                                  min="1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                  placeholder="30"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Calories
                                </label>
                                <input
                                  type="number"
                                  value={exercise.caloriesBurned || ''}
                                  onChange={(e) => {
                                    const updated = [...routineExercises];
                                    updated[index].caloriesBurned = e.target.value;
                                    setRoutineExercises(updated);
                                  }}
                                  min="1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                  placeholder="250"
                                />
                              </div>
                              {(exercise.type === 'strength' || exercise.type === 'other') && (
                                <>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Weight (kg)
                                    </label>
                                    <input
                                      type="number"
                                      value={exercise.weight || ''}
                                      onChange={(e) => {
                                        const updated = [...routineExercises];
                                        updated[index].weight = e.target.value;
                                        setRoutineExercises(updated);
                                      }}
                                      min="0"
                                      step="0.5"
                                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                      placeholder="20"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                      Sets × Reps
                                    </label>
                                    <div className="flex gap-1">
                                      <input
                                        type="number"
                                        value={exercise.sets || ''}
                                        onChange={(e) => {
                                          const updated = [...routineExercises];
                                          updated[index].sets = e.target.value;
                                          setRoutineExercises(updated);
                                        }}
                                        min="1"
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="3"
                                      />
                                      <span className="self-center text-gray-500">×</span>
                                      <input
                                        type="number"
                                        value={exercise.reps || ''}
                                        onChange={(e) => {
                                          const updated = [...routineExercises];
                                          updated[index].reps = e.target.value;
                                          setRoutineExercises(updated);
                                        }}
                                        min="1"
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        placeholder="10"
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Single Exercise Form (shown when no routine selected) */}
              {!formData.routine && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exercise Name
                      <span className="ml-2 text-xs text-gray-500 font-normal">
                        (Search to auto-fill calories)
                      </span>
                    </label>
                    <ExerciseSearch
                      value={formData.name}
                      onChange={(value) => setFormData({ ...formData, name: value })}
                      onSelect={handleExerciseSelect}
                      exerciseType={formData.type}
                      placeholder="e.g., Running, Bench Press, Yoga"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Workout Type
                    </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value as any });
                    setSelectedExercise(null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="cardio">Cardio</option>
                  <option value="strength">Strength</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="other">Other</option>
                </select>
                  </div>
                </>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(e.target.value)}
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
                  {selectedExercise && formData.duration && (
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-calculated: ~{calculateCaloriesBurned(selectedExercise, parseInt(formData.duration) || 0)} cal
                    </p>
                  )}
                </div>
              </div>
              
              {(formData.type === 'strength' || formData.type === 'other') && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg) <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      min="0"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sets <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.sets}
                      onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reps <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={formData.reps}
                      onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 12"
                    />
                  </div>
                </div>
              )}

              {/* Date Selection */}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Days <span className="text-gray-400 font-normal">(optional - defaults to today)</span>
                  </label>
                  <button
                    type="button"
                    onClick={selectWeek}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Select This Week
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {eachDayOfInterval({ 
                    start: startOfWeek(new Date(), { weekStartsOn: 1 }), 
                    end: endOfWeek(new Date(), { weekStartsOn: 1 }) 
                  }).map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isSelected = formData.selectedDates.includes(dateStr);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => toggleDateSelection(dateStr)}
                        className={`p-2 rounded-lg text-center text-sm transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : isToday
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-xs opacity-75">{format(day, 'EEE')}</div>
                        <div className="font-semibold">{format(day, 'd')}</div>
                      </button>
                    );
                  })}
                </div>
                {formData.selectedDates.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {formData.selectedDates.length} day(s) - {formData.selectedDates.map(d => format(parseISO(d), 'MMM d')).join(', ')}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Workout{formData.selectedDates.length > 0 ? ` (${formData.selectedDates.length} day${formData.selectedDates.length > 1 ? 's' : ''})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', type: 'cardio', duration: '', caloriesBurned: '', weight: '', sets: '', reps: '', routine: '', selectedDates: [] });
                    setSelectedExercise(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Workouts by Day */}
        {loadingWorkouts ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : workoutsByDay.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="flex justify-center mb-4">
              <FitFlowMascot variant="workout" size="md" className="animate-float" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No workouts logged yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add Workout" to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {workoutsByDay.map((day) => (
              <div key={day.date} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-purple-600 dark:text-purple-400" size={20} />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {format(parseISO(day.date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {day.workouts.length} workout{day.workouts.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Calories</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {day.totalCalories}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {day.workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                          {workout.name}
                          {workout.routine && (
                            <span className="ml-2 text-sm font-normal text-primary-600 dark:text-primary-400">
                              ({workout.routine})
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="capitalize bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                            {workout.type}
                          </span>
                          {workout.routine && (
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                              {workout.routine}
                            </span>
                          )}
                          {workout.duration && (
                            <span>⏱️ {workout.duration} min</span>
                          )}
                          {workout.caloriesBurned && (
                            <span>🔥 {workout.caloriesBurned} cal</span>
                          )}
                        </div>
                        {(workout.weight || workout.sets || workout.reps) && (
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {workout.weight && <span>💪 {workout.weight} kg</span>}
                            {workout.sets && <span>📊 {workout.sets} sets</span>}
                            {workout.reps && <span>🔄 {workout.reps} reps</span>}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(workout.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-4"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
