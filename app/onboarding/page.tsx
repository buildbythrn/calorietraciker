'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserSettings } from '@/lib/db';
import OnboardingWizard from '@/components/OnboardingWizard';

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }

    if (user) {
      checkOnboardingStatus();
    }
  }, [user, loading, router]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    try {
      const settings = await getUserSettings(user.id);
      if (settings?.onboardingCompleted) {
        // Already completed, redirect to dashboard
        router.push('/dashboard');
      } else {
        // Show onboarding
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // On error, show onboarding anyway
      setShowOnboarding(true);
    } finally {
      setCheckingOnboarding(false);
    }
  };

  const handleComplete = () => {
    router.push('/dashboard');
  };

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <OnboardingWizard
        isOpen={showOnboarding}
        onComplete={handleComplete}
      />
    </div>
  );
}



