// BMR and TDEE calculation functions

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number; // in cm
  weight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

// Activity multipliers for TDEE calculation
const activityMultipliers = {
  sedentary: 1.2,      // Little or no exercise
  light: 1.375,        // Light exercise 1-3 days/week
  moderate: 1.55,      // Moderate exercise 3-5 days/week
  active: 1.725,       // Hard exercise 6-7 days/week
  very_active: 1.9,    // Very hard exercise, physical job
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * BMR is the number of calories your body burns at rest
 */
export const calculateBMR = (profile: UserProfile): number => {
  const { age, gender, height, weight } = profile;
  
  // Mifflin-St Jeor Equation
  // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
  // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
  
  const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
  const bmr = gender === 'male' ? baseBMR + 5 : baseBMR - 161;
  
  return Math.round(bmr);
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * TDEE = BMR × Activity Multiplier
 */
export const calculateTDEE = (profile: UserProfile): number => {
  const bmr = calculateBMR(profile);
  const multiplier = activityMultipliers[profile.activityLevel];
  return Math.round(bmr * multiplier);
};

/**
 * Calculate recommended daily calorie target based on body goal
 */
export const calculateCalorieTarget = (
  profile: UserProfile,
  bodyGoal: 'fat_loss' | 'weight_loss' | 'muscle_gain' | 'maintain' | 'body_recomposition'
): number => {
  const tdee = calculateTDEE(profile);
  
  switch (bodyGoal) {
    case 'fat_loss':
      // Aggressive deficit: -500 to -750 calories (20-30% deficit)
      return Math.round(tdee * 0.75);
    
    case 'weight_loss':
      // Moderate deficit: -300 to -500 calories (15-20% deficit)
      return Math.round(tdee * 0.85);
    
    case 'muscle_gain':
      // Surplus: +300 to +500 calories (10-15% surplus)
      return Math.round(tdee * 1.15);
    
    case 'body_recomposition':
      // Slight deficit or maintenance: -100 to +100 calories
      return Math.round(tdee * 0.95);
    
    case 'maintain':
    default:
      // Maintenance: TDEE
      return tdee;
  }
};

/**
 * Convert height from feet/inches to cm
 */
export const feetInchesToCm = (feet: number, inches: number): number => {
  return Math.round((feet * 30.48) + (inches * 2.54));
};

/**
 * Convert height from cm to feet/inches
 */
export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

/**
 * Convert weight from lbs to kg
 */
export const lbsToKg = (lbs: number): number => {
  return Math.round(lbs * 0.453592 * 10) / 10;
};

/**
 * Convert weight from kg to lbs
 */
export const kgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462 * 10) / 10;
};

