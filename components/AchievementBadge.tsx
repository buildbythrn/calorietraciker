'use client';

import { AchievementDefinition } from '@/lib/types';
import { Trophy, Lock } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: AchievementDefinition;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
}

export default function AchievementBadge({ achievement, unlocked, unlockedDate, progress }: AchievementBadgeProps) {
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border-2 transition-all ${
      unlocked 
        ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20' 
        : 'border-gray-200 dark:border-gray-700 opacity-60'
    }`}>
      {unlocked && (
        <div className="absolute top-2 right-2">
          <div className="bg-yellow-400 rounded-full p-1">
            <Trophy className="text-yellow-900" size={16} />
          </div>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className={`text-5xl ${unlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-lg ${unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {achievement.name}
            </h3>
            {!unlocked && <Lock size={16} className="text-gray-400" />}
          </div>
          <p className={`text-sm mb-3 ${unlocked ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
            {achievement.description}
          </p>
          
          {!unlocked && progress !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {unlocked && unlockedDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Unlocked: {unlockedDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

