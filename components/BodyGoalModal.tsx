'use client';

import { useState } from 'react';
import { X, TrendingDown, Scale, TrendingUp, Target, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserSettings, updateUserSettings } from '@/lib/db';

interface BodyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const bodyGoals = [
  {
    id: 'fat_loss' as const,
    title: 'Fat Loss',
    description: 'Burn more calories than you consume. Focus on losing body fat while maintaining muscle.',
    icon: TrendingDown,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
  },
  {
    id: 'weight_loss' as const,
    title: 'Weight Loss',
    description: 'Reduce overall body weight through calorie deficit and regular exercise.',
    icon: Scale,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
  },
  {
    id: 'muscle_gain' as const,
    title: 'Muscle Gain',
    description: 'Build muscle mass through strength training and calorie surplus with adequate protein.',
    icon: TrendingUp,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
  },
  {
    id: 'maintain' as const,
    title: 'Maintain Weight',
    description: 'Keep your current weight and body composition through balanced nutrition and exercise.',
    icon: Target,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
  },
  {
    id: 'body_recomposition' as const,
    title: 'Body Recomposition',
    description: 'Lose fat and gain muscle simultaneously. Best for beginners or returning to fitness.',
    icon: Zap,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    borderColor: 'border-pink-500',
  },
];

export default function BodyGoalModal({ isOpen, onClose }: BodyGoalModalProps) {
  const { user } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user || !selectedGoal) return;

    setSaving(true);
    try {
      await updateUserSettings(user.id, { bodyGoal: selectedGoal as any });
      onClose();
    } catch (error) {
      console.error('Error saving body goal:', error);
      alert('Failed to save goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What's Your Goal?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select your primary fitness goal to personalize your experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {bodyGoals.map((goal) => {
              const Icon = goal.icon;
              const isSelected = selectedGoal === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${goal.borderColor} ${goal.bgColor} shadow-lg`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${goal.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={goal.color} size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {goal.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedGoal || saving}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

