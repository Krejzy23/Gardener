import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  cancelScheduledCareNotifications,
  getCareNotificationPermissionStatus,
  loadCareNotificationSettings,
  requestCareNotificationPermissions,
  saveCareNotificationSettings,
  scheduleCareNotifications,
} from '@/services/careNotificationService';
import { useI18n } from '@/i18n/I18nProvider';
import type { CareNotificationPermissionStatus, CareNotificationPreference } from '@/types/notifications';
import { usePlantCareData } from '@/hooks/usePlantCareData';

type CareNotificationsContextValue = {
  error: string | null;
  isLoading: boolean;
  isUpdating: boolean;
  permissionStatus: CareNotificationPermissionStatus;
  preference: CareNotificationPreference;
  scheduledCount: number;
  updatePreference: (preference: CareNotificationPreference) => Promise<void>;
};

const CareNotificationsContext = createContext<CareNotificationsContextValue | null>(null);

type CareNotificationsProviderProps = {
  children: ReactNode;
  ownerId: string;
};

export function CareNotificationsProvider({ children, ownerId }: CareNotificationsProviderProps) {
  const { language, t } = useI18n();
  const { calendarDays, dueToday, isLoading: isLoadingCareData, overdue } = usePlantCareData();
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<CareNotificationPermissionStatus>('undetermined');
  const [preference, setPreference] = useState<CareNotificationPreference>('off');
  const [scheduledCount, setScheduledCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoadingSettings(true);
      setError(null);

      try {
        const [settings, nextPermissionStatus] = await Promise.all([
          loadCareNotificationSettings(ownerId),
          getCareNotificationPermissionStatus(language),
        ]);

        if (!isMounted) {
          return;
        }

        setPreference(settings.preference);
        setPermissionStatus(nextPermissionStatus);
      } catch {
        if (isMounted) {
          setError(t('notifications.error.load'));
        }
      } finally {
        if (isMounted) {
          setIsLoadingSettings(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [language, ownerId, t]);

  useEffect(() => {
    let isMounted = true;

    async function syncScheduledNotifications() {
      if (isLoadingCareData || isLoadingSettings) {
        return;
      }

      try {
        if (preference === 'off' || permissionStatus !== 'granted') {
          await cancelScheduledCareNotifications(ownerId);

          if (isMounted) {
            setScheduledCount(0);
          }

          return;
        }

        const nextScheduledCount = await scheduleCareNotifications(ownerId, preference, calendarDays, [...overdue, ...dueToday], language);

        if (isMounted) {
          setScheduledCount(nextScheduledCount);
        }
      } catch {
        if (isMounted) {
          setError(t('notifications.error.schedule'));
          setScheduledCount(0);
        }
      }
    }

    void syncScheduledNotifications();

    return () => {
      isMounted = false;
    };
  }, [calendarDays, dueToday, isLoadingCareData, isLoadingSettings, language, ownerId, overdue, permissionStatus, preference, t]);

  useEffect(() => {
    return () => {
      void cancelScheduledCareNotifications(ownerId);
    };
  }, [ownerId]);

  const updatePreference = useCallback(
    async (nextPreference: CareNotificationPreference) => {
      setIsUpdating(true);
      setError(null);

      try {
        if (nextPreference === 'off') {
          await saveCareNotificationSettings(ownerId, 'off');
          await cancelScheduledCareNotifications(ownerId);
          setPreference('off');
          setScheduledCount(0);
          return;
        }

        const nextPermissionStatus = await requestCareNotificationPermissions(language);
        setPermissionStatus(nextPermissionStatus);

        if (nextPermissionStatus !== 'granted') {
          await saveCareNotificationSettings(ownerId, 'off');
          await cancelScheduledCareNotifications(ownerId);
          setPreference('off');
          setScheduledCount(0);
          setError(
            nextPermissionStatus === 'unavailable'
              ? t('notifications.error.unavailable')
              : t('notifications.error.denied'),
          );
          return;
        }

        await saveCareNotificationSettings(ownerId, nextPreference);
        setPreference(nextPreference);
      } catch {
        setError(t('notifications.error.update'));
      } finally {
        setIsUpdating(false);
      }
    },
    [language, ownerId, t],
  );

  const value = useMemo<CareNotificationsContextValue>(
    () => ({
      error,
      isLoading: isLoadingSettings,
      isUpdating,
      permissionStatus,
      preference,
      scheduledCount,
      updatePreference,
    }),
    [error, isLoadingSettings, isUpdating, permissionStatus, preference, scheduledCount, updatePreference],
  );

  return <CareNotificationsContext.Provider value={value}>{children}</CareNotificationsContext.Provider>;
}

export function useCareNotifications() {
  const context = useContext(CareNotificationsContext);

  if (!context) {
    throw new Error('useCareNotifications must be used inside CareNotificationsProvider');
  }

  return context;
}
