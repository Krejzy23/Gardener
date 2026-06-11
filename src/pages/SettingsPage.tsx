import { useState } from "react";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  Database,
  Globe2,
  LockKeyhole,
  LogOut,
  Mail,
  Moon,
  ShieldCheck,
  Smartphone,
  Sunrise,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/hooks/useAuth";
import { useCareNotifications } from "@/hooks/useCareNotifications";
import { useI18n } from "@/i18n/I18nProvider";
import {
  languageNames,
  supportedLanguages,
  type LanguageCode,
} from "@/i18n/translations";
import { typography } from "@/styles/typography";
import type {
  CareNotificationPermissionStatus,
  CareNotificationPreference,
} from "@/types/notifications";
import { formatCareNotificationTime } from "@/utils/careNotifications";
import SettingsBirds from "assets/svg/settingsBirds.svg";

type NotificationOption = {
  description: string;
  icon: typeof Bell;
  label: string;
  tone: string;
  value: CareNotificationPreference;
};

function formatScheduledCount(
  count: number,
  t: ReturnType<typeof useI18n>["t"]
): string {
  if (count === 1) {
    return t("scheduledDays.one");
  }

  if (count >= 2 && count <= 4) {
    return t("scheduledDays.few", { count });
  }

  return t("scheduledDays.many", { count });
}

function getNotificationStatusTone(
  permissionStatus: CareNotificationPermissionStatus,
  preference: CareNotificationPreference
): string {
  if (preference === "off") {
    return "bg-stone-100 text-stone-700";
  }

  if (permissionStatus === "granted") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (permissionStatus === "unavailable") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-rose-50 text-rose-700";
}

