import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { useI18n } from '@/i18n/I18nProvider';
import type { CalendarAgendaDay, CalendarCareItem, CareEvent, CareTask, CareTaskWithPlant, CreatePlantInput, Plant } from '@/types/plants';
import { addDays, getCareTaskStatus } from '@/utils/careSchedule';
import { isSameCalendarDay, toDateKey } from '@/utils/date';
import {
  completeCareTask as completeCareTaskInFirestore,
  createPlantWithCareTasks,
  deletePlantWithCareData,
  subscribeCareEvents,
  subscribeCareTasks,
  subscribePlants,
  updatePlantWithCareTasks,
} from '@/services/plantCareRepository';

type PlantCareContextValue = {
  plants: Plant[];
  careTasks: CareTaskWithPlant[];
  careEvents: CareEvent[];
  dueToday: CareTaskWithPlant[];
  overdue: CareTaskWithPlant[];
  upcoming: CareTaskWithPlant[];
  calendarDays: CalendarAgendaDay[];
  isLoading: boolean;
  error: string | null;
  addPlant: (input: CreatePlantInput) => Promise<void>;
  updatePlant: (plantId: string, input: CreatePlantInput) => Promise<void>;
  deletePlant: (plantId: string) => Promise<void>;
  completeCareTask: (taskId: string) => Promise<void>;
};

const PlantCareContext = createContext<PlantCareContextValue | null>(null);

type PlantCareProviderProps = {
  children: ReactNode;
  ownerId: string;
};

function createCalendarItems(tasks: CareTaskWithPlant[], startDate: Date, endDate: Date): CalendarCareItem[] {
  const items: CalendarCareItem[] = [];

  tasks.forEach((task) => {
    if (!task.enabled) {
      return;
    }

    let occurrenceDate = new Date(task.nextDueAt);
    const intervalDays = Math.max(task.intervalDays, 1);

    while (occurrenceDate < startDate) {
      occurrenceDate = addDays(occurrenceDate, intervalDays);
    }

    while (occurrenceDate <= endDate) {
      const date = occurrenceDate.toISOString();
      const isProjected = !isSameCalendarDay(occurrenceDate, task.nextDueAt);

      items.push({
        id: `${task.id}-${toDateKey(occurrenceDate)}`,
        date,
        isProjected,
        task,
        type: task.type,
        status: getCareTaskStatus(
          {
            enabled: task.enabled,
            nextDueAt: date,
          },
        ),
      });

      occurrenceDate = addDays(occurrenceDate, intervalDays);
    }
  });

  return items.sort((firstItem, secondItem) => new Date(firstItem.date).getTime() - new Date(secondItem.date).getTime());
}

