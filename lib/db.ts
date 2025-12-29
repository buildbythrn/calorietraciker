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
import { CalorieEntry, Habit, HabitEntry, Workout, Streak } from './types';
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
  const entryRef = doc(db, 'habitEntries', `${habitId}_${date}`);
  const existing = await getDoc(entryRef);
  
  if (existing.exists()) {
    await deleteDoc(entryRef);
    return false;
  } else {
    const newEntry: HabitEntry = {
      id: entryRef.id,
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

