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
  quantity?: number; // Optional quantity (e.g., 2 servings, 1.5 cups)
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
  weight?: number; // in kg or lbs (optional, for strength training)
  sets?: number; // optional, for strength training
  reps?: number; // optional, for strength training
  routine?: string; // Optional workout routine/template (e.g., "Chest + Triceps")
  date: string; // YYYY-MM-DD format
  createdAt: Date;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'calorie' | 'workout' | 'habit' | 'weight';
  target: number;
  period: 'daily' | 'weekly' | 'monthly';
  current?: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  weight: number; // in kg
  notes?: string;
  createdAt: Date;
}

export interface WaterEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  amount: number; // in ml
  createdAt: Date;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  waist?: number; // in cm
  chest?: number; // in cm
  arms?: number; // in cm
  thighs?: number; // in cm
  hips?: number; // in cm
  neck?: number; // in cm
  notes?: string;
  photoUrl?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  userId: string;
  achievementId: string; // Reference to achievement definition
  unlockedAt: Date;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'streak' | 'workout' | 'calorie' | 'habit' | 'weight' | 'milestone';
  requirement: number;
}

export interface MealPlan {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  meals: {
    breakfast?: string[];
    lunch?: string[];
    dinner?: string[];
    snacks?: string[];
  };
  totalCalories?: number;
  createdAt: Date;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restSeconds?: number;
    notes?: string;
  }[];
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration?: number; // in minutes
  createdAt: Date;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  exercises: {
    name: string;
    type: 'cardio' | 'strength' | 'flexibility' | 'other';
    duration?: number; // in minutes
    caloriesBurned?: number; // estimated calories
    weight?: number; // in kg
    sets?: number;
    reps?: number;
  }[];
  createdAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  bodyGoal?: 'fat_loss' | 'weight_loss' | 'muscle_gain' | 'maintain' | 'body_recomposition';
  reminderTimes: {
    meals?: string[]; // HH:mm format
    workouts?: string[];
    habits?: string[];
    water?: string[];
  };
  units: {
    weight: 'kg' | 'lbs';
    distance: 'km' | 'miles';
    volume: 'ml' | 'oz';
  };
  workoutRoutines?: WorkoutRoutine[]; // Custom workout routines
  updatedAt: Date;
}

