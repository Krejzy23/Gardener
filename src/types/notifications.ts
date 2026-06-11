export type CareNotificationPreference = 'off' | 'morning' | 'evening';

export type CareNotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export type CareNotificationSettings = {
  preference: CareNotificationPreference;
  updatedAt?: string;
};
