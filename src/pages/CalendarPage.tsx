import { useEffect, useMemo, useState } from "react";
import { Calendar, LocaleConfig, type DateData } from "react-native-calendars";
import { CalendarDays, Droplets, Leaf } from "lucide-react-native";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

import { CalendarCareItemCard } from "@/components/CalendarCareItemCard";
import { CalendarPatternBackground } from "@/components/CalendarPatternBackground";
import { PageHeader } from "@/components/PageHeader";
import { Screen } from "@/components/Screen";
import { useCareNotifications } from "@/hooks/useCareNotifications";
import { usePlantCareData } from "@/hooks/usePlantCareData";
import { useI18n } from "@/i18n/I18nProvider";
import { calendarLocales } from "@/i18n/translations";
import { typography } from "@/styles/typography";
import type { CareTaskType } from "@/types/plants";
import { formatCareNotificationTime } from "@/utils/careNotifications";
import { formatDayName, formatShortDate, toDateKey } from "@/utils/date";
import CalendarWine from "assets/svg/calendarWine.svg";
import Nest from "assets/svg/nest1.svg";
import GrassDiary from "assets/svg/grassDiary.svg";
import Butterflys from "assets/svg/butterflys.svg";

LocaleConfig.locales.cs = calendarLocales.cs;
LocaleConfig.locales.en = calendarLocales.en;

const careColors = {
  watering: "#0284c7",
  fertilizing: "#d97706",
};

type CalendarDayProps = {
  date?: DateData;
  state?: "selected" | "disabled" | "inactive" | "today" | "";
};

type CalendarDaySummary = Record<CareTaskType, number>;

