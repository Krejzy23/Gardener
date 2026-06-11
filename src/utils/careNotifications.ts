import type { LanguageCode } from "@/i18n/translations";
import type { CareNotificationPreference } from "@/types/notifications";

export const careNotificationTimes: Record<
  Exclude<CareNotificationPreference, "off">,
  { hour: number; minute: number }
> = {
  morning: {
    hour: 8,
    minute: 0,
  },
  evening: {
    hour: 18,
    minute: 0,
  },
};

export function formatCareNotificationTime(
  preference: CareNotificationPreference,
  language: LanguageCode = "cs"
): string {
  if (preference === "off") {
    return language === "en" ? "Off" : "Vypnuto";
  }

  const time = careNotificationTimes[preference];

  return `${time.hour}:${String(time.minute).padStart(2, "0")}`;
}
