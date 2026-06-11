import { useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplets,
  HeartPulse,
  Leaf,
  MapPin,
  Pencil,
  Sprout,
  Trash2,
} from "lucide-react-native";

import { AddPlantForm } from "@/components/AddPlantForm";
import { CareTaskCard } from "@/components/CareTaskCard";
import { Screen } from "@/components/Screen";
import { useCareNotifications } from "@/hooks/useCareNotifications";
import { usePlantCareData } from "@/hooks/usePlantCareData";
import { useI18n } from "@/i18n/I18nProvider";
import { languageLocales } from "@/i18n/translations";
import { typography } from "@/styles/typography";
import type { DiaryStackParamList } from "@/types/navigation";
import type { CareTaskType } from "@/types/plants";
import { formatDueDistance, formatShortDate } from "@/utils/date";
import { formatCareNotificationTime } from "@/utils/careNotifications";
import { getPlantHealthVisual } from "@/utils/plantHealth";
import { getPlantCategoryVisual } from "@/utils/plantVisuals";
import { formatPlantCount } from "@/utils/plantCount";



const careIcons: Record<CareTaskType, typeof Droplets> = {
  watering: Droplets,
  fertilizing: Leaf,
};

const careTone: Record<
  CareTaskType,
  {
    accent: string;
    border: string;
    chip: string;
    iconBackground: string;
    iconColor: string;
    panel: string;
  }
> = {
  watering: {
    accent: "bg-sky-500",
    border: "border-sky-100",
    chip: "bg-sky-100 text-sky-800",
    iconBackground: "bg-sky-100",
    iconColor: "#0369a1",
    panel: "bg-sky-50",
  },
  fertilizing: {
    accent: "bg-amber-500",
    border: "border-amber-100",
    chip: "bg-amber-100 text-amber-800",
    iconBackground: "bg-amber-100",
    iconColor: "#a16207",
    panel: "bg-amber-50",
  },
};

function formatInterval(
  days: number,
  t: ReturnType<typeof useI18n>["t"]
): string {
  if (days === 1) {
    return t("interval.everyDay");
  }

  if (days >= 2 && days <= 4) {
    return t("interval.everyFewDays", { count: days });
  }

  return t("interval.everyManyDays", { count: days });
}

type DetailTileProps = {
  icon: typeof Leaf;
  iconColor: string;
  label: string;
  value: string;
};

