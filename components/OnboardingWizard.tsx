'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, User, Target, Calculator, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserSettings, updateUserSettings, addWeightEntry } from '@/lib/db';
import { calculateBMR, calculateTDEE, calculateCalorieTarget, feetInchesToCm, lbsToKg, UserProfile } from '@/lib/calculations';
import PetMascot from './mascots/PetMascot';
import { useRouter } from 'next/navigation';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip?: () => void;
}

const activityLevels = [
  { id: 'sedentary' as const, label: 'Sedentary', description: 'Little or no exercise' },
  { id: 'light' as const, label: 'Lightly Active', description: 'Light exercise 1-3 days/week' },
  { id: 'moderate' as const, label: 'Moderately Active', description: 'Moderate exercise 3-5 days/week' },
  { id: 'active' as const, label: 'Very Active', description: 'Hard exercise 6-7 days/week' },
  { id: 'very_active' as const, label: 'Extremely Active', description: 'Very hard exercise, physical job' },
];

const bodyGoals = [
  { id: 'fat_loss' as const, title: 'Fat Loss', description: 'Burn more calories than you consume' },
  { id: 'weight_loss' as const, title: 'Weight Loss', description: 'Reduce overall body weight' },
  { id: 'muscle_gain' as const, title: 'Muscle Gain', description: 'Build muscle mass' },
  { id: 'maintain' as const, title: 'Maintain Weight', description: 'Keep your current weight' },
  { id: 'body_recomposition' as const, title: 'Body Recomposition', description: 'Lose fat and gain muscle' },
];

