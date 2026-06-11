export type ISODateString = string;

export type PlantCategory = 'ornamental' | 'fruiting' | 'herb' | 'vegetable' | 'succulent' | 'other';

export type PlantEnvironment = 'indoor' | 'outdoor';

export type LightExposure = 'full_sun' | 'partial_shade' | 'shade';

export type PlantHealth = 'healthy' | 'watching' | 'needs_care' | 'recovering';

export type CareTaskType = 'watering' | 'fertilizing';

export type CareTaskStatus = 'overdue' | 'due_today' | 'upcoming' | 'disabled';

export type Plant = {
  id: string;
  ownerId: string;
  name: string;
  plantCount: number;
  category: PlantCategory;
  environment: PlantEnvironment;
  light: LightExposure;
  health: PlantHealth;
  age?: string;
  waterType?: string;
  fertilizerType?: string;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type CareTask = {
  id: string;
  ownerId: string;
  plantId: string;
  type: CareTaskType;
  intervalDays: number;
  nextDueAt: ISODateString;
  lastCompletedAt?: ISODateString;
  reminderTime?: string;
  enabled: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type CareEvent = {
  id: string;
  ownerId: string;
  plantId: string;
  taskId: string;
  type: CareTaskType;
  completedAt: ISODateString;
  scheduledFor?: ISODateString;
  note?: string;
};

export type CareScheduleInput = {
  type: CareTaskType;
  intervalDays: number;
  nextDueAt: ISODateString;
  lastCompletedAt?: ISODateString;
  reminderTime?: string;
  enabled?: boolean;
};

export type CreatePlantInput = {
  name: string;
  plantCount: number;
  category: PlantCategory;
  environment: PlantEnvironment;
  light: LightExposure;
  health: PlantHealth;
  age?: string;
  waterType?: string;
  fertilizerType?: string;
  notes?: string;
  careSchedules: CareScheduleInput[];
};

export type CareTaskWithPlant = CareTask & {
  plant: Plant;
  status: CareTaskStatus;
};

export type CalendarCareItem = {
  id: string;
  date: ISODateString;
  isProjected: boolean;
  task: CareTaskWithPlant;
  type: CareTaskType;
  status: CareTaskStatus;
};

export type CalendarAgendaDay = {
  date: ISODateString;
  tasks: CalendarCareItem[];
};
