import { AchievementDefinition } from './types';
import { 
  getWorkouts, 
  getCalorieEntries, 
  getHabits, 
  getHabitEntries,
  getAchievements,
  unlockAchievement,
  calculateWorkoutStreak,
  calculateHabitStreak
} from './db';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Streak Achievements
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day workout streak', icon: '🔥', category: 'streak', requirement: 7 },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day workout streak', icon: '💪', category: 'streak', requirement: 30 },
  { id: 'streak_100', name: 'Century Club', description: 'Maintain a 100-day workout streak', icon: '👑', category: 'streak', requirement: 100 },
  { id: 'habit_streak_30', name: 'Habit Hero', description: 'Maintain a 30-day habit streak', icon: '⭐', category: 'habit', requirement: 30 },
  
  // Workout Milestones
  { id: 'workout_10', name: 'Getting Started', description: 'Complete 10 workouts', icon: '🏃', category: 'workout', requirement: 10 },
  { id: 'workout_50', name: 'Fitness Enthusiast', description: 'Complete 50 workouts', icon: '💪', category: 'workout', requirement: 50 },
  { id: 'workout_100', name: 'Centurion', description: 'Complete 100 workouts', icon: '🏆', category: 'workout', requirement: 100 },
  { id: 'workout_500', name: 'Fitness Legend', description: 'Complete 500 workouts', icon: '🌟', category: 'workout', requirement: 500 },
  { id: 'calories_burned_10000', name: 'Calorie Crusher', description: 'Burn 10,000 calories through workouts', icon: '🔥', category: 'workout', requirement: 10000 },
  
  // Calorie Goals
  { id: 'perfect_week', name: 'Perfect Week', description: 'Log calories every day for a week', icon: '📊', category: 'calorie', requirement: 7 },
  { id: 'perfect_month', name: 'Perfect Month', description: 'Log calories every day for a month', icon: '📈', category: 'calorie', requirement: 30 },
  
  // Weight Milestones
  { id: 'weight_loss_5kg', name: '5kg Down', description: 'Lose 5kg from starting weight', icon: '🎯', category: 'weight', requirement: 5 },
  { id: 'weight_loss_10kg', name: '10kg Champion', description: 'Lose 10kg from starting weight', icon: '🏅', category: 'weight', requirement: 10 },
];

export const checkAchievements = async (userId: string): Promise<string[]> => {
  const unlocked: string[] = [];
  const existingAchievements = await getAchievements(userId);
  const unlockedIds = new Set(existingAchievements.map(a => a.achievementId));

  try {
    // Check workout streak achievements
    const workoutStreak = await calculateWorkoutStreak(userId);
    if (workoutStreak.current >= 7 && !unlockedIds.has('streak_7')) {
      await unlockAchievement({ userId, achievementId: 'streak_7' });
      unlocked.push('streak_7');
    }
    if (workoutStreak.current >= 30 && !unlockedIds.has('streak_30')) {
      await unlockAchievement({ userId, achievementId: 'streak_30' });
      unlocked.push('streak_30');
    }
    if (workoutStreak.current >= 100 && !unlockedIds.has('streak_100')) {
      await unlockAchievement({ userId, achievementId: 'streak_100' });
      unlocked.push('streak_100');
    }

    // Check workout count achievements
    const workouts = await getWorkouts(userId);
    const workoutCount = workouts.length;
    if (workoutCount >= 10 && !unlockedIds.has('workout_10')) {
      await unlockAchievement({ userId, achievementId: 'workout_10' });
      unlocked.push('workout_10');
    }
    if (workoutCount >= 50 && !unlockedIds.has('workout_50')) {
      await unlockAchievement({ userId, achievementId: 'workout_50' });
      unlocked.push('workout_50');
    }
    if (workoutCount >= 100 && !unlockedIds.has('workout_100')) {
      await unlockAchievement({ userId, achievementId: 'workout_100' });
      unlocked.push('workout_100');
    }
    if (workoutCount >= 500 && !unlockedIds.has('workout_500')) {
      await unlockAchievement({ userId, achievementId: 'workout_500' });
      unlocked.push('workout_500');
    }

    // Check calories burned
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    if (totalCaloriesBurned >= 10000 && !unlockedIds.has('calories_burned_10000')) {
      await unlockAchievement({ userId, achievementId: 'calories_burned_10000' });
      unlocked.push('calories_burned_10000');
    }

    // Check perfect week/month
    const end = new Date();
    const weekStart = startOfWeek(end, { weekStartsOn: 1 });
    const monthStart = startOfMonth(end);
    
    let weekDays = 0;
    let monthDays = 0;
    const currentDate = new Date(weekStart);
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const entries = await getCalorieEntries(userId, dateStr);
      if (entries.length > 0) {
        if (currentDate >= weekStart) weekDays++;
        if (currentDate >= monthStart) monthDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (weekDays >= 7 && !unlockedIds.has('perfect_week')) {
      await unlockAchievement({ userId, achievementId: 'perfect_week' });
      unlocked.push('perfect_week');
    }
    if (monthDays >= 30 && !unlockedIds.has('perfect_month')) {
      await unlockAchievement({ userId, achievementId: 'perfect_month' });
      unlocked.push('perfect_month');
    }

    // Check habit streak
    const habits = await getHabits(userId);
    for (const habit of habits) {
      const entries = await getHabitEntries(habit.id, userId);
      const streak = calculateHabitStreak(entries);
      if (streak.current >= 30 && !unlockedIds.has('habit_streak_30')) {
        await unlockAchievement({ userId, achievementId: 'habit_streak_30' });
        unlocked.push('habit_streak_30');
        break; // Only need one habit with 30-day streak
      }
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
  }

  return unlocked;
};

export const getAchievementDefinition = (id: string): AchievementDefinition | undefined => {
  return ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
};

export const getAchievementProgress = async (userId: string, achievementId: string): Promise<number> => {
  const achievement = getAchievementDefinition(achievementId);
  if (!achievement) return 0;

  try {
    switch (achievement.category) {
      case 'streak':
        const workoutStreak = await calculateWorkoutStreak(userId);
        return Math.min(workoutStreak.current / achievement.requirement * 100, 100);
      
      case 'workout':
        if (achievementId.includes('calories_burned')) {
          const workouts = await getWorkouts(userId);
          const total = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          return Math.min((total / achievement.requirement) * 100, 100);
        } else {
          const workouts = await getWorkouts(userId);
          return Math.min((workouts.length / achievement.requirement) * 100, 100);
        }
      
      case 'calorie':
        const end = new Date();
        const start = achievementId === 'perfect_week' 
          ? startOfWeek(end, { weekStartsOn: 1 })
          : startOfMonth(end);
        let days = 0;
        const currentDate = new Date(start);
        while (currentDate <= end) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          const entries = await getCalorieEntries(userId, dateStr);
          if (entries.length > 0) days++;
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return Math.min((days / achievement.requirement) * 100, 100);
      
      case 'habit':
        const habits = await getHabits(userId);
        let maxStreak = 0;
        for (const habit of habits) {
          const entries = await getHabitEntries(habit.id, userId);
          const streak = calculateHabitStreak(entries);
          maxStreak = Math.max(maxStreak, streak.current);
        }
        return Math.min((maxStreak / achievement.requirement) * 100, 100);
      
      default:
        return 0;
    }
  } catch (error) {
    console.error('Error calculating achievement progress:', error);
    return 0;
  }
};