export default function OnboardingWizard({ isOpen, onComplete, onSkip }: OnboardingWizardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 25,
    gender: 'male',
    height: 170, // cm
    weight: 70, // kg
    activityLevel: 'moderate',
  });
  const [bodyGoal, setBodyGoal] = useState<'fat_loss' | 'weight_loss' | 'muscle_gain' | 'maintain' | 'body_recomposition' | null>(null);
  const [calorieTarget, setCalorieTarget] = useState<number | null>(null);
  const [useMetric, setUseMetric] = useState(true);
  const [saving, setSaving] = useState(false);

  // Convert units for display
  const displayHeight = useMetric 
    ? profile.height 
    : profile.height ? Math.round(profile.height / 2.54) : 0; // cm to inches
  const displayWeight = useMetric 
    ? profile.weight 
    : profile.weight ? Math.round(profile.weight * 2.20462) : 0; // kg to lbs

  const steps = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'profile', title: 'Your Profile' },
    { id: 'goal', title: 'Your Goal' },
    { id: 'calories', title: 'Calorie Target' },
    { id: 'features', title: 'Features' },
    { id: 'complete', title: 'Complete' },
  ];

  useEffect(() => {
    if (bodyGoal && profile.age && profile.gender && profile.height && profile.weight && profile.activityLevel) {
      const fullProfile: UserProfile = {
        age: profile.age,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel,
      };
      const target = calculateCalorieTarget(fullProfile, bodyGoal);
      setCalorieTarget(target);
    }
  }, [bodyGoal, profile]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!user || !bodyGoal || !calorieTarget) return;

    setSaving(true);
    try {
      // Save profile and settings
      await updateUserSettings(user.id, {
        profile: {
          age: profile.age,
          gender: profile.gender,
          height: profile.height,
          weight: profile.weight,
          activityLevel: profile.activityLevel,
        },
        bodyGoal,
        dailyCalorieTarget: calorieTarget,
        onboardingCompleted: true,
      });

      // Save initial weight entry
      if (profile.weight) {
        await addWeightEntry({
          userId: user.id,
          weight: profile.weight,
          date: new Date().toISOString().split('T')[0],
        });
      }

      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      onSkip?.();
      return;
    }

    try {
      // Mark onboarding as skipped (completed = true but with no data)
      await updateUserSettings(user.id, {
        onboardingCompleted: true,
      });
      onSkip?.();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      onSkip?.();
    }
  };

  const updateHeight = (value: number) => {
    if (useMetric) {
      setProfile({ ...profile, height: value });
    } else {
      // Convert inches to cm
      setProfile({ ...profile, height: Math.round(value * 2.54) });
    }
  };

  const updateWeight = (value: number) => {
    if (useMetric) {
      setProfile({ ...profile, weight: value });
    } else {
      // Convert lbs to kg
      setProfile({ ...profile, weight: Math.round(value * 0.453592 * 10) / 10 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <PetMascot petType="panda" size="sm" iconType="default" mood="happy" className="animate-float" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to FitFlow!</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  index <= currentStep
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 0: Welcome */}
          {currentStep === 0 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <PetMascot petType="panda" size="lg" iconType="default" mood="excited" className="animate-float" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Let's Get Started!
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                We'll help you set up your profile and goals in just a few steps. 
                This will take about 2 minutes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <User className="text-primary-600 dark:text-primary-400 mx-auto mb-2" size={32} />
                  <p className="font-semibold text-gray-900 dark:text-white">Your Profile</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Age, height, weight</p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Target className="text-purple-600 dark:text-purple-400 mx-auto mb-2" size={32} />
                  <p className="font-semibold text-gray-900 dark:text-white">Your Goals</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">What you want to achieve</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calculator className="text-green-600 dark:text-green-400 mx-auto mb-2" size={32} />
                  <p className="font-semibold text-gray-900 dark:text-white">Calorie Target</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Personalized for you</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Profile */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tell Us About Yourself</h3>
              
              <div className="space-y-6">
                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setProfile({ ...profile, gender: 'male' })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        profile.gender === 'male'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">Male</p>
                    </button>
                    <button
                      onClick={() => setProfile({ ...profile, gender: 'female' })}
                      className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                        profile.gender === 'female'
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">Female</p>
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    min="13"
                    max="120"
                    value={profile.age || ''}
                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 25 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Height */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Height
                    </label>
                    <button
                      onClick={() => setUseMetric(!useMetric)}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Switch to {useMetric ? 'Imperial' : 'Metric'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {useMetric ? (
                      <input
                        type="number"
                        min="100"
                        max="250"
                        value={displayHeight || ''}
                        onChange={(e) => updateHeight(parseInt(e.target.value) || 170)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="170"
                      />
                    ) : (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="number"
                          min="3"
                          max="8"
                          value={displayHeight ? Math.floor(displayHeight / 12) : ''}
                          onChange={(e) => {
                            const feet = parseInt(e.target.value) || 0;
                            const inches = (displayHeight || 0) % 12;
                            updateHeight(feet * 12 + inches);
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="5"
                        />
                        <span className="self-center text-gray-500">ft</span>
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={displayHeight ? displayHeight % 12 : ''}
                          onChange={(e) => {
                            const inches = parseInt(e.target.value) || 0;
                            const feet = Math.floor((displayHeight || 0) / 12);
                            updateHeight(feet * 12 + inches);
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          placeholder="10"
                        />
                        <span className="self-center text-gray-500">in</span>
                      </div>
                    )}
                    <span className="text-gray-500">{useMetric ? 'cm' : ''}</span>
                  </div>
                </div>

                {/* Weight */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Weight
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={useMetric ? "30" : "66"}
                      max={useMetric ? "200" : "440"}
                      step={useMetric ? "0.1" : "1"}
                      value={displayWeight || ''}
                      onChange={(e) => updateWeight(parseFloat(e.target.value) || 70)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder={useMetric ? "70" : "154"}
                    />
                    <span className="text-gray-500">{useMetric ? 'kg' : 'lbs'}</span>
                  </div>
                </div>

                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Level
                  </label>
                  <div className="space-y-2">
                    {activityLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => setProfile({ ...profile, activityLevel: level.id })}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          profile.activityLevel === level.id
                            ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">{level.label}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goal */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What's Your Goal?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Select your primary fitness goal. We'll personalize your calorie target based on this.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bodyGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setBodyGoal(goal.id)}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      bodyGoal === goal.id
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{goal.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Calorie Target */}
          {currentStep === 3 && calorieTarget && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Calorie Target</h3>
              
              {profile.age && profile.gender && profile.height && profile.weight && profile.activityLevel && (
                <>
                  <div className="bg-gradient-to-r from-primary-500 to-blue-500 rounded-xl p-8 text-white mb-6 text-center">
                    <p className="text-sm opacity-90 mb-2">Daily Calorie Target</p>
                    <p className="text-5xl font-bold mb-4">{calorieTarget.toLocaleString()}</p>
                    <p className="text-sm opacity-90">calories per day</p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">BMR (Basal Metabolic Rate)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {calculateBMR({
                          age: profile.age,
                          gender: profile.gender,
                          height: profile.height,
                          weight: profile.weight,
                          activityLevel: profile.activityLevel,
                        }).toLocaleString()} cal
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">TDEE (Total Daily Energy Expenditure)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {calculateTDEE({
                          age: profile.age,
                          gender: profile.gender,
                          height: profile.height,
                          weight: profile.weight,
                          activityLevel: profile.activityLevel,
                        }).toLocaleString()} cal
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Based on your goal ({bodyGoals.find(g => g.id === bodyGoal)?.title}), 
                        we've calculated your daily calorie target. You can adjust this later in Settings.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Features */}
          {currentStep === 4 && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Calorie Tracking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Log your meals and track your daily calorie intake. Search from our database of foods including Indian meals!
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">💪 Workout Logging</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Record your workouts and track calories burned. Build streaks to stay motivated!
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✅ Habit Tracking</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Build healthy habits with daily tracking and streak visualization.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📈 Analytics & Goals</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View your progress over time and set goals to achieve your fitness targets.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-6">
                <PetMascot petType="panda" size="lg" iconType="default" mood="excited" className="animate-float" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                You're All Set! 🎉
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Your profile is set up and ready to go. Start tracking your calories and workouts to reach your goals!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => router.push('/calories')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  Log Your First Meal
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => router.push('/workouts')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  Log Your First Workout
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Back
          </button>
          
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-primary-600'
                    : index < currentStep
                    ? 'bg-primary-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!profile.age || !profile.gender || !profile.height || !profile.weight || !profile.activityLevel)) ||
                (currentStep === 2 && !bodyGoal)
              }
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving || !calorieTarget}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Complete Setup'}
              <CheckCircle2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

