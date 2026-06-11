import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type * as ExpoNotifications from 'expo-notifications';

import { translations, type LanguageCode, type TranslationKey, type TranslationParams } from '@/i18n/translations';
import type { CalendarAgendaDay, CalendarCareItem, CareTaskType, CareTaskWithPlant } from '@/types/plants';
import type { CareNotificationPermissionStatus, CareNotificationPreference, CareNotificationSettings } from '@/types/notifications';
import { careNotificationTimes } from '@/utils/careNotifications';
import { toDateKey } from '@/utils/date';

const CARE_NOTIFICATION_CHANNEL_ID = 'care-reminders';
const SCHEDULE_LOOKAHEAD_DAYS = 14;

type NotificationsModule = typeof import('expo-notifications');

let cachedNotificationsModule: NotificationsModule | null | undefined;

const notificationSettingsKey = (ownerId: string) => `gardener:care-notification-settings:${ownerId}`;
const scheduledNotificationIdsKey = (ownerId: string) => `gardener:care-notification-ids:${ownerId}`;

function isCareNotificationPreference(value: unknown): value is CareNotificationPreference {
  return value === 'off' || value === 'morning' || value === 'evening';
}

function isExpoGoRuntime(): boolean {
  return Constants.appOwnership === 'expo';
}

async function loadNotificationsModule(): Promise<NotificationsModule | null> {
  if (isExpoGoRuntime()) {
    return null;
  }

  if (cachedNotificationsModule !== undefined) {
    return cachedNotificationsModule;
  }

  try {
    cachedNotificationsModule = await import('expo-notifications');
    return cachedNotificationsModule;
  } catch {
    cachedNotificationsModule = null;
    return null;
  }
}

function normalizePermissionStatus(
  status: ExpoNotifications.NotificationPermissionsStatus,
  Notifications: NotificationsModule,
): CareNotificationPermissionStatus {
  const iosStatus = status.ios?.status;
  const isGranted =
    status.granted ||
    iosStatus === Notifications.IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === Notifications.IosAuthorizationStatus.EPHEMERAL;

  if (isGranted) {
    return 'granted';
  }

  return status.status === 'denied' ? 'denied' : 'undetermined';
}

function t(language: LanguageCode, key: TranslationKey, params?: TranslationParams): string {
  const value: string = translations[language][key] ?? translations.cs[key] ?? key;

  if (!params) {
    return value;
  }

  return Object.entries(params).reduce<string>(
    (result, [paramKey, paramValue]) => result.replaceAll(`{{${paramKey}}}`, String(paramValue)),
    value,
  );
}

function formatTaskWord(count: number, language: LanguageCode): string {
  if (count === 1) {
    return t(language, 'taskWord.one');
  }

  if (count >= 2 && count <= 4) {
    return t(language, 'taskWord.few');
  }

  return t(language, 'taskWord.many');
}

type NotificationCareTask = Pick<CalendarCareItem, 'task' | 'type'>;

function createNotificationBody(tasks: NotificationCareTask[], language: LanguageCode): string {
  const wateringCount = tasks.filter((item) => item.type === 'watering').length;
  const fertilizingCount = tasks.filter((item) => item.type === 'fertilizing').length;
  const taskParts: string[] = [];
  const plantNames = Array.from(new Set(tasks.map((item) => item.task.plant.name)));
  const visiblePlants = plantNames.slice(0, 3);

  if (wateringCount > 0) {
    taskParts.push(t(language, 'notifications.task.watering', { count: wateringCount }));
  }

  if (fertilizingCount > 0) {
    taskParts.push(t(language, 'notifications.task.fertilizing', { count: fertilizingCount }));
  }

  const remainingPlants = plantNames.length - visiblePlants.length;
  const plantSummary =
    remainingPlants > 0
      ? t(language, 'notifications.morePlants', { plants: visiblePlants.join(', '), count: remainingPlants })
      : visiblePlants.join(', ');

  return t(language, 'notifications.body', {
    count: tasks.length,
    taskParts: taskParts.join(', '),
    taskWord: formatTaskWord(tasks.length, language),
    plantSummary,
  });
}

function createNotificationIdentifier(ownerId: string, dateKey: string): string {
  return `gardener-care-${ownerId}-${dateKey}`;
}

function createTriggerDate(dayDate: Date | string, preference: Exclude<CareNotificationPreference, 'off'>): Date {
  const triggerDate = new Date(dayDate);
  const time = careNotificationTimes[preference];

  triggerDate.setHours(time.hour, time.minute, 0, 0);

  return triggerDate;
}

