import { Plus, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AddPlantForm } from "@/components/AddPlantForm";
import { PageHeader } from "@/components/PageHeader";
import { PlantCard } from "@/components/PlantCard";
import { Screen } from "@/components/Screen";
import { usePlantCareData } from "@/hooks/usePlantCareData";
import { useI18n } from "@/i18n/I18nProvider";
import { typography } from "@/styles/typography";
import type { DiaryStackParamList } from "@/types/navigation";
import type { PlantCategory } from "@/types/plants";
import { getPlantCategoryVisual } from "@/utils/plantVisuals";
import GrassDiary from 'assets/svg/grassDiary.svg'
import Butterfly from 'assets/svg/butterfly.svg'

type PlantCategoryFilter = "all" | PlantCategory;

const plantCategoryFilterValues: PlantCategory[] = [
  "ornamental",
  "fruiting",
  "herb",
  "vegetable",
  "succulent",
  "other",
];

export function DiaryPage() {
  const { t } = useI18n();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<DiaryStackParamList, "DiaryHome">
    >();
  const {
    plants,
    careTasks,
    addPlant,
    deletePlant,
    error,
    isLoading,
    updatePlant,
  } = usePlantCareData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [deletingPlantId, setDeletingPlantId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] =
    useState<PlantCategoryFilter>("all");
  const isFormOpen = isAdding || Boolean(editingPlantId);
  const HeaderIcon = isFormOpen ? X : Plus;
  const categoryCounts = useMemo(() => {
    return plants.reduce<Record<PlantCategory, number>>(
      (counts, plant) => ({
        ...counts,
        [plant.category]: counts[plant.category] + 1,
      }),
      {
        ornamental: 0,
        fruiting: 0,
        herb: 0,
        vegetable: 0,
        succulent: 0,
        other: 0,
      }
    );
  }, [plants]);
  const visibleCategoryFilters = useMemo(
    () =>
      plantCategoryFilterValues.filter(
        (category) => categoryCounts[category] > 0
      ),
    [categoryCounts]
  );
  const filteredPlants = useMemo(
    () =>
      categoryFilter === "all"
        ? plants
        : plants.filter((plant) => plant.category === categoryFilter),
    [categoryFilter, plants]
  );

  useEffect(() => {
    if (categoryFilter !== "all" && categoryCounts[categoryFilter] === 0) {
      setCategoryFilter("all");
    }
  }, [categoryCounts, categoryFilter]);

  function getPlantTasks(plantId: string) {
    return careTasks.filter((task) => task.plantId === plantId);
  }

  function closeForm() {
    setIsAdding(false);
    setEditingPlantId(null);
  }

  function confirmDeletePlant(plantId: string, plantName: string) {
    Alert.alert(
      t("diary.deleteTitle"),
      t("diary.deleteMessage", { name: plantName }),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            setDeletingPlantId(plantId);

            try {
              await deletePlant(plantId);

              if (editingPlantId === plantId) {
                setEditingPlantId(null);
              }
            } finally {
              setDeletingPlantId(null);
            }
          },
        },
      ]
    );
  }

  return (
    <Screen>
      <PageHeader
        eyebrow={t("diary.eyebrow")}
        title={t("diary.title")}
        action={
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-lg bg-emerald-700 shadow-sm shadow-emerald-200 active:bg-emerald-800"
            onPress={() => {
              if (isFormOpen) {
                closeForm();
                return;
              }

              setIsAdding(true);
            }}
          >
            <HeaderIcon color="#ffffff" size={22} strokeWidth={2.4} />
          </Pressable>
        }
      />

      {error ? (
        <Text className={`rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 ${typography.empty} text-rose-700`}>
          {error}
        </Text>
      ) : null}

      {isAdding ? (
        <AddPlantForm
          onCancel={closeForm}
          onSubmit={async (input) => {
            await addPlant(input);
            closeForm();
          }}
        />
      ) : null}

      {plants.length > 0 ? (
        <View className="gap-3 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm shadow-stone-200">
          <Text className={`${typography.label} text-emerald-700`}>
            {t("diary.filterByCategory")}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              className={`overflow-hidden rounded-lg border shadow-sm shadow-stone-100 active:opacity-90 ${
                categoryFilter === "all"
                  ? "border-emerald-700 bg-emerald-700"
                  : "border-stone-100 bg-white"
              }`}
              onPress={() => setCategoryFilter("all")}
            >
              <View
                className={`h-1 ${
                  categoryFilter === "all" ? "bg-emerald-300" : "bg-stone-200"
                }`}
              />
              <Text
                className={`px-3 py-2 ${typography.bodyStrong} ${
                  categoryFilter === "all" ? "text-white" : "text-stone-700"
                }`}
              >
                {t("diary.all")} · {plants.length}
              </Text>
            </Pressable>
            {visibleCategoryFilters.map((category) => {
              const isSelected = categoryFilter === category;
              const categoryVisual = getPlantCategoryVisual(category);

              return (
                <Pressable
                  key={category}
                  className={`overflow-hidden rounded-lg border shadow-sm shadow-stone-100 active:opacity-90 ${
                    isSelected
                      ? `${categoryVisual.background} ${categoryVisual.border}`
                      : "border-stone-100 bg-white"
                  }`}
                  onPress={() => setCategoryFilter(category)}
                >
                  <View className={`h-1 ${categoryVisual.accent}`} />
                  <Text
                    className={`px-3 py-2 ${typography.bodyStrong} text-stone-800`}
                  >
                    {t(`plant.category.${category}`)} · {categoryCounts[category]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <Text className={`${typography.label} text-stone-500`}>
          {plants.length > 0
            ? t("diary.countSummary", {
                total: plants.length,
                visible: filteredPlants.length,
              })
            : t("diary.emptyCount")}
        </Text>
        {isLoading ? (
          <Text className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}>
            {t("diary.loading")}
          </Text>
        ) : null}
        {!isLoading && plants.length === 0 ? (
          <Text className={`rounded-lg border border-stone-100 bg-white px-4 py-5 text-center ${typography.empty} text-stone-500`}>
            {t("diary.empty")}
          </Text>
        ) : null}
        {filteredPlants.map((plant) => {
          const plantTasks = getPlantTasks(plant.id);

          return (
            <View key={plant.id} className="gap-3">
              <PlantCard
                isDeleting={deletingPlantId === plant.id}
                onDelete={() => confirmDeletePlant(plant.id, plant.name)}
                onEdit={() => {
                  setIsAdding(false);
                  setEditingPlantId((current) =>
                    current === plant.id ? null : plant.id
                  );
                }}
                onPress={() =>
                  navigation.navigate("PlantDetail", { plantId: plant.id })
                }
                plant={plant}
                tasks={plantTasks}
              />
              {editingPlantId === plant.id ? (
                <AddPlantForm
                  key={`edit-${plant.id}`}
                  initialPlant={plant}
                  initialTasks={plantTasks}
                  onCancel={closeForm}
                  onSubmit={async (input) => {
                    await updatePlant(plant.id, input);
                    closeForm();
                  }}
                  submitLabel={t("diary.saveChanges")}
                  title={t("diary.editTitle")}
                />
              ) : null}
            </View>
          );
        })}
      </View>
      <View
        className="absolute top-16 left-5 right-5 overflow-hidden"
        pointerEvents="none"
        style={{ height: 80 }}
      >
        <GrassDiary preserveAspectRatio="none" width="100%" height={80} />
      </View>
      <View className="absolute top-5 right-32" pointerEvents="none">
        <Butterfly width={40} height={40} />
      </View>
    </Screen>
  );
}
