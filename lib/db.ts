import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  CalorieEntry, 
  Habit, 
  HabitEntry, 
  Workout, 
  Streak,
  Goal,
  WeightEntry,
  WaterEntry,
  BodyMeasurement,
  Achievement,
  MealPlan,
  WorkoutPlan,
  UserSettings
} from './types';
import { format, parseISO, isSameDay, subDays, differenceInDays } from 'date-fns';

// Calorie Entries
export const addCalorieEntry = async (entry: Omit<CalorieEntry, 'id' | 'createdAt'>) => {
  const entryRef = doc(collection(db, 'calorieEntries'));
  const newEntry: CalorieEntry = {
    ...entry,
    id: entryRef.id,
    createdAt: new Date(),
  };
  await setDoc(entryRef, {
    ...newEntry,
    createdAt: Timestamp.fromDate(newEntry.createdAt),
  });
  return newEntry;
};

export const getCalorieEntries = async (userId: string, date: string) => {
  const q = query(
    collection(db, 'calorieEntries'),
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as CalorieEntry;
  });
  // Sort by createdAt descending
  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const deleteCalorieEntry = async (id: string) => {
  await deleteDoc(doc(db, 'calorieEntries', id));
};

// Habits
export const addHabit = async (habit: Omit<Habit, 'id' | 'createdAt'>) => {
  const habitRef = doc(collection(db, 'habits'));
  const newHabit: Habit = {
    ...habit,
    id: habitRef.id,
    createdAt: new Date(),
  };
  await setDoc(habitRef, {
    ...newHabit,
    createdAt: Timestamp.fromDate(newHabit.createdAt),
  });
  return newHabit;
};

