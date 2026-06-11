import { useMemo, useState } from "react";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

import type {
  CareTask,
  CareTaskType,
  CreatePlantInput,
  LightExposure,
  Plant,
  PlantCategory,
  PlantEnvironment,
  PlantHealth,
} from "@/types/plants";
import { useI18n } from "@/i18n/I18nProvider";
import { addDays } from "@/utils/careSchedule";
import { dateInputToIso, toDateInputValue } from "@/utils/date";
import { typography } from "@/styles/typography";
import { DatePickerField } from "./DatePickerField";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";

type AddPlantFormProps = {
  initialPlant?: Plant;
  initialTasks?: CareTask[];
  onCancel: () => void;
  onSubmit: (input: CreatePlantInput) => void | Promise<void>;
  submitLabel?: string;
  title?: string;
};

const dayInMilliseconds = 24 * 60 * 60 * 1000;

function dateInputToDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function getIntervalDays(fromDate: string, toDate: string): number | null {
  const startDate = dateInputToDate(fromDate);
  const endDate = dateInputToDate(toDate);

  if (!startDate || !endDate) {
    return null;
  }

  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / dayInMilliseconds
  );

  return days >= 1 ? days : null;
}

function formatInterval(days: number, t: ReturnType<typeof useI18n>["t"]): string {
  if (days === 1) {
    return t("interval.everyDay");
  }

  if (days >= 2 && days <= 4) {
    return t("interval.everyFewDays", { count: days });
  }

  return t("interval.everyManyDays", { count: days });
}

function findTask(tasks: CareTask[], type: CareTaskType): CareTask | undefined {
  return tasks.find((task) => task.type === type);
}

function IntervalPreview({ days }: { days: number | null }) {
  const { t } = useI18n();

  return (
    <View className="gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-3">
      <Text className={`${typography.caption} text-stone-600`}>{t("plantForm.interval")}</Text>
      {days ? (
        <Text className={`${typography.button} text-emerald-800`}>
          {formatInterval(days, t)}
        </Text>
      ) : (
        <Text className={`${typography.bodyStrong} text-rose-700`}>
          {t("plantForm.invalidInterval")}
        </Text>
      )}
    </View>
  );
}

