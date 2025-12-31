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
  
  // Additional Strength Exercises with Muscle Groups
  { name: 'Barbell Rows', type: 'strength', caloriesPerMinute: 4.0, metValue: 4.0, description: 'Barbell bent-over rows', muscleGroups: ['Back', 'Biceps'] },
  { name: 'Overhead Press', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Overhead barbell press', muscleGroups: ['Shoulders', 'Triceps', 'Core'] },
  { name: 'Romanian Deadlifts', type: 'strength', caloriesPerMinute: 5.5, metValue: 5.0, description: 'RDLs', muscleGroups: ['Back', 'Legs', 'Glutes'] },
  { name: 'Leg Press', type: 'strength', caloriesPerMinute: 4.5, metValue: 4.0, description: 'Leg press machine', muscleGroups: ['Legs', 'Glutes'] },
  { name: 'Lat Pulldowns', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Lat pulldown machine', muscleGroups: ['Back', 'Biceps'] },
  { name: 'Cable Flyes', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Cable chest flyes', muscleGroups: ['Chest'] },
  { name: 'Tricep Dips', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Tricep dips', muscleGroups: ['Triceps', 'Shoulders'] },
  { name: 'Bicep Hammer Curls', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Hammer curls', muscleGroups: ['Biceps', 'Forearms'] },
  { name: 'Leg Curls', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Hamstring curls', muscleGroups: ['Legs'] },
  { name: 'Leg Extensions', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Quad extensions', muscleGroups: ['Legs'] },
  { name: 'Calf Raises', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Calf raises', muscleGroups: ['Legs'] },
  { name: 'Russian Twists', type: 'strength', caloriesPerMinute: 4.0, metValue: 4.0, description: 'Russian twists', muscleGroups: ['Core'] },
  { name: 'Side Plank', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Side plank hold', muscleGroups: ['Core'] },
  { name: 'Bicycle Crunches', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Bicycle crunches', muscleGroups: ['Core'] },
  { name: 'Incline Bench Press', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Incline bench press', muscleGroups: ['Chest', 'Shoulders', 'Triceps'] },
  { name: 'Decline Bench Press', type: 'strength', caloriesPerMinute: 3.5, metValue: 3.5, description: 'Decline bench press', muscleGroups: ['Chest', 'Triceps'] },
  { name: 'Barbell Curls', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Barbell bicep curls', muscleGroups: ['Biceps'] },
  { name: 'Tricep Pushdowns', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Cable tricep pushdowns', muscleGroups: ['Triceps'] },
  { name: 'Lateral Raises', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Dumbbell lateral raises', muscleGroups: ['Shoulders'] },
  { name: 'Front Raises', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Dumbbell front raises', muscleGroups: ['Shoulders'] },
  { name: 'Face Pulls', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Cable face pulls', muscleGroups: ['Shoulders', 'Back'] },
  { name: 'Chest Dips', type: 'strength', caloriesPerMinute: 4.0, metValue: 4.0, description: 'Chest dips', muscleGroups: ['Chest', 'Triceps', 'Shoulders'] },
  { name: 'Barbell Shrugs', type: 'strength', caloriesPerMinute: 3.0, metValue: 3.0, description: 'Barbell shrugs', muscleGroups: ['Traps', 'Shoulders'] },
  { name: 'Good Mornings', type: 'strength', caloriesPerMinute: 4.5, metValue: 4.0, description: 'Good morning exercise', muscleGroups: ['Back', 'Legs', 'Glutes'] },
  { name: 'Hip Thrusts', type: 'strength', caloriesPerMinute: 4.5, metValue: 4.0, description: 'Hip thrusts', muscleGroups: ['Glutes', 'Legs'] },
  { name: 'Bulgarian Split Squats', type: 'strength', caloriesPerMinute: 5.0, metValue: 5.0, description: 'Bulgarian split squats', muscleGroups: ['Legs', 'Glutes'] },
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

// Calculate calories for strength exercises based on weight, sets, and reps
// Formula: Base calories from exercise + (weight × sets × reps × intensity factor)
export const calculateStrengthCalories = (
  exercise: Exercise,
  weight: number, // in kg
  sets: number,
  reps: number,
  userWeight: number = 70 // in kg
): number => {
  // Base calories from the exercise type (per set)
  // Strength exercises typically burn 3-6 calories per minute
  // We estimate based on time: ~30 seconds per set (including rest)
  const estimatedMinutesPerSet = 0.5; // 30 seconds per set
  const totalMinutes = sets * estimatedMinutesPerSet;
  
  // Base calories from exercise duration
  const baseCalories = exercise.caloriesPerMinute * totalMinutes * (userWeight / 70);
  
  // Additional calories from lifting weight
  // Formula: weight lifted × sets × reps × 0.05 (calories per kg lifted)
  const weightCalories = weight * sets * reps * 0.05;
  
  // Intensity multiplier based on exercise type
  // Compound movements burn more calories
  const isCompound = exercise.muscleGroups && exercise.muscleGroups.length > 2;
  const intensityMultiplier = isCompound ? 1.3 : 1.0;
  
  const totalCalories = (baseCalories + weightCalories) * intensityMultiplier;
  
  return Math.round(Math.max(totalCalories, 10)); // Minimum 10 calories
};

// Get all unique muscle groups from exercise database
export const getAllMuscleGroups = (): string[] => {
  const groups = new Set<string>();
  exerciseDatabase.forEach(exercise => {
    if (exercise.muscleGroups) {
      exercise.muscleGroups.forEach(group => groups.add(group));
    }
  });
  return Array.from(groups).sort();
};

// Get exercises by muscle group
export const getExercisesByMuscleGroup = (muscleGroup: string): Exercise[] => {
  return exerciseDatabase.filter(exercise =>
    exercise.muscleGroups?.some(group => 
      group.toLowerCase() === muscleGroup.toLowerCase()
    )
  );
};

// Get exercises by multiple muscle groups (any match)
export const getExercisesByMuscleGroups = (muscleGroups: string[]): Exercise[] => {
  if (muscleGroups.length === 0) return [];
  
  return exerciseDatabase.filter(exercise =>
    exercise.muscleGroups?.some(group =>
      muscleGroups.some(searchGroup =>
        group.toLowerCase() === searchGroup.toLowerCase()
      )
    )
  );
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

