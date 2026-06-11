import type { CareTaskStatus, CareTaskType, LightExposure, PlantCategory, PlantEnvironment, PlantHealth } from '@/types/plants';

export const careTaskLabels: Record<CareTaskType, string> = {
  watering: 'Zalít',
  fertilizing: 'Pohnojit',
};

export const careTaskNouns: Record<CareTaskType, string> = {
  watering: 'Zálivka',
  fertilizing: 'Hnojení',
};

export const careStatusLabels: Record<CareTaskStatus, string> = {
  overdue: 'Po termínu',
  due_today: 'Dnes',
  upcoming: 'Čeká',
  disabled: 'Vypnuto',
};

export const plantCategoryLabels: Record<PlantCategory, string> = {
  ornamental: 'Okrasná',
  fruiting: 'Plodící',
  herb: 'Bylinka',
  vegetable: 'Zelenina',
  succulent: 'Sukulent',
  other: 'Ostatní',
};

export const plantEnvironmentLabels: Record<PlantEnvironment, string> = {
  indoor: 'Vnitřní',
  outdoor: 'Venkovní',
};

export const lightExposureLabels: Record<LightExposure, string> = {
  full_sun: 'Slunce',
  partial_shade: 'Polostín',
  shade: 'Stín',
};

export const plantHealthLabels: Record<PlantHealth, string> = {
  healthy: 'Zdravá',
  watching: 'Sledovat',
  needs_care: 'Potřebuje péči',
  recovering: 'Zotavuje se',
};