export function AddPlantForm({
  initialPlant,
  initialTasks = [],
  onCancel,
  onSubmit,
  submitLabel,
  title,
}: AddPlantFormProps) {
  const { t } = useI18n();
  const categoryOptions: SegmentedOption<PlantCategory>[] = [
    { label: t("plant.category.ornamental"), value: "ornamental" },
    { label: t("plant.category.fruiting"), value: "fruiting" },
    { label: t("plant.category.herb"), value: "herb" },
    { label: t("plant.category.vegetable"), value: "vegetable" },
    { label: t("plant.category.succulent"), value: "succulent" },
    { label: t("plant.category.other"), value: "other" },
  ];
  const environmentOptions: SegmentedOption<PlantEnvironment>[] = [
    { label: t("plant.environment.indoor"), value: "indoor" },
    { label: t("plant.environment.outdoor"), value: "outdoor" },
  ];
  const lightOptions: SegmentedOption<LightExposure>[] = [
    { label: t("plant.light.full_sun"), value: "full_sun" },
    { label: t("plant.light.partial_shade"), value: "partial_shade" },
    { label: t("plant.light.shade"), value: "shade" },
  ];
  const healthOptions: SegmentedOption<PlantHealth>[] = [
    { label: t("plant.health.healthy"), value: "healthy" },
    { label: t("plant.health.watching"), value: "watching" },
    { label: t("plant.health.needs_careShort"), value: "needs_care" },
    { label: t("plant.health.recovering"), value: "recovering" },
  ];
  const formTitle = title ?? t("plantForm.title");
  const buttonLabel = submitLabel ?? t("common.save");
  const today = useMemo(() => new Date(), []);
  const wateringTask = useMemo(
    () => findTask(initialTasks, "watering"),
    [initialTasks]
  );
  const fertilizingTask = useMemo(
    () => findTask(initialTasks, "fertilizing"),
    [initialTasks]
  );
  const [name, setName] = useState(initialPlant?.name ?? "");
  const [plantCount, setPlantCount] = useState(String(initialPlant?.plantCount ?? 1));
  const [age, setAge] = useState(initialPlant?.age ?? "");
  const [category, setCategory] = useState<PlantCategory>(
    initialPlant?.category ?? "ornamental"
  );
  const [environment, setEnvironment] = useState<PlantEnvironment>(
    initialPlant?.environment ?? "indoor"
  );
  const [light, setLight] = useState<LightExposure>(
    initialPlant?.light ?? "partial_shade"
  );
  const [health, setHealth] = useState<PlantHealth>(
    initialPlant?.health ?? "healthy"
  );
  const [notes, setNotes] = useState(initialPlant?.notes ?? "");
  const [waterType, setWaterType] = useState(initialPlant?.waterType ?? "");
  const [fertilizerType, setFertilizerType] = useState(
    initialPlant?.fertilizerType ?? ""
  );
  const [lastWateredAt, setLastWateredAt] = useState(
    toDateInputValue(wateringTask?.lastCompletedAt ?? today)
  );
  const [nextWateringAt, setNextWateringAt] = useState(
    toDateInputValue(wateringTask?.nextDueAt ?? addDays(today, 7))
  );
  const [fertilizingEnabled, setFertilizingEnabled] = useState(
    Boolean(fertilizingTask) || !initialPlant
  );
  const [lastFertilizedAt, setLastFertilizedAt] = useState(
    toDateInputValue(fertilizingTask?.lastCompletedAt ?? today)
  );
  const [nextFertilizingAt, setNextFertilizingAt] = useState(
    toDateInputValue(fertilizingTask?.nextDueAt ?? addDays(today, 30))
  );
  const wateringIntervalDays = useMemo(
    () => getIntervalDays(lastWateredAt, nextWateringAt),
    [lastWateredAt, nextWateringAt]
  );
  const fertilizingIntervalDays = useMemo(
    () => getIntervalDays(lastFertilizedAt, nextFertilizingAt),
    [lastFertilizedAt, nextFertilizingAt]
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    const wateringInterval = wateringIntervalDays;
    const fertilizingInterval = fertilizingIntervalDays;
    const lastWateringIso = dateInputToIso(lastWateredAt);
    const nextWateringIso = dateInputToIso(nextWateringAt);
    const lastFertilizingIso = dateInputToIso(lastFertilizedAt);
    const nextFertilizingIso = dateInputToIso(nextFertilizingAt);
    const trimmedPlantCount = plantCount.trim();
    const parsedPlantCount = Number.parseInt(trimmedPlantCount, 10);

    if (!name.trim()) {
      setError(t("plantForm.error.name"));
      return;
    }

    if (!/^\d+$/.test(trimmedPlantCount) || parsedPlantCount < 1) {
      setError(t("plantForm.error.count"));
      return;
    }

    if (!wateringInterval || !lastWateringIso || !nextWateringIso) {
      setError(t("plantForm.error.watering"));
      return;
    }

    if (
      fertilizingEnabled &&
      (!fertilizingInterval || !lastFertilizingIso || !nextFertilizingIso)
    ) {
      setError(t("plantForm.error.fertilizing"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name,
        plantCount: parsedPlantCount,
        category,
        environment,
        light,
        health,
        age: age.trim() || undefined,
        waterType: waterType.trim() || undefined,
        fertilizerType: fertilizingEnabled
          ? fertilizerType.trim() || undefined
          : undefined,
        notes,
        careSchedules: [
          {
            type: "watering",
            intervalDays: wateringInterval,
            lastCompletedAt: lastWateringIso,
            nextDueAt: nextWateringIso,
            enabled: true,
          },
          ...(fertilizingEnabled &&
          fertilizingInterval &&
          lastFertilizingIso &&
          nextFertilizingIso
            ? [
                {
                  type: "fertilizing" as const,
                  intervalDays: fertilizingInterval,
                  lastCompletedAt: lastFertilizingIso,
                  nextDueAt: nextFertilizingIso,
                  enabled: true,
                },
              ]
            : []),
        ],
      });
    } catch {
      setError(t("plantForm.error.save"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View className="gap-5 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm shadow-stone-200">
      <View className="gap-1">
        <Text className={`${typography.cardTitleLarge} text-stone-950`}>{formTitle}</Text>
        <Text className={`${typography.body} text-stone-500`}>
          {t("plantForm.subtitle")}
        </Text>
      </View>

      <View className="gap-2">
        <Text className={`${typography.fieldLabel} text-stone-800`}>{t("plantForm.name")}</Text>
        <TextInput
          className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
          onChangeText={setName}
          placeholder="Pothos"
          placeholderTextColor="#a8a29e"
          value={name}
        />
      </View>

      <View className="gap-2">
        <Text className={`${typography.fieldLabel} text-stone-800`}>{t("plantForm.count")}</Text>
        <TextInput
          className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
          keyboardType="number-pad"
          onChangeText={setPlantCount}
          placeholder="1"
          placeholderTextColor="#a8a29e"
          value={plantCount}
        />
      </View>

      <View className="gap-2">
        <Text className={`${typography.fieldLabel} text-stone-800`}>{t("plantForm.age")}</Text>
        <TextInput
          className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
          onChangeText={setAge}
          placeholder={t("plantForm.agePlaceholder")}
          placeholderTextColor="#a8a29e"
          value={age}
        />
      </View>

      <SegmentedControl
        label={t("plantForm.category")}
        onChange={setCategory}
        options={categoryOptions}
        value={category}
      />
      <SegmentedControl
        label={t("plantForm.environment")}
        onChange={setEnvironment}
        options={environmentOptions}
        value={environment}
      />
      <SegmentedControl
        label={t("plantForm.light")}
        onChange={setLight}
        options={lightOptions}
        value={light}
      />
      <SegmentedControl
        label={t("plantForm.health")}
        onChange={setHealth}
        options={healthOptions}
        value={health}
      />

      <View className="gap-2">
        <Text className={`${typography.fieldLabel} text-stone-800`}>{t("plantForm.notes")}</Text>
        <TextInput
          className={`min-h-20 rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
          multiline
          onChangeText={setNotes}
          placeholder={t("plantForm.notesPlaceholder")}
          placeholderTextColor="#a8a29e"
          textAlignVertical="top"
          value={notes}
        />
      </View>

      <View className="gap-3 rounded-lg border border-sky-100 bg-sky-50/60 p-4">
        <Text className={`${typography.cardTitle} text-sky-950`}>{t("plantForm.watering")}</Text>
        <View className="flex-row gap-3">
          <DatePickerField
            label={t("plantForm.last")}
            onChange={setLastWateredAt}
            value={lastWateredAt}
          />
          <DatePickerField
            label={t("plantForm.next")}
            onChange={setNextWateringAt}
            value={nextWateringAt}
          />
        </View>
        <IntervalPreview days={wateringIntervalDays} />
        <View className="gap-2">
          <Text className={`${typography.caption} text-stone-600`}>{t("plantForm.waterType")}</Text>
          <TextInput
            className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
            onChangeText={setWaterType}
            placeholder={t("plantForm.waterTypePlaceholder")}
            placeholderTextColor="#a8a29e"
            value={waterType}
          />
        </View>
      </View>

      <View className="gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
        <View className="flex-row items-center justify-between gap-3">
          <Text className={`${typography.cardTitle} text-amber-950`}>{t("plantForm.fertilizing")}</Text>
          <Switch
            ios_backgroundColor="#e7e5e4"
            onValueChange={setFertilizingEnabled}
            thumbColor={fertilizingEnabled ? "#ffffff" : "#f5f5f4"}
            trackColor={{ false: "#d6d3d1", true: "#047857" }}
            value={fertilizingEnabled}
          />
        </View>
        {fertilizingEnabled ? (
          <>
            <View className="flex-row gap-3">
              <DatePickerField
                label={t("plantForm.last")}
                onChange={setLastFertilizedAt}
                value={lastFertilizedAt}
              />
              <DatePickerField
                label={t("plantForm.next")}
                onChange={setNextFertilizingAt}
                value={nextFertilizingAt}
              />
            </View>
            <IntervalPreview days={fertilizingIntervalDays} />
            <View className="gap-2">
              <Text className={`${typography.caption} text-stone-600`}>
                {t("plantForm.fertilizerType")}
              </Text>
              <TextInput
                className={`rounded-lg border border-stone-200 bg-white px-3 py-3 ${typography.input} text-stone-950`}
                onChangeText={setFertilizerType}
                placeholder={t("plantForm.fertilizerTypePlaceholder")}
                placeholderTextColor="#a8a29e"
                value={fertilizerType}
              />
            </View>
          </>
        ) : null}
      </View>

      {error ? (
        <Text className={`rounded-lg bg-rose-100 px-3 py-2 ${typography.empty} text-rose-700`}>
          {error}
        </Text>
      ) : null}

      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 rounded-lg border border-stone-200 bg-white py-3 active:bg-stone-100"
          disabled={isSubmitting}
          onPress={onCancel}
        >
          <Text className={`text-center ${typography.button} text-stone-700`}>
            {t("common.cancel")}
          </Text>
        </Pressable>
        <Pressable
          className="flex-1 rounded-lg bg-emerald-700 py-3 active:bg-emerald-800"
          disabled={isSubmitting}
          onPress={handleSubmit}
        >
          <Text className={`text-center ${typography.button} text-white`}>
            {isSubmitting ? t("common.saving") : buttonLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
