'use client';

import { useState, useEffect } from 'react';
import { Bell, Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getUserSettings, updateUserSettings } from '@/lib/db';
import { requestNotificationPermission, setupDailyReminders } from '@/lib/notifications';
import { UserSettings } from '@/lib/types';

export default function NotificationSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('unsupported');

  useEffect(() => {
    if (user) {
      loadSettings();
      checkPermission();
    }
  }, [user]);

  const checkPermission = () => {
    if (!('Notification' in window)) {
      setPermissionStatus('unsupported');
      return;
    }
    setPermissionStatus(Notification.permission as any);
  };

  const loadSettings = async () => {
    if (!user) return;
    try {
      const userSettings = await getUserSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    checkPermission();
    if (permission.granted && user) {
      await updateUserSettings(user.id, { notificationsEnabled: true });
      await loadSettings();
      await setupDailyReminders(user.id);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (!user || !settings) return;
    try {
      await updateUserSettings(user.id, { notificationsEnabled: enabled });
      setSettings({ ...settings, notificationsEnabled: enabled });
      if (enabled) {
        await setupDailyReminders(user.id);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const addReminderTime = async (type: 'meals' | 'workouts' | 'habits' | 'water', time: string) => {
    if (!user || !settings) return;
    const currentTimes = settings.reminderTimes[type] || [];
    if (currentTimes.includes(time)) return;

    const newTimes = [...currentTimes, time].sort();
    const updatedReminderTimes = {
      ...settings.reminderTimes,
      [type]: newTimes,
    };

    try {
      await updateUserSettings(user.id, { reminderTimes: updatedReminderTimes });
      setSettings({ ...settings, reminderTimes: updatedReminderTimes });
      await setupDailyReminders(user.id);
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const removeReminderTime = async (type: 'meals' | 'workouts' | 'habits' | 'water', time: string) => {
    if (!user || !settings) return;
    const currentTimes = settings.reminderTimes[type] || [];
    const newTimes = currentTimes.filter(t => t !== time);

    const updatedReminderTimes = {
      ...settings.reminderTimes,
      [type]: newTimes,
    };

    try {
      await updateUserSettings(user.id, { reminderTimes: updatedReminderTimes });
      setSettings({ ...settings, reminderTimes: updatedReminderTimes });
    } catch (error) {
      console.error('Error removing reminder:', error);
    }
  };

  if (loading || !settings) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="text-primary-600" size={24} />
            <h3 className="text-lg font-semibold">Notifications</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {permissionStatus === 'unsupported' && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your browser does not support notifications.
          </p>
        )}

        {permissionStatus === 'denied' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}

        {permissionStatus === 'default' && (
          <button
            onClick={handleRequestPermission}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mb-4"
          >
            Enable Browser Notifications
          </button>
        )}

        {settings.notificationsEnabled && permissionStatus === 'granted' && (
          <div className="space-y-4">
            {(['meals', 'workouts', 'habits', 'water'] as const).map((type) => (
              <div key={type} className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 capitalize">
                  {type} Reminders
                </h4>
                <div className="space-y-2">
                  {(settings.reminderTimes[type] || []).map((time) => (
                    <div key={time} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                      <span className="text-sm font-medium">{time}</span>
                      <button
                        onClick={() => removeReminderTime(type, time)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="time"
                      id={`${type}-time`}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`${type}-time`) as HTMLInputElement;
                        if (input.value) {
                          addReminderTime(type, input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

