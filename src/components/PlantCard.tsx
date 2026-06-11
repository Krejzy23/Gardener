import {
  CalendarDays,
  Droplets,
  HeartPulse,
  Leaf,
  MapPin,
  Pencil,
  Sprout,
  Trash2,
} from "lucide-react-native";
import {
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

import type { CareTaskType, CareTaskWithPlant, Plant } from "@/types/plants";
import { useI18n } from "@/i18n/I18nProvider";
import { typography } from "@/styles/typography";
import { formatDueDistance } from "@/utils/date";
import { getPlantHealthVisual } from "@/utils/plantHealth";
import { getPlantCategoryVisual } from "@/utils/plantVisuals";
import { formatPlantCount } from "@/utils/plantCount";

type PlantCardProps = {
  isDeleting?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  onPress?: () => void;
  plant: Plant;
  tasks: CareTaskWithPlant[];
};

const taskMeta: Record<
  CareTaskType,
  {
    chip: string;
    icon: typeof Droplets;
    iconColor: string;
    row: string;
  }
> = {
  watering: {
    chip: "bg-sky-100 text-sky-800",
    icon: Droplets,
    iconColor: "#0369a1",
    row: "border-sky-100 bg-sky-50",
  },
  fertilizing: {
    chip: "bg-amber-100 text-amber-800",
    icon: Leaf,
    iconColor: "#a16207",
    row: "border-amber-100 bg-amber-50",
  },
};

function stopCardPress(event: GestureResponderEvent) {
  event.stopPropagation();
}

export function PlantCard({
  isDeleting = false,
  onDelete,
  onEdit,
  onPress,
  plant,
  tasks,
}: PlantCardProps) {
  const { language, t } = useI18n();
  const sortedTasks = [...tasks].sort(
    (firstTask, secondTask) =>
      new Date(firstTask.nextDueAt).getTime() -
      new Date(secondTask.nextDueAt).getTime()
  );
  const hasCareDetails = Boolean(plant.waterType || plant.fertilizerType);
  const categoryVisual = getPlantCategoryVisual(plant.category);
  const healthVisual = getPlantHealthVisual(plant.health);
  const CategoryIllustration = categoryVisual.Illustration;

  return (
    <Pressable
      className={`overflow-hidden rounded-lg border shadow-sm shadow-stone-200 active:opacity-90 ${categoryVisual.background} ${categoryVisual.border}`}
      disabled={!onPress}
      onPress={onPress}
    >
      <View className={`h-1.5 ${categoryVisual.accent}`} />

      <View className="gap-4 p-4">
        <View className="flex-row items-start gap-4">
          <View className="min-w-0 flex-1 gap-4">
            <View className="min-w-0 flex-1 pt-1">
              <Text
                className={`${typography.cardTitleLarge} text-stone-950`}
                numberOfLines={1}
              >
                {plant.name}
              </Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                <Text
                  className={`rounded-md px-2 py-1 ${typography.chip} ${categoryVisual.chip}`}
                >
                  {t(`plant.category.${plant.category}`)}
                </Text>
                <Text
                  className={`rounded-md bg-white/60 px-2 py-1 ${typography.chip} text-stone-700`}
                >
                  {t(`plant.environment.${plant.environment}`)}
                </Text>
              </View>
            </View>

            <View className="w-full flex-row flex-wrap gap-2">
              <View
                className="min-w-0 flex-grow flex-row items-center gap-2 rounded-lg border border-white/60 bg-white/60 px-3 py-2"
                style={{ flexBasis: "40%" }}
              >
                <HeartPulse
                  color={healthVisual.iconColor}
                  size={15}
                  strokeWidth={2.3}
                />
                <Text
                  className={`min-w-0 flex-1 ${typography.bodyStrong} text-stone-700`}
                  numberOfLines={1}
                >
                  {t(`plant.health.${plant.health}`)}
                </Text>
              </View>

              <View
                className="min-w-0 flex-grow flex-row items-center gap-2 rounded-lg border border-white/60 bg-white/60 px-3 py-2"
                style={{ flexBasis: "40%" }}
              >
                <MapPin size={15} strokeWidth={2.3} />
                <Text
                  className={`min-w-0 flex-1 ${typography.bodyStrong} text-stone-700`}
                  numberOfLines={1}
                >
                  {t(`plant.light.${plant.light}`)}
                </Text>
              </View>

              <View
                className="min-w-0 flex-grow flex-row items-center gap-2 rounded-lg border border-white/60 bg-white/60 px-3 py-2"
                style={{ flexBasis: "40%" }}
              >
                <Sprout color="#047857" size={15} strokeWidth={2.3} />
                <Text
                  className={`min-w-0 flex-1 ${typography.bodyStrong} text-stone-700`}
                  numberOfLines={1}
                >
                  {formatPlantCount(plant.plantCount, language)}
                </Text>
              </View>
              {plant.age ? (
                <View
                  className="min-w-0 flex-grow flex-row items-center gap-2 rounded-lg border border-white/60 bg-white/60 px-3 py-2"
                  style={{ flexBasis: "40%" }}
                >
                  <CalendarDays color="#78716c" size={15} strokeWidth={2.3} />
                  <Text
                    className={`min-w-0 flex-1 ${typography.bodyStrong} text-stone-700`}
                    numberOfLines={1}
                  >
                    {plant.age}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View
            className="h-28 w-24 shrink-0 items-center justify-center overflow-hidden"
            pointerEvents="none"
          >
            <CategoryIllustration width={105} height={105} />
          </View>
        </View>

        {hasCareDetails ? (
          <View className="gap-2 rounded-lg border border-white/60 bg-white/60 p-3">
            <Text className={`${typography.label} text-stone-500`}>
              {t("plantCard.preferredCare")}
            </Text>
            {plant.waterType ? (
              <View className="flex-row items-center gap-2">
                <Droplets color="#0369a1" size={15} strokeWidth={2.3} />
                <Text
                  className={`min-w-0 flex-1 ${typography.body} text-stone-700`}
                >
                  {t("plantCard.water")}: {plant.waterType}
                </Text>
              </View>
            ) : null}
            {plant.fertilizerType ? (
              <View className="flex-row items-center gap-2">
                <Leaf color="#a16207" size={15} strokeWidth={2.3} />
                <Text
                  className={`min-w-0 flex-1 ${typography.body} text-stone-700`}
                >
                  {t("plantCard.fertilizer")}: {plant.fertilizerType}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View className="gap-2">
          <View className="flex-row items-center justify-between gap-3">
            <Text className={`${typography.label} text-stone-500`}>
              {t("plantCard.nextCare")}
            </Text>
            <Text
              className={`rounded-md bg-white/60 px-2 py-1 ${typography.chip} text-stone-600`}
            >
              {sortedTasks.length}
            </Text>
          </View>

          {sortedTasks.length === 0 ? (
            <Text
              className={`rounded-lg border border-white/60 bg-white/60 px-3 py-3 ${typography.empty} text-stone-500`}
            >
              {t("plantCard.noCare")}
            </Text>
          ) : null}

          {sortedTasks.map((task) => {
            const meta = taskMeta[task.type];
            const Icon = meta.icon;

            return (
              <View
                key={task.id}
                className={`flex-row items-center justify-between gap-3 rounded-lg border px-3 py-3 ${meta.row}`}
              >
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <Icon color={meta.iconColor} size={17} strokeWidth={2.3} />
                  <View className="min-w-0 flex-1">
                    <Text
                      className={`self-start rounded-md px-2 py-1 ${typography.chip} ${meta.chip}`}
                    >
                      {t(`care.task.${task.type}`)}
                    </Text>
                    <Text
                      className={`mt-1 ${typography.caption} text-stone-500`}
                    >
                      {t("interval.everyManyDays", { count: task.intervalDays })}
                    </Text>
                  </View>
                </View>
                <Text
                  className={`rounded-md bg-white px-2 py-1 ${typography.chip} text-stone-700`}
                >
                  {formatDueDistance(task.nextDueAt, language)}
                </Text>
              </View>
            );
          })}
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable
            className="min-w-0 flex-1 items-center justify-center rounded-lg bg-white/70 px-4 py-3 active:bg-white"
            disabled={!onEdit}
            onPress={(event) => {
              stopCardPress(event);
              onEdit?.();
            }}
          >
            <View className="flex-row items-center justify-center gap-1">
              <Pencil color="#57534e" size={18} strokeWidth={2.3} />
              <Text className={`${typography.caption} text-stone-500`}>
                {t("plantCard.edit")}
              </Text>
            </View>
          </Pressable>
          <Pressable
            className="min-w-0 flex-1 items-center justify-center rounded-lg bg-rose-50 px-4 py-3 active:bg-rose-100"
            disabled={!onDelete || isDeleting}
            onPress={(event) => {
              stopCardPress(event);
              onDelete?.();
            }}
          >
            <View className="flex-row items-center justify-center gap-1">
              <Trash2 color="#be123c" size={18} strokeWidth={2.3} />
              <Text className={`${typography.caption} text-red-500`}>
                {t("common.delete")}
              </Text>
            </View>
          </Pressable>
        </View>

        {isDeleting ? (
          <Text
            className={`rounded-lg bg-rose-50 px-3 py-2 ${typography.empty} text-rose-700`}
          >
            {t("plantCard.deleting")}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}
