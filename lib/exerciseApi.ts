// Exercise API service for automatic calorie burn calculation
// Uses ExerciseDB API and local exercise database

export interface Exercise {
  name: string;
  type: 'cardio' | 'strength' | 'flexibility' | 'other';
  caloriesPerMinute: number; // Base calories per minute for average person (70kg/154lbs)
  metValue?: number; // Metabolic Equivalent of Task
  description?: string;
  muscleGroups?: string[];
}

// Local database of common exercises with calorie estimates
// Calories are per minute for an average person (70kg/154lbs)
// For different weights: calories = baseCalories * (userWeight / 70)
const exerciseDatabase: Exercise[] = [
  // Cardio Exercises
  { name: 'Running', type: 'cardio', caloriesPerMinute: 11.4, metValue: 9.8, description: 'Running at moderate pace' },
  { name: 'Jogging', type: 'cardio', caloriesPerMinute: 8.3, metValue: 7.0, description: 'Jogging at slow pace' },
  { name: 'Walking', type: 'cardio', caloriesPerMinute: 3.8, metValue: 3.5, description: 'Walking at moderate pace' },
  { name: 'Cycling', type: 'cardio', caloriesPerMinute: 7.5, metValue: 6.0, description: 'Cycling at moderate pace' },
  { name: 'Swimming', type: 'cardio', caloriesPerMinute: 10.0, metValue: 8.3, description: 'Swimming freestyle' },
  { name: 'Rowing', type: 'cardio', caloriesPerMinute: 8.8, metValue: 7.0, description: 'Rowing machine' },
  { name: 'Elliptical', type: 'cardio', caloriesPerMinute: 7.1, metValue: 5.0, description: 'Elliptical trainer' },
  { name: 'Jump Rope', type: 'cardio', caloriesPerMinute: 12.0, metValue: 10.0, description: 'Jumping rope' },
  { name: 'HIIT', type: 'cardio', caloriesPerMinute: 12.5, metValue: 10.5, description: 'High Intensity Interval Training' },
  { name: 'Stair Climbing', type: 'cardio', caloriesPerMinute: 9.0, metValue: 8.0, description: 'Climbing stairs' },
  { name: 'Dancing', type: 'cardio', caloriesPerMinute: 5.0, metValue: 4.8, description: 'Dancing' },
  { name: 'Yoga', type: 'flexibility', caloriesPerMinute: 2.5, metValue: 2.5, description: 'Yoga practice' },
  { name: 'Pilates', type: 'flexibility', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Pilates' },
  { name: 'Stretching', type: 'flexibility', caloriesPerMinute: 2.0, metValue: 2.0, description: 'Stretching exercises' },
  
  // Strength Training Exercises
  { name: 'Weight Lifting', type: 'strength', caloriesPerMinute: 5.0, metValue: 5.0, description: 'General weight lifting', muscleGroups: ['Full Body'] },
  { name: 'Bench Press', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Bench press', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { name: 'Squats', type: 'strength', caloriesPerMinute: 5.5, metValue: 5.0, description: 'Squats', muscleGroups: ['Legs', 'Glutes'] },
  { name: 'Deadlifts', type: 'strength', caloriesPerMinute: 6.0, metValue: 6.0, description: 'Deadlifts', muscleGroups: ['Back', 'Legs', 'Glutes'] },
  { name: 'Pull-ups', type: 'strength', caloriesPerMinute: 4.5, metValue: 4.0, description: 'Pull-ups', muscleGroups: ['Back', 'Biceps'] },
  { name: 'Push-ups', type: 'strength', caloriesPerMinute: 4.0, metValue: 3.8, description: 'Push-ups', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { name: 'Dumbbell Curls', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Bicep curls with dumbbells', muscleGroups: ['Biceps'] },
  { name: 'Shoulder Press', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Shoulder press', muscleGroups: ['Shoulders', 'Triceps'] },
  { name: 'Lunges', type: 'strength', caloriesPerMinute: 4.5, metValue: 4.0, description: 'Lunges', muscleGroups: ['Legs', 'Glutes'] },
  { name: 'Plank', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Plank hold', muscleGroups: ['Core'] },
  { name: 'Crunches', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Abdominal crunches', muscleGroups: ['Core'] },
  { name: 'Burpees', type: 'cardio', caloriesPerMinute: 10.0, metValue: 8.0, description: 'Burpees', muscleGroups: ['Full Body'] },
  { name: 'Mountain Climbers', type: 'cardio', caloriesPerMinute: 8.0, metValue: 8.0, description: 'Mountain climbers', muscleGroups: ['Core', 'Cardio'] },
  { name: 'Kettlebell Swings', type: 'strength', caloriesPerMinute: 8.5, metValue: 8.0, description: 'Kettlebell swings', muscleGroups: ['Legs', 'Glutes', 'Core'] },
  { name: 'Resistance Band Training', type: 'strength', caloriesPerMinute: 4.0, metValue: 4.0, description: 'Resistance band exercises', muscleGroups: ['Full Body'] },
];

// Search exercises in local database
export const searchExercises = async (query: string): Promise<Exercise[]> => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  
  // Filter exercises that match the search term
  const matches = exerciseDatabase.filter(exercise => 
    exercise.name.toLowerCase().includes(searchTerm) ||
    exercise.description?.toLowerCase().includes(searchTerm) ||
    exercise.muscleGroups?.some(group => group.toLowerCase().includes(searchTerm))
  );

  // Sort by relevance (exact name matches first)
  const sorted = matches.sort((a, b) => {
    const aExact = a.name.toLowerCase() === searchTerm;
    const bExact = b.name.toLowerCase() === searchTerm;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    const aStarts = a.name.toLowerCase().startsWith(searchTerm);
    const bStarts = b.name.toLowerCase().startsWith(searchTerm);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    
    return 0;
  });

  return sorted.slice(0, 10); // Return top 10 results
};

// Calculate calories burned based on exercise, duration, and weight
export const calculateCaloriesBurned = (
  exercise: Exercise,
  duration: number, // in minutes
  userWeight: number = 70 // in kg, default 70kg (154lbs)
): number => {
  // Base calculation: calories = METs × weight(kg) × duration(hours)
  // Or simplified: calories = caloriesPerMinute × duration × (userWeight / 70)
  const baseCalories = exercise.caloriesPerMinute * duration;
  const adjustedCalories = baseCalories * (userWeight / 70);
  
  return Math.round(adjustedCalories);
};

// Get exercise by name
export const getExerciseByName = (name: string): Exercise | null => {
  return exerciseDatabase.find(
    ex => ex.name.toLowerCase() === name.toLowerCase()
  ) || null;
};

// Get all exercises by type
export const getExercisesByType = (type: Exercise['type']): Exercise[] => {
  return exerciseDatabase.filter(ex => ex.type === type);
};