export function PlantCareProvider({ children, ownerId }: PlantCareProviderProps) {
  const { t } = useI18n();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [careEvents, setCareEvents] = useState<CareEvent[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [isLoadingCareTasks, setIsLoadingCareTasks] = useState(true);
  const [isLoadingCareEvents, setIsLoadingCareEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingPlants(true);
    setIsLoadingCareTasks(true);
    setIsLoadingCareEvents(true);
    setError(null);

    const unsubscribePlants = subscribePlants(
      ownerId,
      (nextPlants) => {
        setPlants(nextPlants);
        setIsLoadingPlants(false);
      },
      () => {
        setError(t('plantCare.error.loadPlants'));
        setIsLoadingPlants(false);
      },
    );

    const unsubscribeCareTasks = subscribeCareTasks(
      ownerId,
      (nextCareTasks) => {
        setCareTasks(nextCareTasks);
        setIsLoadingCareTasks(false);
      },
      () => {
        setError(t('plantCare.error.loadCare'));
        setIsLoadingCareTasks(false);
      },
    );

    const unsubscribeCareEvents = subscribeCareEvents(
      ownerId,
      (nextCareEvents) => {
        setCareEvents(nextCareEvents);
        setIsLoadingCareEvents(false);
      },
      () => {
        setError(t('plantCare.error.loadHistory'));
        setIsLoadingCareEvents(false);
      },
    );

    return () => {
      unsubscribePlants();
      unsubscribeCareTasks();
      unsubscribeCareEvents();
    };
  }, [ownerId, t]);

  const addPlant = useCallback(
    async (input: CreatePlantInput) => {
      setError(null);

      try {
        await createPlantWithCareTasks(ownerId, input);
      } catch (saveError) {
        console.error('Create plant failed', saveError);
        const message = t('plantCare.error.create');
        setError(message);
        throw new Error(message);
      }
    },
    [ownerId, t],
  );

  const updatePlant = useCallback(
    async (plantId: string, input: CreatePlantInput) => {
      setError(null);

      try {
        await updatePlantWithCareTasks(ownerId, plantId, input);
      } catch (saveError) {
        console.error('Update plant failed', saveError);
        const message = t('plantCare.error.update');
        setError(message);
        throw new Error(message);
      }
    },
    [ownerId, t],
  );

  const deletePlant = useCallback(
    async (plantId: string) => {
      setError(null);

      try {
        await deletePlantWithCareData(ownerId, plantId);
      } catch {
        const message = t('plantCare.error.delete');
        setError(message);
        throw new Error(message);
      }
    },
    [ownerId, t],
  );

  const completeCareTask = useCallback(
    async (taskId: string) => {
      const task = careTasks.find((item) => item.id === taskId);

      if (!task) {
        return;
      }

      setError(null);

      try {
        await completeCareTaskInFirestore(ownerId, task);
      } catch {
        const message = t('plantCare.error.complete');
        setError(message);
        throw new Error(message);
      }
    },
    [careTasks, ownerId, t],
  );

  const value = useMemo<PlantCareContextValue>(() => {
    const tasksWithPlants = careTasks
      .map<CareTaskWithPlant | null>((task) => {
        const plant = plants.find((item) => item.id === task.plantId);

        if (!plant) {
          return null;
        }

        return {
          ...task,
          plant,
          status: getCareTaskStatus(task),
        };
      })
      .filter((task): task is CareTaskWithPlant => Boolean(task))
      .sort((firstTask, secondTask) => new Date(firstTask.nextDueAt).getTime() - new Date(secondTask.nextDueAt).getTime());

    const dueToday = tasksWithPlants.filter((task) => task.status === 'due_today');
    const overdue = tasksWithPlants.filter((task) => task.status === 'overdue');
    const upcoming = tasksWithPlants.filter((task) => task.status === 'upcoming');

    const calendarStartDate = addDays(new Date(), -30);
    const calendarRangeLength = 121;
    const calendarItems = createCalendarItems(tasksWithPlants, calendarStartDate, addDays(new Date(), 90));
    const calendarDays: CalendarAgendaDay[] = Array.from({ length: calendarRangeLength }, (_, index) => {
      const date = addDays(calendarStartDate, index).toISOString();

      return {
        date,
        tasks: calendarItems.filter((item) => isSameCalendarDay(item.date, date)),
      };
    });

    return {
      plants,
      careTasks: tasksWithPlants,
      careEvents,
      dueToday,
      overdue,
      upcoming,
      calendarDays,
      isLoading: isLoadingPlants || isLoadingCareTasks || isLoadingCareEvents,
      error,
      addPlant,
      updatePlant,
      deletePlant,
      completeCareTask,
    };
  }, [
    addPlant,
    careEvents,
    careTasks,
    completeCareTask,
    deletePlant,
    error,
    isLoadingCareEvents,
    isLoadingCareTasks,
    isLoadingPlants,
    plants,
    updatePlant,
  ]);

  return <PlantCareContext.Provider value={value}>{children}</PlantCareContext.Provider>;
}

export function usePlantCareData() {
  const context = useContext(PlantCareContext);

  if (!context) {
    throw new Error('usePlantCareData must be used inside PlantCareProvider');
  }

  return context;
}
