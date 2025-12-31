'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { getAchievements } from '@/lib/db';
import { checkAchievements, ACHIEVEMENT_DEFINITIONS, getAchievementProgress } from '@/lib/achievements';
import { Achievement, AchievementDefinition } from '@/lib/types';
import AchievementBadge from '@/components/AchievementBadge';
import FitFlowMascot from '@/components/FitFlowMascot';

export default function AchievementsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadAchievements();
      checkNewAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;
    setLoadingAchievements(true);
    try {
      const achievements = await getAchievements(user.id);
      setUnlockedAchievements(achievements);
      
      // Calculate progress for locked achievements
      const progress: Record<string, number> = {};
      for (const def of ACHIEVEMENT_DEFINITIONS) {
        const isUnlocked = achievements.some(a => a.achievementId === def.id);
        if (!isUnlocked) {
          const prog = await getAchievementProgress(user.id, def.id);
          progress[def.id] = prog;
        }
      }
      setProgressMap(progress);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const checkNewAchievements = async () => {
    if (!user) return;
    try {
      const newlyUnlocked = await checkAchievements(user.id);
      if (newlyUnlocked.length > 0) {
        setNewUnlocks(newlyUnlocked);
        loadAchievements();
        // Show notification for new unlocks
        setTimeout(() => setNewUnlocks([]), 5000);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  const getUnlockedAchievement = (achievementId: string): Achievement | undefined => {
    return unlockedAchievements.find(a => a.achievementId === achievementId);
  };

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Summary */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-sm p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Achievement Progress</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-4xl font-bold">{unlockedCount} / {totalCount}</p>
                  <p className="text-sm opacity-90">Unlocked</p>
                </div>
                <div className="w-24 h-24 relative">
                  <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{completionPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FitFlowMascot variant={unlockedCount > 0 ? "celebrate" : "encourage"} size="lg" className="animate-float" />
              <Trophy size={64} className="opacity-20" />
            </div>
          </div>
        </div>

        {/* New Unlocks Notification */}
        {newUnlocks.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <FitFlowMascot variant="celebrate" size="md" className="animate-float" />
              <div className="flex items-center gap-2 flex-1">
                <Sparkles className="text-yellow-600 dark:text-yellow-400" size={20} />
                <p className="font-semibold text-yellow-900 dark:text-yellow-200">
                  🎉 New Achievement{newUnlocks.length > 1 ? 's' : ''} Unlocked!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        {loadingAchievements ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ACHIEVEMENT_DEFINITIONS.map((achievement) => {
              const unlocked = getUnlockedAchievement(achievement.id);
              return (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  unlocked={!!unlocked}
                  unlockedDate={unlocked?.unlockedAt}
                  progress={progressMap[achievement.id]}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

