import { getUserSettings, updateUserSettings } from './db';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return { granted: false, denied: false, default: false };
  }

  if (Notification.permission === 'granted') {
    return { granted: true, denied: false, default: false };
  }

  if (Notification.permission === 'denied') {
    return { granted: false, denied: true, default: false };
  }

  const permission = await Notification.requestPermission();
  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    default: permission === 'default',
  };
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  new Notification(title, {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    ...options,
  });
};

export const scheduleReminder = async (
  userId: string,
  type: 'meals' | 'workouts' | 'habits' | 'water',
  time: string, // HH:mm format
  message: string
) => {
  const settings = await getUserSettings(userId);
  if (!settings?.notificationsEnabled) {
    return;
  }

  // Check if reminder time is in the future today
  const [hours, minutes] = time.split(':').map(Number);
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  if (reminderTime <= now) {
    // Schedule for tomorrow
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  const delay = reminderTime.getTime() - now.getTime();

  setTimeout(() => {
    requestNotificationPermission().then(permission => {
      if (permission.granted) {
        showNotification('Reminder', {
          body: message,
          tag: `reminder-${type}`,
        });
      }
    });
  }, delay);
};

export const setupDailyReminders = async (userId: string) => {
  const settings = await getUserSettings(userId);
  if (!settings?.notificationsEnabled || !settings.reminderTimes) {
    return;
  }

  // Clear existing reminders and set up new ones
  // This is a simplified version - in production, you'd want to use a more robust scheduling system

  if (settings.reminderTimes.meals) {
    settings.reminderTimes.meals.forEach(time => {
      scheduleReminder(userId, 'meals', time, "Don't forget to log your meals!");
    });
  }

  if (settings.reminderTimes.workouts) {
    settings.reminderTimes.workouts.forEach(time => {
      scheduleReminder(userId, 'workouts', time, 'Time for your workout!');
    });
  }

  if (settings.reminderTimes.habits) {
    settings.reminderTimes.habits.forEach(time => {
      scheduleReminder(userId, 'habits', time, 'Check your habits for today!');
    });
  }

  if (settings.reminderTimes.water) {
    settings.reminderTimes.water.forEach(time => {
      scheduleReminder(userId, 'water', time, 'Stay hydrated! Log your water intake.');
    });
  }
};