export const getHabits = async (userId: string) => {
  const q = query(
    collection(db, 'habits'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const habits = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Habit;
  });
  // Sort by createdAt descending
  return habits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const deleteHabit = async (id: string) => {
  await deleteDoc(doc(db, 'habits', id));
  // Also delete all entries for this habit
  const entriesQuery = query(
    collection(db, 'habitEntries'),
    where('habitId', '==', id)
  );
  const entriesSnapshot = await getDocs(entriesQuery);
  entriesSnapshot.docs.forEach(async (entryDoc) => {
    await deleteDoc(entryDoc.ref);
  });
};

// Habit Entries
export const toggleHabitEntry = async (habitId: string, userId: string, date: string) => {
  try {
    // Sanitize the document ID to avoid Firestore issues
    const docId = `${habitId}_${date}`.replace(/[\/\s]/g, '_');
    const entryRef = doc(db, 'habitEntries', docId);
    const existing = await getDoc(entryRef);
    
    if (existing.exists()) {
      await deleteDoc(entryRef);
      return false;
    } else {
      const newEntry: HabitEntry = {
        id: docId,
        habitId,
        userId,
        date,
        completed: true,
        createdAt: new Date(),
      };
      await setDoc(entryRef, {
        ...newEntry,
        createdAt: Timestamp.fromDate(newEntry.createdAt),
      });
      return true;
    }
  } catch (error) {
    console.error('Error in toggleHabitEntry:', error);
    throw error;
  }
};

export const getHabitEntries = async (habitId: string, userId: string) => {
  const q = query(
    collection(db, 'habitEntries'),
    where('habitId', '==', habitId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as HabitEntry;
  });
  // Sort by date descending
  return entries.sort((a, b) => b.date.localeCompare(a.date));
};

export const calculateHabitStreak = (entries: HabitEntry[]): Streak => {
  if (entries.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  const completedDates = entries
    .filter(e => e.completed)
    .map(e => parseISO(e.date))
    .sort((a, b) => b.getTime() - a.getTime());

  if (completedDates.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  for (const date of completedDates) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (isSameDay(dateOnly, checkDate) || isSameDay(dateOnly, subDays(checkDate, 1))) {
      if (isSameDay(dateOnly, checkDate)) {
        currentStreak++;
      } else {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      }
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < completedDates.length; i++) {
    const daysDiff = differenceInDays(completedDates[i - 1], completedDates[i]);
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    lastCompletedDate: format(completedDates[0], 'yyyy-MM-dd'),
  };
};

// Workouts
export const addWorkout = async (workout: Omit<Workout, 'id' | 'createdAt'>) => {
  const workoutRef = doc(collection(db, 'workouts'));
  const newWorkout: Workout = {
    ...workout,
    id: workoutRef.id,
    createdAt: new Date(),
  };
  await setDoc(workoutRef, {
    ...newWorkout,
    createdAt: Timestamp.fromDate(newWorkout.createdAt),
  });
  return newWorkout;
};

export const getWorkouts = async (userId: string, date?: string) => {
  let q;
  if (date) {
    q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
  } else {
    q = query(
      collection(db, 'workouts'),
      where('userId', '==', userId)
    );
  }
  const snapshot = await getDocs(q);
  const workouts = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Workout;
  });
  // Sort by date descending, then by createdAt descending
  return workouts.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
};

export const deleteWorkout = async (id: string) => {
  await deleteDoc(doc(db, 'workouts', id));
};

export const calculateWorkoutStreak = async (userId: string): Promise<Streak> => {
  const workouts = await getWorkouts(userId);
  if (workouts.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  const workoutDates = workouts
    .map(w => parseISO(w.date))
    .sort((a, b) => b.getTime() - a.getTime());

  // Calculate current streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let checkDate = new Date(today);
  const uniqueDates = Array.from(
    new Set(workoutDates.map(d => format(d, 'yyyy-MM-dd')))
  ).map(d => parseISO(d));

  for (const date of uniqueDates) {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (isSameDay(dateOnly, checkDate) || isSameDay(dateOnly, subDays(checkDate, 1))) {
      if (isSameDay(dateOnly, checkDate)) {
        currentStreak++;
      } else {
        currentStreak++;
        checkDate = subDays(checkDate, 1);
      }
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const daysDiff = differenceInDays(uniqueDates[i - 1], uniqueDates[i]);
    if (daysDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    lastCompletedDate: uniqueDates.length > 0 ? format(uniqueDates[0], 'yyyy-MM-dd') : null,
  };
};

// Weight Entries
export const addWeightEntry = async (entry: Omit<WeightEntry, 'id' | 'createdAt'>) => {
  const entryRef = doc(collection(db, 'weightEntries'));
  const newEntry: WeightEntry = {
    ...entry,
    id: entryRef.id,
    createdAt: new Date(),
  };
  await setDoc(entryRef, {
    ...newEntry,
    createdAt: Timestamp.fromDate(newEntry.createdAt),
  });
  return newEntry;
};

export const getWeightEntries = async (userId: string, limit?: number) => {
  const q = query(
    collection(db, 'weightEntries'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const entries = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as WeightEntry;
  });
  const sorted = entries.sort((a, b) => b.date.localeCompare(a.date));
  return limit ? sorted.slice(0, limit) : sorted;
};

export const deleteWeightEntry = async (id: string) => {
  await deleteDoc(doc(db, 'weightEntries', id));
};

// Water Entries
export const addWaterEntry = async (entry: Omit<WaterEntry, 'id' | 'createdAt'>) => {
  const entryRef = doc(collection(db, 'waterEntries'));
  const newEntry: WaterEntry = {
    ...entry,
    id: entryRef.id,
    createdAt: new Date(),
  };
  await setDoc(entryRef, {
    ...newEntry,
    createdAt: Timestamp.fromDate(newEntry.createdAt),
  });
  return newEntry;
};

export const getWaterEntries = async (userId: string, date: string) => {
  const q = query(
    collection(db, 'waterEntries'),
    where('userId', '==', userId),
    where('date', '==', date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as WaterEntry;
  });
};

export const getDailyWaterTotal = async (userId: string, date: string): Promise<number> => {
  const entries = await getWaterEntries(userId, date);
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
};

export const deleteWaterEntry = async (id: string) => {
  await deleteDoc(doc(db, 'waterEntries', id));
};

// Body Measurements
export const addBodyMeasurement = async (measurement: Omit<BodyMeasurement, 'id' | 'createdAt'>) => {
  const measurementRef = doc(collection(db, 'bodyMeasurements'));
  const newMeasurement: BodyMeasurement = {
    ...measurement,
    id: measurementRef.id,
    createdAt: new Date(),
  };
  await setDoc(measurementRef, {
    ...newMeasurement,
    createdAt: Timestamp.fromDate(newMeasurement.createdAt),
  });
  return newMeasurement;
};

export const getBodyMeasurements = async (userId: string, limit?: number) => {
  const q = query(
    collection(db, 'bodyMeasurements'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const measurements = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as BodyMeasurement;
  });
  const sorted = measurements.sort((a, b) => b.date.localeCompare(a.date));
  return limit ? sorted.slice(0, limit) : sorted;
};

export const deleteBodyMeasurement = async (id: string) => {
  await deleteDoc(doc(db, 'bodyMeasurements', id));
};

// Goals
export const addGoal = async (goal: Omit<Goal, 'id' | 'createdAt'>) => {
  const goalRef = doc(collection(db, 'goals'));
  const newGoal: Goal = {
    ...goal,
    id: goalRef.id,
    createdAt: new Date(),
  };
  await setDoc(goalRef, {
    ...newGoal,
    createdAt: Timestamp.fromDate(newGoal.createdAt),
  });
  return newGoal;
};

export const getGoals = async (userId: string, isActive?: boolean) => {
  let q;
  if (isActive !== undefined) {
    q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      where('isActive', '==', isActive)
    );
  } else {
    q = query(
      collection(db, 'goals'),
      where('userId', '==', userId)
    );
  }
  const snapshot = await getDocs(q);
  const goals = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Goal;
  });
  return goals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const updateGoal = async (id: string, updates: Partial<Goal>) => {
  const goalRef = doc(db, 'goals', id);
  await setDoc(goalRef, updates, { merge: true });
};

export const deleteGoal = async (id: string) => {
  await deleteDoc(doc(db, 'goals', id));
};

// Achievements
export const getAchievements = async (userId: string) => {
  const q = query(
    collection(db, 'achievements'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      unlockedAt: data.unlockedAt?.toDate() || new Date(),
    } as Achievement;
  });
};

export const unlockAchievement = async (achievement: Omit<Achievement, 'id' | 'unlockedAt'>) => {
  const achievementRef = doc(collection(db, 'achievements'));
  const newAchievement: Achievement = {
    ...achievement,
    id: achievementRef.id,
    unlockedAt: new Date(),
  };
  await setDoc(achievementRef, {
    ...newAchievement,
    unlockedAt: Timestamp.fromDate(newAchievement.unlockedAt),
  });
  return newAchievement;
};

// Meal Plans
export const addMealPlan = async (mealPlan: Omit<MealPlan, 'id' | 'createdAt'>) => {
  const mealPlanRef = doc(collection(db, 'mealPlans'));
  const newMealPlan: MealPlan = {
    ...mealPlan,
    id: mealPlanRef.id,
    createdAt: new Date(),
  };
  await setDoc(mealPlanRef, {
    ...newMealPlan,
    createdAt: Timestamp.fromDate(newMealPlan.createdAt),
  });
  return newMealPlan;
};

export const getMealPlans = async (userId: string, date?: string) => {
  let q;
  if (date) {
    q = query(
      collection(db, 'mealPlans'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
  } else {
    q = query(
      collection(db, 'mealPlans'),
      where('userId', '==', userId)
    );
  }
  const snapshot = await getDocs(q);
  const mealPlans = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as MealPlan;
  });
  return mealPlans.sort((a, b) => b.date.localeCompare(a.date));
};

export const deleteMealPlan = async (id: string) => {
  await deleteDoc(doc(db, 'mealPlans', id));
};

// Workout Plans
export const addWorkoutPlan = async (workoutPlan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => {
  const workoutPlanRef = doc(collection(db, 'workoutPlans'));
  const newWorkoutPlan: WorkoutPlan = {
    ...workoutPlan,
    id: workoutPlanRef.id,
    createdAt: new Date(),
  };
  await setDoc(workoutPlanRef, {
    ...newWorkoutPlan,
    createdAt: Timestamp.fromDate(newWorkoutPlan.createdAt),
  });
  return newWorkoutPlan;
};

export const getWorkoutPlans = async (userId: string) => {
  const q = query(
    collection(db, 'workoutPlans'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const workoutPlans = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
    } as WorkoutPlan;
  });
  return workoutPlans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const deleteWorkoutPlan = async (id: string) => {
  await deleteDoc(doc(db, 'workoutPlans', id));
};

// User Settings
export const getUserSettings = async (userId: string): Promise<UserSettings> => {
  const settingsRef = doc(db, 'userSettings', userId);
  const snapshot = await getDoc(settingsRef);
  
  if (!snapshot.exists()) {
    // Return default settings
    return {
      id: userId,
      userId,
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
    };
  }
  
  const data = snapshot.data();
  // Handle workoutRoutines - convert Firestore Timestamps to Dates
  let workoutRoutines: any[] = [];
  if (data.workoutRoutines && Array.isArray(data.workoutRoutines)) {
    workoutRoutines = data.workoutRoutines.map((r: any) => ({
      ...r,
      createdAt: r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt instanceof Date ? r.createdAt : new Date()),
    }));
  }
  
  return {
    id: snapshot.id,
    userId: data.userId || userId,
    darkMode: data.darkMode || false,
    notificationsEnabled: data.notificationsEnabled || false,
    bodyGoal: data.bodyGoal,
    reminderTimes: data.reminderTimes || {},
    units: data.units || {
      weight: 'kg',
      distance: 'km',
      volume: 'ml',
    },
    workoutRoutines,
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.updatedAt instanceof Date ? data.updatedAt : new Date()),
  } as UserSettings;
};

export const updateUserSettings = async (userId: string, settings: Partial<UserSettings>) => {
  const settingsRef = doc(db, 'userSettings', userId);
  const dataToSave: any = {
    ...settings,
    updatedAt: Timestamp.fromDate(new Date()),
  };
  
  // Convert workoutRoutines dates to Timestamps
  if (settings.workoutRoutines) {
    dataToSave.workoutRoutines = settings.workoutRoutines.map(routine => ({
      ...routine,
      createdAt: routine.createdAt instanceof Date 
        ? Timestamp.fromDate(routine.createdAt)
        : routine.createdAt,
    }));
  }
  
  await setDoc(settingsRef, dataToSave, { merge: true });
};

