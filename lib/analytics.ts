import { CalorieEntry, Workout, HabitEntry, WeightEntry } from './types';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

export interface CalorieStats {
  total: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
  dailyAverages: { date: string; calories: number }[];
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalCaloriesBurned: number;
  averageCaloriesPerWorkout: number;
  mostCommonExercise: string;
  workoutFrequency: { date: string; count: number }[];
  caloriesBurnedByDay: { date: string; calories: number }[];
}

export interface HabitStats {
  totalHabits: number;
  averageCompletionRate: number;
  bestHabit: string;
  worstHabit: string;
  completionByDay: { date: string; completed: number; total: number }[];
}

export interface WeightStats {
  currentWeight: number | null;
  startingWeight: number | null;
  weightChange: number;
  averageWeight: number;
  bmi: number | null;
  weightTrend: { date: string; weight: number }[];
}

export type DateRange = 'week' | 'month' | '3months' | 'year' | 'all';

export const getDateRange = (range: DateRange): { start: Date; end: Date } => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  let start: Date;
  switch (range) {
    case 'week':
      start = startOfWeek(subDays(end, 7), { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(subDays(end, 30));
      break;
    case '3months':
      start = subDays(end, 90);
      break;
    case 'year':
      start = subDays(end, 365);
      break;
    default:
      start = new Date(0); // All time
  }
  start.setHours(0, 0, 0, 0);
  
  return { start, end };
};

export const calculateCalorieStats = (
  entries: CalorieEntry[],
  range: DateRange = 'month'
): CalorieStats => {
  const { start, end } = getDateRange(range);
  
  const filteredEntries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, { start, end });
  });

  if (filteredEntries.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
      dailyAverages: [],
    };
  }

  // Group by date
  const byDate: Record<string, number> = {};
  filteredEntries.forEach(entry => {
    byDate[entry.date] = (byDate[entry.date] || 0) + entry.calories;
  });

  const dailyTotals = Object.values(byDate);
  const total = dailyTotals.reduce((sum, cal) => sum + cal, 0);
  const average = total / dailyTotals.length;
  const min = Math.min(...dailyTotals);
  const max = Math.max(...dailyTotals);

  // Calculate trend (compare first half vs second half)
  const sortedDates = Object.keys(byDate).sort();
  const midPoint = Math.floor(sortedDates.length / 2);
  const firstHalf = sortedDates.slice(0, midPoint).reduce((sum, date) => sum + byDate[date], 0) / midPoint || 0;
  const secondHalf = sortedDates.slice(midPoint).reduce((sum, date) => sum + byDate[date], 0) / (sortedDates.length - midPoint) || 0;
  
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (secondHalf > firstHalf * 1.1) trend = 'up';
  else if (secondHalf < firstHalf * 0.9) trend = 'down';

  const dailyAverages = sortedDates.map(date => ({
    date,
    calories: byDate[date],
  }));

  return {
    total,
    average: Math.round(average),
    min,
    max,
    trend,
    dailyAverages,
  };
};

export const calculateWorkoutStats = (
  workouts: Workout[],
  range: DateRange = 'month'
): WorkoutStats => {
  const { start, end } = getDateRange(range);
  
  const filteredWorkouts = workouts.filter(workout => {
    const workoutDate = parseISO(workout.date);
    return isWithinInterval(workoutDate, { start, end });
  });

  if (filteredWorkouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalCaloriesBurned: 0,
      averageCaloriesPerWorkout: 0,
      mostCommonExercise: '',
      workoutFrequency: [],
      caloriesBurnedByDay: [],
    };
  }

  const totalCaloriesBurned = filteredWorkouts.reduce(
    (sum, w) => sum + (w.caloriesBurned || 0),
    0
  );
  const averageCaloriesPerWorkout = totalCaloriesBurned / filteredWorkouts.length;

  // Most common exercise
  const exerciseCounts: Record<string, number> = {};
  filteredWorkouts.forEach(w => {
    exerciseCounts[w.name] = (exerciseCounts[w.name] || 0) + 1;
  });
  const mostCommonExercise = Object.entries(exerciseCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  // Group by date
  const byDate: Record<string, { count: number; calories: number }> = {};
  filteredWorkouts.forEach(workout => {
    if (!byDate[workout.date]) {
      byDate[workout.date] = { count: 0, calories: 0 };
    }
    byDate[workout.date].count++;
    byDate[workout.date].calories += workout.caloriesBurned || 0;
  });

  const sortedDates = Object.keys(byDate).sort();
  const workoutFrequency = sortedDates.map(date => ({
    date,
    count: byDate[date].count,
  }));

  const caloriesBurnedByDay = sortedDates.map(date => ({
    date,
    calories: byDate[date].calories,
  }));

  return {
    totalWorkouts: filteredWorkouts.length,
    totalCaloriesBurned,
    averageCaloriesPerWorkout: Math.round(averageCaloriesPerWorkout),
    mostCommonExercise,
    workoutFrequency,
    caloriesBurnedByDay,
  };
};

