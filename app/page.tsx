'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import WelcomePage from '@/components/WelcomePage';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Check if user needs onboarding first
      checkOnboardingAndRedirect();
    }
  }, [user, loading, router]);

  const checkOnboardingAndRedirect = async () => {
    if (!user) return;
    
    try {
      const { getUserSettings } = await import('@/lib/db');
      const settings = await getUserSettings(user.id);
      if (!settings?.onboardingCompleted) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      // On error, try onboarding first
      router.push('/onboarding');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <WelcomePage />;
}