export function CalendarPage() {
  const { language, t } = useI18n();
  const { width } = useWindowDimensions();
  const { calendarDays, completeCareTask, isLoading } = usePlantCareData();
  const { preference: notificationPreference } = useCareNotifications();
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const notificationTimeLabel = formatCareNotificationTime(
    notificationPreference,
    language
  );
  const selectedDay = calendarDays.find(
    (day) => toDateKey(day.date) === selectedDate
  );
  const selectedDaySummary = useMemo(() => {
    const wateringPlantIds = new Set(
      selectedDay?.tasks
        .filter((item) => item.type === "watering")
        .map((item) => item.task.plant.id)
    );
    const fertilizingPlantIds = new Set(
      selectedDay?.tasks
        .filter((item) => item.type === "fertilizing")
        .map((item) => item.task.plant.id)
    );

    return {
      watering: wateringPlantIds.size,
      fertilizing: fertilizingPlantIds.size,
    };
  }, [selectedDay]);
  const firstCalendarDay = calendarDays[0]?.date;
  const lastCalendarDay = calendarDays[calendarDays.length - 1]?.date;
  const daySummaries = useMemo(() => {
    const summaries: Record<string, CalendarDaySummary> = {};

    calendarDays.forEach((day) => {
      const key = toDateKey(day.date);
      const wateringPlantIds = new Set(
        day.tasks
          .filter((task) => task.type === "watering")
          .map((task) => task.task.plant.id)
      );
      const fertilizingPlantIds = new Set(
        day.tasks
          .filter((task) => task.type === "fertilizing")
          .map((task) => task.task.plant.id)
      );

      summaries[key] = {
        watering: wateringPlantIds.size,
        fertilizing: fertilizingPlantIds.size,
      };
    });

    return summaries;
  }, [calendarDays]);
  const calendarDayWidth = Math.max(42, Math.min(52, (width - 64) / 7));

  useEffect(() => {
    LocaleConfig.defaultLocale = language;
  }, [language]);

  function renderCalendarDay({ date, state }: CalendarDayProps) {
    if (!date) {
      return null;
    }

    const summary = daySummaries[date.dateString] ?? {
      watering: 0,
      fertilizing: 0,
    };
    const isSelected = date.dateString === selectedDate;
    const isDisabled = state === "disabled";
    const isToday = state === "today";
    const hasWatering = summary.watering > 0;
    const hasFertilizing = summary.fertilizing > 0;
    const hasCare = hasWatering || hasFertilizing;
    const borderClassName = isSelected
      ? "border-emerald-700 bg-emerald-700"
      : hasWatering && hasFertilizing
      ? "border-emerald-300 bg-emerald-50"
      : hasWatering
      ? "border-sky-300 bg-sky-50"
      : hasFertilizing
      ? "border-amber-300 bg-amber-50"
      : isToday
      ? "border-emerald-200 bg-white"
      : "border-transparent bg-transparent";
    const dateTextClassName = isSelected
      ? "text-white"
      : isDisabled
      ? "text-stone-300"
      : isToday
      ? "text-emerald-700"
      : "text-stone-800";
    const countTextClassName = isSelected ? "text-white" : "text-stone-700";

    return (
      <Pressable
        className={`h-16 items-center justify-center rounded-lg border px-1 ${borderClassName} ${
          isDisabled ? "opacity-40" : ""
        }`}
        disabled={isDisabled}
        onPress={() => setSelectedDate(date.dateString)}
        style={{ width: calendarDayWidth }}
      >
        <Text className={`${typography.button} ${dateTextClassName}`}>
          {date.day}
        </Text>
        {hasCare ? (
          <View className="mt-1 gap-0.5">
            {hasWatering ? (
              <View className="flex-row items-center justify-center gap-0.5">
                <Droplets
                  color={isSelected ? "#ffffff" : careColors.watering}
                  size={10}
                  strokeWidth={2.4}
                />
                <Text className={`${typography.chip} ${countTextClassName}`}>
                  {summary.watering}
                </Text>
              </View>
            ) : null}
            {hasFertilizing ? (
              <View className="flex-row items-center justify-center gap-0.5">
                <Leaf
                  color={isSelected ? "#ffffff" : careColors.fertilizing}
                  size={10}
                  strokeWidth={2.4}
                />
                <Text className={`${typography.chip} ${countTextClassName}`}>
                  {summary.fertilizing}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="mt-1 h-5" />
        )}
      </Pressable>
    );
  }

  return (
    <Screen>
      <PageHeader eyebrow={t("calendar.eyebrow")} title={t("calendar.title")} />

      <View className="overflow-hidden rounded-lg border border-orange-200 bg-white p-3 shadow-sm shadow-orange-200">
        <CalendarPatternBackground
          backgroundOpacity={0.08}
          brickStrokeOpacity={0.1}
        />
        <Calendar
          current={selectedDate}
          dayComponent={renderCalendarDay}
          enableSwipeMonths
          firstDay={1}
          hideExtraDays
          maxDate={lastCalendarDay ? toDateKey(lastCalendarDay) : undefined}
          minDate={firstCalendarDay ? toDateKey(firstCalendarDay) : undefined}
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          theme={{
            arrowColor: "#065f46",
            calendarBackground: "transparent",
            dayTextColor: "#292524",
            monthTextColor: "#1c1917",
            selectedDayBackgroundColor: "#065f46",
            selectedDayTextColor: "#ffffff",
            textDayFontSize: 15,
            textDayHeaderFontSize: 12,
            textMonthFontWeight: "700",
            textSectionTitleColor: "#78716c",
            todayTextColor: "#065f46",
          }}
        />

        <View className="mt-3 flex-row gap-3 pt-3">
          <View className="flex-row items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
            <Droplets color={careColors.watering} size={17} strokeWidth={2.3} />
            <Text className={`${typography.bodyStrong} text-stone-600`}>
              {t("calendar.watering")}
            </Text>
          </View>
          <View className="flex-row items-center gap-2 rounded-lg bg-white/70 px-3 py-2">
            <Leaf color={careColors.fertilizing} size={17} strokeWidth={2.3} />
            <Text className={`${typography.bodyStrong} text-stone-600`}>
              {t("calendar.fertilizing")}
            </Text>
          </View>
          <View className="absolute -top-5 right-0" pointerEvents="none">
            <Butterflys height={90} width={90} />
          </View>
        </View>
      </View>

      <View className="gap-4">
        <View className="gap-4 rounded-lg border border-stone-100 bg-emerald-800 p-4 shadow-sm shadow-stone-200">
          <View
            className="absolute -top-24 left-0 right-0 overflow-hidden"
            pointerEvents="none"
            style={{ height: 150 }}
          >
            <GrassDiary preserveAspectRatio="none" width="100%" height={150} />
          </View>
          <View className="flex-row items-center justify-between gap-3">
            <View>
              <Text
                className={`${typography.cardTitle} capitalize text-stone-100`}
              >
                {selectedDay
                  ? formatDayName(selectedDay.date, language)
                  : formatDayName(selectedDate, language)}
              </Text>
              <Text className={`${typography.body} text-stone-200`}>
                {selectedDay
                  ? formatShortDate(selectedDay.date, language)
                  : formatShortDate(selectedDate, language)}
              </Text>
            </View>
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CalendarDays color="#065f46" size={21} strokeWidth={2.2} />
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Droplets
                  color={careColors.watering}
                  size={16}
                  strokeWidth={2.3}
                />
                <Text className={`${typography.label} text-sky-800`}>
                  {t("calendar.watering")}
                </Text>
              </View>
              <Text className={`mt-1 ${typography.sectionTitle} text-sky-900`}>
                {selectedDaySummary.watering}
              </Text>
            </View>
            <View className="flex-1 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
              <View className="flex-row items-center gap-2">
                <Leaf
                  color={careColors.fertilizing}
                  size={16}
                  strokeWidth={2.3}
                />
                <Text className={`${typography.label} text-amber-800`}>
                  {t("calendar.fertilizing")}
                </Text>
              </View>
              <Text
                className={`mt-1 ${typography.sectionTitle} text-amber-900`}
              >
                {selectedDaySummary.fertilizing}
              </Text>
            </View>
          </View>
        </View>

        {selectedDay && selectedDay.tasks.length > 0 ? (
          <View className="gap-3">
            {selectedDay.tasks.map((item) => (
              <CalendarCareItemCard
                key={item.id}
                item={item}
                notificationTimeLabel={notificationTimeLabel}
                onComplete={(taskId) => void completeCareTask(taskId)}
              />
            ))}
          </View>
        ) : isLoading ? (
          <Text
            className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}
          >
            {t("calendar.loading")}
          </Text>
        ) : (
          <Text
            className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}
          >
            {t("calendar.emptyDay")}
          </Text>
        )}
      </View>
      <View
        className="absolute top-20 -left-10"
        style={{
          transform: [{ rotate: "90deg" }],
        }}
        pointerEvents="none"
      >
        <CalendarWine width={250} height={250} />
      </View>
      <View className="absolute -top-24 -right-8" pointerEvents="none">
        <Nest width={300} height={300} />
      </View>
    </Screen>
  );
}