function DetailTile({ icon: Icon, iconColor, label, value }: DetailTileProps) {
  return (
    <View
      className="flex-grow gap-3 rounded-lg border border-stone-100 bg-white p-3 shadow-sm shadow-stone-200"
      style={{ flexBasis: "47%" }}
    >
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-stone-50">
          <Icon color={iconColor} size={18} strokeWidth={2.3} />
        </View>
        <Text className={`min-w-0 flex-1 ${typography.label} text-stone-500`}>
          {label}
        </Text>
      </View>
      <Text
        className={`${typography.bodyStrong} text-stone-900`}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export function PlantDetailPage() {
  const { language, t } = useI18n();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<DiaryStackParamList, "PlantDetail">
    >();
  const route = useRoute<RouteProp<DiaryStackParamList, "PlantDetail">>();
  const {
    careEvents,
    careTasks,
    completeCareTask,
    deletePlant,
    plants,
    updatePlant,
  } = usePlantCareData();
  const { preference: notificationPreference } = useCareNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const plant = plants.find((item) => item.id === route.params.plantId);
  const plantTasks = careTasks.filter(
    (task) => task.plantId === route.params.plantId
  );
  const sortedPlantTasks = useMemo(
    () =>
      [...plantTasks].sort(
        (firstTask, secondTask) =>
          new Date(firstTask.nextDueAt).getTime() -
          new Date(secondTask.nextDueAt).getTime()
      ),
    [plantTasks]
  );
  const nextTask = sortedPlantTasks.find((task) => task.status !== "disabled");
  const currentTasks = sortedPlantTasks.filter(
    (task) => task.status === "overdue" || task.status === "due_today"
  );
  const plantCareHistory = useMemo(
    () =>
      careEvents
        .filter((event) => event.plantId === route.params.plantId)
        .sort(
          (firstEvent, secondEvent) =>
            new Date(secondEvent.completedAt).getTime() -
            new Date(firstEvent.completedAt).getTime()
        ),
    [careEvents, route.params.plantId]
  );
  const visibleCareHistory = plantCareHistory.slice(0, 12);
  const notificationTimeLabel = formatCareNotificationTime(
    notificationPreference,
    language
  );
  const historyDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(languageLocales[language], {
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        year: "numeric",
      }),
    [language]
  );

  function confirmDeletePlant() {
    if (!plant) {
      return;
    }

    Alert.alert(
      t("diary.deleteTitle"),
      t("diary.deleteMessage", { name: plant.name }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);

            try {
              await deletePlant(plant.id);
              navigation.goBack();
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }

  if (!plant) {
    return (
      <Screen>
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-lg border border-stone-100 bg-white active:bg-stone-100"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#292524" size={22} strokeWidth={2.4} />
        </Pressable>
        <Text
          className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}
        >
          {t("plantDetail.notFound")}
        </Text>
      </Screen>
    );
  }

  const categoryVisual = getPlantCategoryVisual(plant.category);
  const healthVisual = getPlantHealthVisual(plant.health);
  const CategoryIllustration = categoryVisual.Illustration;

  return (
    <Screen>
      <View className="flex-row items-center justify-between gap-3">
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-lg border border-stone-100 bg-white shadow-sm shadow-stone-200 active:bg-stone-100"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#292524" size={22} strokeWidth={2.4} />
        </Pressable>
        <View className="flex-row gap-2">
          <Pressable
            className={`h-11 w-11 items-center justify-center rounded-lg border shadow-sm shadow-stone-200 active:bg-stone-100 ${
              isEditing
                ? "border-emerald-200 bg-emerald-50"
                : "border-stone-100 bg-white"
            }`}
            onPress={() => setIsEditing((current) => !current)}
          >
            <Pencil
              color={isEditing ? "#047857" : "#57534e"}
              size={20}
              strokeWidth={2.3}
            />
          </Pressable>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-lg bg-rose-50 shadow-sm shadow-rose-100 active:bg-rose-100"
            disabled={isDeleting}
            onPress={confirmDeletePlant}
          >
            <Trash2 color="#be123c" size={20} strokeWidth={2.3} />
          </Pressable>
        </View>
      </View>

      <View
        className={`overflow-hidden rounded-lg border shadow-sm shadow-stone-200 ${categoryVisual.background} ${categoryVisual.border}`}
      >
        <View className={`h-1.5 ${categoryVisual.accent}`} />
        <View className="gap-5 p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="min-w-0 flex-1 pt-1">
              <Text className={`${typography.label} text-stone-600`}>
                {t("plantDetail.eyebrow")}
              </Text>
              <Text className={`mt-1 ${typography.heroTitle} text-stone-950`}>
                {plant.name}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
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
                <Text
                  className={`rounded-md bg-white/60 px-2 py-1 ${typography.chip} text-stone-700`}
                >
                  {formatPlantCount(plant.plantCount, language)}
                </Text>
                <Text
                  className={`rounded-md px-2 py-1 ${typography.chip} ${healthVisual.chip}`}
                >
                  {t(`plant.health.${plant.health}`)}
                </Text>
              </View>
            </View>
            <View className="h-32 w-32 shrink-0 items-center justify-center overflow-hidden">
              <CategoryIllustration
                width={categoryVisual.imageSize}
                height={categoryVisual.imageSize}
              />
            </View>
          </View>

          <View className="rounded-lg bg-white/80 p-4">
            {nextTask ? (
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-12 w-12 items-center justify-center rounded-lg ${
                    careTone[nextTask.type].iconBackground
                  }`}
                >
                  {(() => {
                    const Icon = careIcons[nextTask.type];

                    return (
                      <Icon
                        color={careTone[nextTask.type].iconColor}
                        size={24}
                        strokeWidth={2.3}
                      />
                    );
                  })()}
                </View>
                <View className="min-w-0 flex-1">
                  <Text className={`${typography.label} text-stone-500`}>
                    {t("plantDetail.nextCare")}
                  </Text>
                  <Text
                    className={`mt-1 ${typography.cardTitle} text-stone-950`}
                  >
                    {t(`care.task.${nextTask.type}`)}{" "}
                    {formatDueDistance(nextTask.nextDueAt, language)}
                  </Text>
                  <Text className={`mt-1 ${typography.body} text-stone-500`}>
                    {formatShortDate(nextTask.nextDueAt, language)}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 color="#047857" size={24} strokeWidth={2.3} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className={`${typography.label} text-stone-500`}>
                    {t("plantDetail.nextCare")}
                  </Text>
                  <Text
                    className={`mt-1 ${typography.cardTitle} text-stone-950`}
                  >
                    {t("plantDetail.noPlan")}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {isDeleting ? (
            <Text
              className={`rounded-lg bg-white/70 px-3 py-2 ${typography.empty} text-rose-700`}
            >
              {t("plantCard.deleting")}
            </Text>
          ) : null}
          <View className="gap-3">
            <Text className={`${typography.label} text-stone-500`}>
              {t("plantDetail.profile")}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              <DetailTile
                icon={Sprout}
                iconColor="#047857"
                label={t("plantDetail.planted")}
                value={formatPlantCount(plant.plantCount, language)}
              />
              <DetailTile
                icon={HeartPulse}
                iconColor={healthVisual.iconColor}
                label={t("plantDetail.health")}
                value={t(`plant.health.${plant.health}`)}
              />
              <DetailTile
                icon={MapPin}
                iconColor="#047857"
                label={t("plantDetail.location")}
                value={t(`plant.light.${plant.light}`)}
              />
              <DetailTile
                icon={CalendarDays}
                iconColor="#57534e"
                label={t("plantDetail.age")}
                value={plant.age || t("common.notSet")}
              />
              <DetailTile
                icon={Droplets}
                iconColor="#0369a1"
                label={t("plantDetail.waterType")}
                value={plant.waterType || t("common.notSet")}
              />
              <DetailTile
                icon={Leaf}
                iconColor="#a16207"
                label={t("plantDetail.fertilizer")}
                value={plant.fertilizerType || t("common.notSet")}
              />
            </View>

            {plant.notes ? (
              <View className="gap-2 rounded-lg border border-stone-100 bg-white p-4 shadow-sm shadow-stone-200">
                <Text className={`${typography.label} text-stone-500`}>
                  {t("plantDetail.note")}
                </Text>
                <Text className={`${typography.body} text-stone-700`}>
                  {plant.notes}
                </Text>
              </View>
            ) : null}
          </View>

          {isEditing ? (
            <AddPlantForm
              initialPlant={plant}
              initialTasks={sortedPlantTasks}
              onCancel={() => setIsEditing(false)}
              onSubmit={async (input) => {
                await updatePlant(plant.id, input);
                setIsEditing(false);
              }}
              submitLabel={t("diary.saveChanges")}
              title={t("diary.editTitle")}
            />
          ) : null}
        </View>
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <Text className={`${typography.sectionTitle} text-stone-950`}>
            {t("plantDetail.carePlan")}
          </Text>
          <Text
            className={`rounded-md bg-stone-100 px-2 py-1 ${typography.chip} text-stone-600`}
          >
            {sortedPlantTasks.length}
          </Text>
        </View>
        {sortedPlantTasks.length === 0 ? (
          <Text
            className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}
          >
            {t("plantDetail.noCarePlan")}
          </Text>
        ) : null}
        {sortedPlantTasks.map((task) => {
          const Icon = careIcons[task.type];
          const tone = careTone[task.type];

          return (
            <View
              key={task.id}
              className={`overflow-hidden rounded-lg border bg-white shadow-sm shadow-stone-200 ${tone.border}`}
            >
              <View className={`h-1.5 ${tone.accent}`} />
              <View className="gap-4 p-4">
                <View className="flex-row items-center gap-3">
                  <View
                    className={`h-12 w-12 items-center justify-center rounded-lg ${tone.iconBackground}`}
                  >
                    <Icon color={tone.iconColor} size={24} strokeWidth={2.3} />
                  </View>
                  <View className="min-w-0 flex-1">
                    <View className="flex-row flex-wrap items-center gap-2">
                      <Text
                        className={`rounded-md px-2 py-1 ${typography.chip} ${tone.chip}`}
                      >
                        {t(`care.task.${task.type}`)}
                      </Text>
                      <Text
                        className={`rounded-md bg-stone-100 px-2 py-1 ${typography.chip} text-stone-600`}
                      >
                        {formatInterval(task.intervalDays, t)}
                      </Text>
                    </View>
                    <Text
                      className={`mt-2 ${typography.cardTitle} text-stone-950`}
                    >
                      {formatDueDistance(task.nextDueAt, language)} ·{" "}
                      {formatShortDate(task.nextDueAt, language)}
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  <View
                    className={`flex-grow rounded-lg border px-3 py-3 ${tone.border} ${tone.panel}`}
                    style={{ flexBasis: "47%" }}
                  >
                    <Text className={`${typography.label} text-stone-500`}>
                      {t("plantDetail.lastCare")}
                    </Text>
                    <Text
                      className={`mt-1 ${typography.bodyStrong} text-stone-800`}
                    >
                      {task.lastCompletedAt
                        ? formatShortDate(task.lastCompletedAt, language)
                        : t("common.noRecord")}
                    </Text>
                  </View>
                  <View
                    className={`flex-grow rounded-lg border px-3 py-3 ${tone.border} ${tone.panel}`}
                    style={{ flexBasis: "47%" }}
                  >
                    <Text className={`${typography.label} text-stone-500`}>
                      {t("plantDetail.reminder")}
                    </Text>
                    <Text
                      className={`mt-1 ${typography.bodyStrong} text-stone-800`}
                    >
                      {notificationTimeLabel}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <Clock3 color="#047857" size={21} strokeWidth={2.3} />
            <Text className={`${typography.sectionTitle} text-stone-950`}>
              {t("plantDetail.currentTasks")}
            </Text>
          </View>
          <Text
            className={`rounded-md bg-emerald-50 px-2 py-1 ${typography.chip} text-emerald-700`}
          >
            {currentTasks.length}
          </Text>
        </View>
        {currentTasks.length === 0 ? (
          <View className="flex-row items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-4">
            <CheckCircle2 color="#047857" size={22} strokeWidth={2.4} />
            <Text
              className={`min-w-0 flex-1 ${typography.bodyStrong} text-emerald-800`}
            >
              {t("plantDetail.noCurrentTasks")}
            </Text>
          </View>
        ) : null}
        {currentTasks.map((task) => (
          <CareTaskCard
            key={`task-${task.id}`}
            onComplete={(taskId) => void completeCareTask(taskId)}
            task={task}
          />
        ))}
      </View>

      <View className="gap-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2">
            <CheckCircle2 color="#047857" size={21} strokeWidth={2.3} />
            <Text className={`${typography.sectionTitle} text-stone-950`}>
              {t("plantDetail.history")}
            </Text>
          </View>
          <Text
            className={`rounded-md bg-stone-100 px-2 py-1 ${typography.chip} text-stone-600`}
          >
            {plantCareHistory.length}
          </Text>
        </View>

        {visibleCareHistory.length === 0 ? (
          <Text
            className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}
          >
            {t("plantDetail.emptyHistory")}
          </Text>
        ) : null}

        {visibleCareHistory.map((event, index) => {
          const Icon = careIcons[event.type];
          const tone = careTone[event.type];
          const isLastItem = index === visibleCareHistory.length - 1;

          return (
            <View key={event.id} className="flex-row gap-3">
              <View className="items-center">
                <View
                  className={`h-11 w-11 items-center justify-center rounded-lg ${tone.iconBackground}`}
                >
                  <Icon color={tone.iconColor} size={22} strokeWidth={2.3} />
                </View>
                {!isLastItem ? (
                  <View className="mt-2 w-px flex-1 bg-stone-200" />
                ) : null}
              </View>

              <View
                className={`min-w-0 flex-1 gap-3 rounded-lg border bg-white p-4 shadow-sm shadow-stone-200 ${tone.border}`}
              >
                <View className="flex-row flex-wrap items-center gap-2">
                  <Text
                    className={`rounded-md px-2 py-1 ${typography.chip} ${tone.chip}`}
                  >
                    {t(`care.task.${event.type}`)}
                  </Text>
                  <Text
                    className={`rounded-md bg-emerald-50 px-2 py-1 ${typography.chip} text-emerald-700`}
                  >
                    {t("common.done")}
                  </Text>
                </View>

                <View className="gap-1">
                  <Text className={`${typography.cardTitle} text-stone-950`}>
                    {historyDateFormatter.format(new Date(event.completedAt))}
                  </Text>
                  {event.scheduledFor ? (
                    <Text className={`${typography.body} text-stone-500`}>
                      {t("plantDetail.scheduledFor", {
                        date: formatShortDate(event.scheduledFor, language),
                      })}
                    </Text>
                  ) : null}
                  {event.note ? (
                    <Text className={`${typography.body} text-stone-700`}>
                      {event.note}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
