import type { PlantHealth } from "@/types/plants";

export const plantHealthValues: PlantHealth[] = [
  "healthy",
  "watching",
  "needs_care",
  "recovering",
];

export const plantHealthVisuals: Record<
  PlantHealth,
  {
    chip: string;
    iconColor: string;
  }
> = {
  healthy: {
    chip: "bg-emerald-100 text-emerald-800",
    iconColor: "#047857",
  },
  watching: {
    chip: "bg-sky-100 text-sky-800",
    iconColor: "#0369a1",
  },
  needs_care: {
    chip: "bg-rose-100 text-rose-800",
    iconColor: "#be123c",
  },
  recovering: {
    chip: "bg-amber-100 text-amber-800",
    iconColor: "#a16207",
  },
};

export function normalizePlantHealth(value: unknown): PlantHealth {
  return typeof value === "string" &&
    plantHealthValues.includes(value as PlantHealth)
    ? (value as PlantHealth)
    : "healthy";
}

export function getPlantHealthVisual(health: PlantHealth) {
  return plantHealthVisuals[health];
}