async function getScheduledNotificationIds(ownerId: string): Promise<string[]> {
  const rawValue = await AsyncStorage.getItem(scheduledNotificationIdsKey(ownerId));

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    return Array.isArray(parsedValue) ? parsedValue.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

async function saveScheduledNotificationIds(ownerId: string, notificationIds: string[]) {
  await AsyncStorage.setItem(scheduledNotificationIdsKey(ownerId), JSON.stringify(notificationIds));
}

export function configureCareNotificationHandler() {
  void loadNotificationsModule().then((Notifications) => {
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  });
}

export async function ensureCareNotificationChannel(language: LanguageCode = 'cs'): Promise<NotificationsModule | null> {
  const Notifications = await loadNotificationsModule();

  if (!Notifications) {
    return null;
  }

  if (Platform.OS !== 'android') {
    return Notifications;
  }

  await Notifications.setNotificationChannelAsync(CARE_NOTIFICATION_CHANNEL_ID, {
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#22c55e',
    name: t(language, 'notifications.channel'),
    vibrationPattern: [0, 220, 120, 220],
  });

  return Notifications;
}

export async function getCareNotificationPermissionStatus(language: LanguageCode = 'cs'): Promise<CareNotificationPermissionStatus> {
  const Notifications = await ensureCareNotificationChannel(language);

  if (!Notifications) {
    return 'unavailable';
  }

  return normalizePermissionStatus(await Notifications.getPermissionsAsync(), Notifications);
}

export async function requestCareNotificationPermissions(language: LanguageCode = 'cs'): Promise<CareNotificationPermissionStatus> {
  const Notifications = await ensureCareNotificationChannel(language);

  if (!Notifications) {
    return 'unavailable';
  }

  const currentStatus = await Notifications.getPermissionsAsync();

  if (normalizePermissionStatus(currentStatus, Notifications) === 'granted') {
    return 'granted';
  }

  return normalizePermissionStatus(
    await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    }),
    Notifications,
  );
}

export async function loadCareNotificationSettings(ownerId: string): Promise<CareNotificationSettings> {
  const rawValue = await AsyncStorage.getItem(notificationSettingsKey(ownerId));

  if (!rawValue) {
    return {
      preference: 'off',
    };
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<CareNotificationSettings>;

    return {
      preference: isCareNotificationPreference(parsedValue.preference) ? parsedValue.preference : 'off',
      updatedAt: typeof parsedValue.updatedAt === 'string' ? parsedValue.updatedAt : undefined,
    };
  } catch {
    return {
      preference: 'off',
    };
  }
}

export async function saveCareNotificationSettings(ownerId: string, preference: CareNotificationPreference) {
  await AsyncStorage.setItem(
    notificationSettingsKey(ownerId),
    JSON.stringify({
      preference,
      updatedAt: new Date().toISOString(),
    } satisfies CareNotificationSettings),
  );
}

export async function cancelScheduledCareNotifications(ownerId: string) {
  const notificationIds = await getScheduledNotificationIds(ownerId);
  const Notifications = await loadNotificationsModule();

  if (!Notifications) {
    await AsyncStorage.removeItem(scheduledNotificationIdsKey(ownerId));
    return;
  }

  await Promise.all(notificationIds.map((notificationId) => Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => undefined)));
  await AsyncStorage.removeItem(scheduledNotificationIdsKey(ownerId));
}

export async function scheduleCareNotifications(
  ownerId: string,
  preference: Exclude<CareNotificationPreference, 'off'>,
  calendarDays: CalendarAgendaDay[],
  todayTasks: CareTaskWithPlant[],
  language: LanguageCode,
  now = new Date(),
): Promise<number> {
  await cancelScheduledCareNotifications(ownerId);
  const Notifications = await ensureCareNotificationChannel(language);

  if (!Notifications) {
    return 0;
  }

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const scheduleEnd = new Date(todayStart);
  scheduleEnd.setDate(scheduleEnd.getDate() + SCHEDULE_LOOKAHEAD_DAYS);

  const scheduledNotificationIds: string[] = [];
  const todayKey = toDateKey(now);

  for (const day of calendarDays) {
    const dateKey = toDateKey(day.date);
    const activeTasks: NotificationCareTask[] =
      dateKey === todayKey && todayTasks.length > 0
        ? todayTasks.filter((task) => task.enabled).map((task) => ({ task, type: task.type }))
        : day.tasks.filter((item) => item.task.enabled);

    if (activeTasks.length === 0) {
      continue;
    }

    const triggerDate = createTriggerDate(day.date, preference);

    if (triggerDate <= now || triggerDate > scheduleEnd) {
      continue;
    }

    const taskTypes = Array.from(new Set(activeTasks.map((item) => item.type))) as CareTaskType[];
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        body: createNotificationBody(activeTasks, language),
        data: {
          date: dateKey,
          ownerId,
          taskTypes,
        },
        sound: true,
        title: t(language, 'notifications.title'),
      },
      identifier: createNotificationIdentifier(ownerId, dateKey),
      trigger: {
        channelId: CARE_NOTIFICATION_CHANNEL_ID,
        date: triggerDate,
        type: Notifications.SchedulableTriggerInputTypes.DATE,
      },
    });

    scheduledNotificationIds.push(notificationId);
  }

  await saveScheduledNotificationIds(ownerId, scheduledNotificationIds);

  return scheduledNotificationIds.length;
}
