'use client';

import { Goal } from '@/lib/types';
import { Target, CheckCircle2, XCircle } from 'lucide-react';

interface GoalCardProps {
  goal: Goal;
  currentProgress: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function GoalCard({ goal, currentProgress, onEdit, onDelete }: GoalCardProps) {
  const progress = goal.target > 0 ? Math.min((currentProgress / goal.target) * 100, 100) : 0;
  const isCompleted = currentProgress >= goal.target;
  const remaining = Math.max(goal.target - currentProgress, 0);

  const getGoalTypeLabel = () => {
    switch (goal.type) {
      case 'calorie':
        return 'Calories';
      case 'workout':
        return 'Workouts';
      case 'habit':
        return 'Habits';
      case 'weight':
        return 'Weight';
      default:
        return goal.type;
    }
  };

  const getPeriodLabel = () => {
    switch (goal.period) {
      case 'daily':
        return 'per day';
      case 'weekly':
        return 'per week';
      case 'monthly':
        return 'per month';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-2 ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-primary-100'}`}>
            <Target className={isCompleted ? 'text-green-600' : 'text-primary-600'} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{getGoalTypeLabel()}</h3>
            <p className="text-sm text-gray-600">
              {goal.target} {getGoalTypeLabel().toLowerCase()} {getPeriodLabel()}
            </p>
          </div>
        </div>
        {isCompleted && (
          <CheckCircle2 className="text-green-600" size={24} />
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-primary-600">
            {currentProgress.toFixed(1)} / {goal.target}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-primary-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {!isCompleted && (
          <p className="text-xs text-gray-500 mt-1">
            {remaining.toFixed(1)} remaining to reach goal
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-600">Started: </span>
          <span className="font-medium">{new Date(goal.startDate).toLocaleDateString()}</span>
        </div>
        {goal.endDate && (
          <div>
            <span className="text-gray-600">Ends: </span>
            <span className="font-medium">{new Date(goal.endDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

