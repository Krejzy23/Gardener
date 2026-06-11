import { CheckCircle2, Clock3, Droplets, Leaf } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import FertilizerIllustration from "assets/svg/fertilizer.svg";
import WateringIllustration from "assets/svg/watering.svg";
import type { CareTaskWithPlant } from "@/types/plants";
import { useI18n } from "@/i18n/I18nProvider";
import { formatDueDistance } from "@/utils/date";
import { typography } from "@/styles/typography";
import Grass from "assets/svg/grassLand.svg"
type CareTaskCardProps = {
  task: CareTaskWithPlant;
  compact?: boolean;
  onComplete?: (taskId: string) => void;
};

const taskTone = {
  watering: {
    action: "bg-blue-700 active:bg-blue-800",
    cardBackground: "bg-blue-100",
    chip: "bg-blue-200 text-blue-900",
    detail: "border-blue-200 bg-blue-50",
    icon: Droplets,
    iconBackground: "bg-blue-200",
    iconColor: "#0369a1",
    illustration: WateringIllustration,
    illustrationSize: 144,
  },
  fertilizing: {
    action: "bg-amber-700 active:bg-amber-800",
    cardBackground: "bg-amber-100",
    chip: "bg-amber-200 text-amber-900",
    detail: "border-amber-200 bg-amber-50",
    icon: Leaf,
    iconBackground: "bg-amber-200",
    iconColor: "#a16207",
    illustration: FertilizerIllustration,
    illustrationSize: 132,
  },
};

const statusTone = {
  overdue: {
    accent: "bg-rose-500",
    chip: "border-rose-100 bg-rose-50 text-rose-700",
    card: "border-rose-100",
  },
  due_today: {
    accent: "bg-emerald-500",
    chip: "border-emerald-100 bg-emerald-50 text-emerald-700",
    card: "border-emerald-100",
  },
  upcoming: {
    accent: "bg-amber-400",
    chip: "border-amber-100 bg-amber-50 text-amber-700",
    card: "border-stone-100",
  },
  disabled: {
    accent: "bg-stone-300",
    chip: "border-stone-100 bg-stone-50 text-stone-400",
    card: "border-stone-100",
  },
};

export function CareTaskCard({
  task,
  compact = false,
  onComplete,
}: CareTaskCardProps) {
  const { language, t } = useI18n();
  const tone = taskTone[task.type];
  const Icon = tone.icon;
  const Illustration = tone.illustration;
  const status = statusTone[task.status];
  const careDetail =
    task.type === "watering" ? task.plant.waterType : task.plant.fertilizerType;
  const careDetailLabel = task.type === "watering" ? t("plantCard.water") : t("plantCard.fertilizer");
  const canComplete = Boolean(
    onComplete && (task.status === "due_today" || task.status === "overdue")
  );

  return (
    <View
      className={`overflow-hidden rounded-lg border shadow-sm shadow-stone-200 ${tone.cardBackground} ${status.card}`}
    >
      <View className={`h-1.5 ${status.accent}`} />
      <View className="flex-row items-stretch gap-4 p-4">
        <View className="min-w-0 flex-1 gap-4">
          <View className="flex-row items-start gap-3">
            <View
              className={`h-12 w-12 items-center justify-center rounded-lg ${tone.iconBackground}`}
            >
              <Icon color={tone.iconColor} size={25} strokeWidth={2.3} />
            </View>
            <View className="min-w-0 flex-1">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text
                  className={`rounded-md px-2 py-1 ${typography.chip} ${tone.chip}`}
                >
                  {t(`care.task.${task.type}`)}
                </Text>
                <Text
                  className={`rounded-md border px-2 py-1 ${typography.chip} ${status.chip}`}
                >
                  {t(`care.status.${task.status}`)} ·{" "}
                  {formatDueDistance(task.nextDueAt, language)}
                </Text>
              </View>
              <Text
                className={`mt-2 ${typography.cardTitleLarge} text-stone-950`}
                numberOfLines={1}
              >
                {task.plant.name}
              </Text>
              <Text className={`mt-1 ${typography.body} text-stone-600`} numberOfLines={compact ? 1 : 2}>
                {t("interval.everyManyDays", { count: task.intervalDays })}
                {!compact && task.plant.notes ? ` · ${task.plant.notes}` : ""}
              </Text>
            </View>
          </View>

          {careDetail ? (
            <View className={`rounded-lg border px-3 py-3 ${tone.detail}`}>
              <Text className={`${typography.label} text-stone-500`}>
                {careDetailLabel}
              </Text>
              <Text className={`mt-1 ${typography.bodyStrong} text-stone-800`}>
                {careDetail}
              </Text>
            </View>
          ) : null}

          {canComplete ? (
            <Pressable
              className={`flex-row items-center justify-center gap-2 rounded-lg px-4 py-3 ${tone.action}`}
              onPress={() => onComplete?.(task.id)}
            >
              <CheckCircle2 color="#ffffff" size={19} strokeWidth={2.4} />
              <Text className={`${typography.bodyStrong} text-white `}>
                {t(`care.task.${task.type}Action`)} {t("care.doneSuffix")}
              </Text>
            </Pressable>
          ) : !compact ? (
            <View className="flex-row items-center gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2">
              <Clock3 color="#78716c" size={17} strokeWidth={2.3} />
              <Text className={`${typography.bodyStrong} text-stone-600`}>
                {task.status === "upcoming"
                  ? t("common.planned")
                  : t(`care.status.${task.status}`)}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          className={`items-center justify-center overflow-hidden ${
            compact ? "w-20" : "w-32"
          }`}
        >
          <Illustration
            width={
              compact ? tone.illustrationSize * 0.68 : tone.illustrationSize
            }
            height={
              compact ? tone.illustrationSize * 0.68 : tone.illustrationSize
            }
          />
        </View>
      </View>
      <View pointerEvents="none" className="absolute -bottom-8">
          <Grass width={400} height={80} preserveAspectRatio="none"/>
        </View>
    </View>
  );
}
