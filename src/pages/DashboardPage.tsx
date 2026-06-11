import { useMemo } from "react";
import { Text, View } from "react-native";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
} from "lucide-react-native";

import { CareTaskCard } from "@/components/CareTaskCard";
import { MetricCard } from "@/components/MetricCard";
import { Screen } from "@/components/Screen";
import { usePlantCareData } from "@/hooks/usePlantCareData";
import { useI18n } from "@/i18n/I18nProvider";
import { languageLocales } from "@/i18n/translations";
import { typography } from "@/styles/typography";
import { getDaysUntilDue } from "@/utils/careSchedule";
import MonsterraIcon from "assets/svg/monsterra.svg";
import Grass from "assets/svg/grass1.svg";

const sectionTone = {
  emerald: {
    chip: "bg-emerald-50 text-emerald-700",
    iconBackground: "bg-emerald-100",
    iconColor: "#047857",
  },
  amber: {
    chip: "bg-amber-50 text-amber-700",
    iconBackground: "bg-amber-100",
    iconColor: "#b45309",
  },
  rose: {
    chip: "bg-rose-50 text-rose-700",
    iconBackground: "bg-rose-100",
    iconColor: "#be123c",
  },
};

type DashboardSectionHeaderProps = {
  count: number;
  icon: typeof CalendarDays;
  subtitle: string;
  title: string;
  tone?: keyof typeof sectionTone;
};

function capitalizeFirst(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function DashboardSectionHeader({
  count,
  icon: Icon,
  subtitle,
  title,
  tone = "emerald",
}: DashboardSectionHeaderProps) {
  const toneClassName = sectionTone[tone];

  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1 flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-lg ${toneClassName.iconBackground}`}
        >
          <Icon color={toneClassName.iconColor} size={21} strokeWidth={2.3} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className={`${typography.sectionTitle} text-stone-950`}>
            {title}
          </Text>
          <Text className={`mt-0.5 ${typography.body} text-stone-500`}>
            {subtitle}
          </Text>
        </View>
      </View>
      <Text
        className={`rounded-md px-2 py-1 ${typography.chip} ${toneClassName.chip}`}
      >
        {count}
      </Text>
    </View>
  );
}

export function DashboardPage() {
  const { language, t } = useI18n();
  const { dueToday, error, isLoading, overdue, upcoming, completeCareTask } =
    usePlantCareData();
  const priorityTasks = [...overdue, ...dueToday];
  const upcomingSoon = useMemo(
    () => upcoming.filter((task) => getDaysUntilDue(task.nextDueAt) <= 7),
    [upcoming]
  );
  const currentDateLabel = useMemo(
    () =>
      capitalizeFirst(
        new Intl.DateTimeFormat(languageLocales[language], {
          day: "numeric",
          month: "long",
          weekday: "long",
        }).format(new Date())
      ),
    [language]
  );
  const visibleUpcoming = upcomingSoon.slice(0, 5);
  const hiddenUpcomingCount = Math.max(
    upcomingSoon.length - visibleUpcoming.length,
    0
  );

  return (
    <Screen>
      <View className="overflow-hidden rounded-lg bg-emerald-900 shadow-sm shadow-stone-300">
        <View className="h-1.5 bg-emerald-400" />
        <View className="gap-5 p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1">
              <Text className={`mt-1 ${typography.heroTitle} text-white pb-3`}>
                {t("dashboard.title")}
              </Text>
              <Text className={`${typography.label} text-green-200`}>
                {t("dashboard.currentDate")}
              </Text>
              <Text className={`mt-2 ${typography.body} text-stone-200`}>
                {currentDateLabel}
              </Text>
            </View>
            <MonsterraIcon width={100} height={100} />
          </View>
          <View className="gap-3">
            <View className="flex-row gap-5 pb-8">
              <MetricCard label={t("dashboard.metric.today")} value={dueToday.length} tone="green" />
              <MetricCard
                label={t("dashboard.metric.overdue")}
                value={overdue.length}
                tone="red"
              />
              <MetricCard
                label={t("dashboard.metric.week")}
                value={upcomingSoon.length}
                tone="amber"
              />
            </View>
          </View>
        </View>
        <View className="absolute -bottom-6" pointerEvents="none">
          <Grass width={400} height={80} preserveAspectRatio="none" />
        </View>
      </View>

      {error ? (
        <Text
          className={`rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 ${typography.empty} text-rose-700`}
        >
          {error}
        </Text>
      ) : null}

      <View className="gap-3">
        <DashboardSectionHeader
          count={priorityTasks.length}
          icon={overdue.length > 0 ? AlertTriangle : CheckCircle2}
          subtitle={
            overdue.length > 0
              ? t("dashboard.today.subtitleOverdue")
              : t("dashboard.today.subtitle")
          }
          title={t("dashboard.today.title")}
          tone={overdue.length > 0 ? "rose" : "emerald"}
        />
        {isLoading ? (
          <Text
            className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}
          >
            {t("dashboard.loading")}
          </Text>
        ) : null}
        {!isLoading && priorityTasks.length === 0 ? (
          <View className="flex-row items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-4">
            <CheckCircle2 color="#047857" size={22} strokeWidth={2.4} />
            <Text
              className={`min-w-0 flex-1 ${typography.bodyStrong} text-emerald-800`}
            >
              {t("dashboard.emptyToday")}
            </Text>
          </View>
        ) : null}
        {priorityTasks.map((task) => (
          <CareTaskCard
            key={task.id}
            onComplete={(taskId) => void completeCareTask(taskId)}
            task={task}
          />
        ))}
      </View>

      <View className="gap-3">
        <DashboardSectionHeader
          count={upcomingSoon.length}
          icon={Clock3}
          subtitle={t("dashboard.upcoming.subtitle")}
          title={t("dashboard.upcoming.title")}
          tone="amber"
        />
        {!isLoading && upcomingSoon.length === 0 ? (
          <View className="flex-row items-center gap-3 rounded-lg border border-stone-100 bg-white px-4 py-4">
            <CalendarDays color="#78716c" size={21} strokeWidth={2.3} />
            <Text
              className={`min-w-0 flex-1 ${typography.bodyStrong} text-stone-600`}
            >
              {t("dashboard.emptyUpcoming")}
            </Text>
          </View>
        ) : null}
        {visibleUpcoming.map((task) => (
          <CareTaskCard key={task.id} task={task} compact />
        ))}
        {hiddenUpcomingCount > 0 ? (
          <Text
            className={`rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-center ${typography.empty} text-amber-800`}
          >
            {t("dashboard.hiddenUpcoming", { count: hiddenUpcomingCount })}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