export function SettingsPage() {
  const { deviceLanguage, language, setLanguage, t } = useI18n();
  const { signOut, user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const {
    error,
    isLoading,
    isUpdating,
    permissionStatus,
    preference,
    scheduledCount,
    updatePreference,
  } = useCareNotifications();
  const isNotificationBusy = isLoading || isUpdating;
  const settingsItems = [
    {
      icon: ShieldCheck,
      title: t("settings.info.auth"),
      value: t("settings.info.authValue"),
    },
    {
      icon: Database,
      title: t("settings.info.firestore"),
      value: t("settings.info.firestoreValue"),
    },
    {
      icon: Smartphone,
      title: t("settings.info.build"),
      value: t("settings.info.buildValue"),
    },
  ];
  const notificationOptions: NotificationOption[] = [
    {
      description: t("settings.notification.offDescription"),
      icon: BellOff,
      label: t("common.off"),
      tone: "border-stone-200 bg-stone-50",
      value: "off",
    },
    {
      description: t("settings.notification.everyDayAt", {
        time: formatCareNotificationTime("morning", language),
      }),
      icon: Sunrise,
      label: t("settings.notification.morning"),
      tone: "border-sky-200 bg-sky-50",
      value: "morning",
    },
    {
      description: t("settings.notification.everyDayAt", {
        time: formatCareNotificationTime("evening", language),
      }),
      icon: Moon,
      label: t("settings.notification.evening"),
      tone: "border-amber-200 bg-amber-50",
      value: "evening",
    },
  ];
  const notificationStatusText =
    isLoading
      ? t("settings.notification.loading")
      : isUpdating
      ? t("settings.notification.saving")
      : preference === "off"
      ? t("common.off")
      : permissionStatus === "unavailable"
      ? t("settings.notification.previewOnly")
      : permissionStatus === "granted"
      ? scheduledCount > 0
        ? formatScheduledCount(scheduledCount, t)
        : t("settings.notification.enabledNoTasks")
      : t("settings.notification.waitingPermission");
  const notificationStatusTone = getNotificationStatusTone(
    permissionStatus,
    preference
  );

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Screen>
      <PageHeader eyebrow={t("settings.eyebrow")} title={t("settings.title")} />
      <View
        className="absolute -top-12 right-0"
        pointerEvents="none"
        style={{ transform: [{ scaleX: -1 }] }}
      >
        <SettingsBirds width={220} height={200} />
      </View>
      <View className="overflow-hidden rounded-lg border border-emerald-100 bg-emerald-950 shadow-sm shadow-emerald-200">
        <View className="gap-4 p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-lg bg-white/10">
              <LockKeyhole color="#bbf7d0" size={23} strokeWidth={2.3} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className={`${typography.label} text-emerald-100/80`}>
                {t("settings.account")}
              </Text>
              <Text
                className={`mt-1 ${typography.cardTitle} text-white`}
                numberOfLines={1}
              >
                {user?.email ?? t("settings.signedUser")}
              </Text>
              <View className="mt-3 flex-row items-center gap-2 rounded-lg bg-white/10 px-3 py-2">
                <Mail color="#bbf7d0" size={16} strokeWidth={2.3} />
                <Text
                  className={`min-w-0 flex-1 ${typography.caption} text-emerald-50/90`}
                  numberOfLines={1}
                >
                  UID: {user?.uid}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <Pressable
          className="flex-row items-center justify-center gap-2 border-t border-white/10 bg-white/10 px-4 py-4 active:bg-white/15"
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
        >
          {isSigningOut ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <LogOut color="#ffffff" size={19} strokeWidth={2.4} />
              <Text className={`${typography.button} text-white`}>
                {t("settings.signOut")}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      <View className="gap-4 rounded-lg border border-stone-100 bg-white p-4 shadow-sm shadow-stone-200">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
            <Bell color="#047857" size={22} strokeWidth={2.2} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className={`${typography.cardTitle} text-stone-950`}>
              {t("settings.notifications")}
            </Text>
            <Text className={`mt-1 ${typography.body} text-stone-600`}>
              {t("settings.notificationsDescription")}
            </Text>
            <Text
              className={`mt-2 self-start rounded-md px-2 py-1 ${typography.chip} ${notificationStatusTone}`}
            >
              {notificationStatusText}
            </Text>
          </View>
        </View>

        <View className="gap-2">
          {notificationOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = preference === option.value;
            const isUnavailableOption =
              permissionStatus === "unavailable" && option.value !== "off";
            const isDisabled = isNotificationBusy || isUnavailableOption;

            return (
              <Pressable
                className={`flex-row items-center gap-3 rounded-lg border p-3 active:opacity-90 ${
                  isSelected ? option.tone : "border-stone-100 bg-stone-50"
                } ${isDisabled ? "opacity-60" : ""}`}
                disabled={isDisabled}
                key={option.value}
                onPress={() => void updatePreference(option.value)}
              >
                <View
                  className={`h-10 w-10 items-center justify-center rounded-lg ${
                    isSelected ? "bg-white/80" : "bg-white"
                  }`}
                >
                  <Icon
                    color={isSelected ? "#047857" : "#78716c"}
                    size={20}
                    strokeWidth={2.3}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className={`${typography.bodyStrong} text-stone-900`}>
                    {option.label}
                  </Text>
                  <Text className={`${typography.caption} text-stone-500`}>
                    {option.description}
                  </Text>
                </View>
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-emerald-700 bg-emerald-700"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 color="#ffffff" size={13} strokeWidth={3} />
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        {error ? (
          <View className="flex-row items-start gap-2 rounded-lg bg-rose-50 px-3 py-2">
            <AlertCircle color="#be123c" size={17} strokeWidth={2.3} />
            <Text className={`min-w-0 flex-1 ${typography.empty} text-rose-700`}>
              {error}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="gap-4 rounded-lg border border-stone-100 bg-white p-4 shadow-sm shadow-stone-200">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
            <Globe2 color="#047857" size={22} strokeWidth={2.2} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className={`${typography.cardTitle} text-stone-950`}>
              {t("settings.language")}
            </Text>
            <Text className={`mt-1 ${typography.body} text-stone-600`}>
              {t("settings.languageDescription")}
            </Text>
            <Text
              className={`mt-2 self-start rounded-md bg-stone-100 px-2 py-1 ${typography.chip} text-stone-600`}
            >
              {t("settings.languageDevice")}: {languageNames[deviceLanguage]}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          {supportedLanguages.map((option: LanguageCode) => {
            const isSelected = language === option;

            return (
              <Pressable
                className={`flex-1 items-center rounded-lg border px-3 py-3 active:opacity-90 ${
                  isSelected
                    ? "border-emerald-700 bg-emerald-700"
                    : "border-stone-100 bg-stone-50"
                }`}
                key={option}
                onPress={() => void setLanguage(option)}
              >
                <Text
                  className={`${typography.bodyStrong} ${
                    isSelected ? "text-white" : "text-stone-700"
                  }`}
                >
                  {languageNames[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <View
              key={item.title}
              className="flex-row items-center gap-3 rounded-lg border border-stone-100 bg-white p-4 shadow-sm shadow-stone-200"
            >
              <View className="h-11 w-11 items-center justify-center rounded-lg bg-emerald-50">
                <Icon color="#047857" size={22} strokeWidth={2.2} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className={`${typography.cardTitle} text-stone-950`}>
                  {item.title}
                </Text>
                <Text className={`mt-1 ${typography.body} text-stone-600`}>
                  {item.value}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
