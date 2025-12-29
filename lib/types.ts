export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface CalorieEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  food: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: Date;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  createdAt: Date;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
  duration?: number; // in minutes
  caloriesBurned?: number;
  date: string; // YYYY-MM-DD format
  createdAt: Date;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
}

