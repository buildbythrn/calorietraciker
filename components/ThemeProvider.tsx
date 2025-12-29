'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getUserSettings, updateUserSettings } from '@/lib/db';
import { useAuth } from '@/lib/auth';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check system preference first
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(systemPrefersDark);
    
    // Load user preference
    if (user) {
      loadUserTheme();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const loadUserTheme = async () => {
    if (!user) return;
    try {
      const settings = await getUserSettings(user.id);
      if (settings) {
        setDarkMode(settings.darkMode);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (user) {
      try {
        await updateUserSettings(user.id, { darkMode: newMode });
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