export const calculateHabitStats = (
  habits: { id: string; name: string }[],
  habitEntries: HabitEntry[],
  range: DateRange = 'month'
): HabitStats => {
  const { start, end } = getDateRange(range);
  
  const filteredEntries = habitEntries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return isWithinInterval(entryDate, { start, end });
  });

  if (habits.length === 0) {
    return {
      totalHabits: 0,
      averageCompletionRate: 0,
      bestHabit: '',
      worstHabit: '',
      completionByDay: [],
    };
  }

  // Calculate completion rate per habit
  const habitCompletion: Record<string, { completed: number; total: number }> = {};
  habits.forEach(habit => {
    habitCompletion[habit.id] = { completed: 0, total: 0 };
  });

  filteredEntries.forEach(entry => {
    if (habitCompletion[entry.habitId]) {
      habitCompletion[entry.habitId].total++;
      if (entry.completed) {
        habitCompletion[entry.habitId].completed++;
      }
    }
  });

  const completionRates = Object.entries(habitCompletion).map(([habitId, stats]) => {
    const habit = habits.find(h => h.id === habitId);
    return {
      habitId,
      name: habit?.name || '',
      rate: stats.total > 0 ? stats.completed / stats.total : 0,
    };
  });

  const averageCompletionRate = completionRates.reduce((sum, h) => sum + h.rate, 0) / completionRates.length;
  
  const sortedByRate = [...completionRates].sort((a, b) => b.rate - a.rate);
  const bestHabit = sortedByRate[0]?.name || '';
  const worstHabit = sortedByRate[sortedByRate.length - 1]?.name || '';

  // Group by date
  const byDate: Record<string, { completed: number; total: number }> = {};
  filteredEntries.forEach(entry => {
    if (!byDate[entry.date]) {
      byDate[entry.date] = { completed: 0, total: 0 };
    }
    byDate[entry.date].total++;
    if (entry.completed) {
      byDate[entry.date].completed++;
    }
  });

  const sortedDates = Object.keys(byDate).sort();
  const completionByDay = sortedDates.map(date => ({
    date,
    completed: byDate[date].completed,
    total: byDate[date].total,
  }));

  return {
    totalHabits: habits.length,
    averageCompletionRate: Math.round(averageCompletionRate * 100),
    bestHabit,
    worstHabit,
    completionByDay,
  };
};

export const calculateWeightStats = (
  weightEntries: WeightEntry[],
  height?: number // in cm
): WeightStats => {
  if (weightEntries.length === 0) {
    return {
      currentWeight: null,
      startingWeight: null,
      weightChange: 0,
      averageWeight: 0,
      bmi: null,
      weightTrend: [],
    };
  }

  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const currentWeight = sorted[sorted.length - 1].weight;
  const startingWeight = sorted[0].weight;
  const weightChange = currentWeight - startingWeight;
  const averageWeight = sorted.reduce((sum, e) => sum + e.weight, 0) / sorted.length;

  // Calculate BMI if height is provided
  let bmi: number | null = null;
  if (height) {
    const heightInMeters = height / 100;
    bmi = currentWeight / (heightInMeters * heightInMeters);
  }

  const weightTrend = sorted.map(entry => ({
    date: entry.date,
    weight: entry.weight,
  }));

  return {
    currentWeight,
    startingWeight,
    weightChange: Math.round(weightChange * 10) / 10,
    averageWeight: Math.round(averageWeight * 10) / 10,
    bmi: bmi ? Math.round(bmi * 10) / 10 : null,
    weightTrend,
  };
};

