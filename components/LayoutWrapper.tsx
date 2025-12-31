'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Navigation from './Navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Don't show navigation on welcome page or login page
  const isWelcomePage = pathname === '/' && !user && !loading;
  const isLoginPage = pathname === '/login';
  const shouldHideNavigation = isWelcomePage || isLoginPage;
  
  if (shouldHideNavigation) {
    // Welcome/login pages - no navigation, full width
    return <>{children}</>;
  }
  
  // Authenticated pages - show navigation with proper spacing
  return (
    <>
      <Navigation />
      <div className="lg:ml-64 pb-16 lg:pb-0 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {children}
      </div>
    </>
  );
}

