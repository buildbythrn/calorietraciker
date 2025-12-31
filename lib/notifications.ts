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

// Schedule weekly reminder for weight or measurements
export const scheduleWeeklyReminder = async (
  userId: string,
  type: 'weight' | 'measurements',
  dayOfWeek: number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  time: string, // HH:mm format
  message: string
) => {
  const settings = await getUserSettings(userId);
  if (!settings?.notificationsEnabled) {
    return;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const currentDay = now.getDay();
  
  // Calculate days until next reminder day
  let daysUntilReminder = dayOfWeek - currentDay;
  if (daysUntilReminder < 0) {
    daysUntilReminder += 7; // Next week
  } else if (daysUntilReminder === 0) {
    // Same day - check if time has passed
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    if (reminderTime <= now) {
      daysUntilReminder = 7; // Next week
    }
  }

  const reminderDate = new Date(now);
  reminderDate.setDate(now.getDate() + daysUntilReminder);
  reminderDate.setHours(hours, minutes, 0, 0);

  const delay = reminderDate.getTime() - now.getTime();

  setTimeout(() => {
    requestNotificationPermission().then(permission => {
      if (permission.granted) {
        showNotification('Weekly Reminder', {
          body: message,
          tag: `weekly-reminder-${type}`,
        });
        // Schedule next week's reminder
        scheduleWeeklyReminder(userId, type, dayOfWeek, time, message);
      }
    });
  }, delay);
};

// Setup weekly reminders
export const setupWeeklyReminders = async (userId: string) => {
  const settings = await getUserSettings(userId);
  if (!settings?.notificationsEnabled || !settings.weeklyReminders) {
    return;
  }

  if (settings.weeklyReminders.weight?.enabled) {
    scheduleWeeklyReminder(
      userId,
      'weight',
      settings.weeklyReminders.weight.dayOfWeek,
      settings.weeklyReminders.weight.time,
      "It's time to log your weight! 📊"
    );
  }

  if (settings.weeklyReminders.measurements?.enabled) {
    scheduleWeeklyReminder(
      userId,
      'measurements',
      settings.weeklyReminders.measurements.dayOfWeek,
      settings.weeklyReminders.measurements.time,
      "Don't forget to log your body measurements! 📏"
    );
  }
};

// Check if today is a reminder day
export const checkWeeklyReminder = (
  dayOfWeek: number,
  time: string
): boolean => {
  const now = new Date();
  const currentDay = now.getDay();
  const [hours, minutes] = time.split(':').map(Number);
  
  if (currentDay !== dayOfWeek) {
    return false;
  }

  // Check if we're past the reminder time today
  const reminderTime = new Date();
  reminderTime.setHours(hours, minutes, 0, 0);
  
  // Consider it a reminder day if we're within 2 hours of the reminder time
  const timeDiff = now.getTime() - reminderTime.getTime();
  return timeDiff >= 0 && timeDiff < 2 * 60 * 60 * 1000; // Within 2 hours
};

