'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserSettings } from '@/lib/db';
import { checkWeeklyReminder, requestNotificationPermission, showNotification } from '@/lib/notifications';
import { Scale, Ruler, X } from 'lucide-react';
import Link from 'next/link';

export default function WeeklyReminderBanner() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<{
    weight?: { dayOfWeek: number; time: string };
    measurements?: { dayOfWeek: number; time: string };
  }>({});
  const [showWeightReminder, setShowWeightReminder] = useState(false);
  const [showMeasurementsReminder, setShowMeasurementsReminder] = useState(false);
  const [dismissed, setDismissed] = useState<{ weight?: boolean; measurements?: boolean }>({});

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  useEffect(() => {
    // Check reminders every minute
    const interval = setInterval(() => {
      checkReminders();
    }, 60000); // Check every minute

    checkReminders(); // Initial check

    return () => clearInterval(interval);
  }, [reminders, dismissed]);

  const loadReminders = async () => {
    if (!user) return;
    try {
      const settings = await getUserSettings(user.id);
      if (settings?.weeklyReminders) {
        setReminders({
          weight: settings.weeklyReminders.weight?.enabled
            ? {
                dayOfWeek: settings.weeklyReminders.weight.dayOfWeek,
                time: settings.weeklyReminders.weight.time,
              }
            : undefined,
          measurements: settings.weeklyReminders.measurements?.enabled
            ? {
                dayOfWeek: settings.weeklyReminders.measurements.dayOfWeek,
                time: settings.weeklyReminders.measurements.time,
              }
            : undefined,
        });
      }
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const checkReminders = async () => {
    if (!reminders.weight && !reminders.measurements) return;

    // Check weight reminder
    if (reminders.weight && !dismissed.weight) {
      const isReminderDay = checkWeeklyReminder(reminders.weight.dayOfWeek, reminders.weight.time);
      if (isReminderDay && !showWeightReminder) {
        setShowWeightReminder(true);
        // Show browser notification if permission granted
        const permission = await requestNotificationPermission();
        if (permission.granted) {
          showNotification('Weekly Reminder', {
            body: "It's time to log your weight! 📊",
            tag: 'weekly-reminder-weight',
          });
        }
      }
    }

    // Check measurements reminder
    if (reminders.measurements && !dismissed.measurements) {
      const isReminderDay = checkWeeklyReminder(
        reminders.measurements.dayOfWeek,
        reminders.measurements.time
      );
      if (isReminderDay && !showMeasurementsReminder) {
        setShowMeasurementsReminder(true);
        // Show browser notification if permission granted
        const permission = await requestNotificationPermission();
        if (permission.granted) {
          showNotification('Weekly Reminder', {
            body: "Don't forget to log your body measurements! 📏",
            tag: 'weekly-reminder-measurements',
          });
        }
      }
    }
  };

  if (!showWeightReminder && !showMeasurementsReminder) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {showWeightReminder && !dismissed.weight && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Scale className="text-primary-600 dark:text-primary-400" size={20} />
            </div>
            <div>
              <p className="font-medium text-primary-900 dark:text-primary-100">
                Weekly Weight Check Reminder
              </p>
              <p className="text-sm text-primary-700 dark:text-primary-300">
                It's time to log your weight for this week!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/weight"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Log Weight
            </Link>
            <button
              onClick={() => {
                setDismissed(prev => ({ ...prev, weight: true }));
                setShowWeightReminder(false);
              }}
              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {showMeasurementsReminder && !dismissed.measurements && (
        <div className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg">
              <Ruler className="text-secondary-600 dark:text-secondary-400" size={20} />
            </div>
            <div>
              <p className="font-medium text-secondary-900 dark:text-secondary-100">
                Weekly Measurements Reminder
              </p>
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                Don't forget to log your body measurements!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/measurements"
              className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors text-sm font-medium"
            >
              Log Measurements
            </Link>
            <button
              onClick={() => {
                setDismissed(prev => ({ ...prev, measurements: true }));
                setShowMeasurementsReminder(false);
              }}
              className="p-2 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            </div>
        </div>
      )}
    </div>
  );
}


