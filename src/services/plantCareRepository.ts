import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { calculateNextDueAt, getEndOfDay } from '@/utils/careSchedule';
import type { CareEvent, CareTask, CreatePlantInput, ISODateString, Plant } from '@/types/plants';
import { normalizePlantHealth } from '@/utils/plantHealth';
import { normalizePlantCount } from '@/utils/plantCount';

function userCollection(ownerId: string, collectionName: 'plants' | 'careTasks' | 'careEvents') {
  return collection(db, 'users', ownerId, collectionName);
}

function toTimestamp(value: ISODateString): Timestamp {
  return Timestamp.fromDate(new Date(value));
}

function toIsoDate(value: unknown): ISODateString {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date().toISOString();
}

function mapPlant(snapshot: QueryDocumentSnapshot<DocumentData>): Plant {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ownerId: String(data.ownerId),
    name: String(data.name),
    plantCount: normalizePlantCount(data.plantCount),
    category: data.category,
    environment: data.environment,
    light: data.light,
    health: normalizePlantHealth(data.health),
    age: typeof data.age === 'string' ? data.age : undefined,
    waterType: typeof data.waterType === 'string' ? data.waterType : undefined,
    fertilizerType: typeof data.fertilizerType === 'string' ? data.fertilizerType : undefined,
    notes: typeof data.notes === 'string' ? data.notes : undefined,
    createdAt: toIsoDate(data.createdAt),
    updatedAt: toIsoDate(data.updatedAt),
  };
}

function mapCareTask(snapshot: QueryDocumentSnapshot<DocumentData>): CareTask {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ownerId: String(data.ownerId),
    plantId: String(data.plantId),
    type: data.type,
    intervalDays: Number(data.intervalDays),
    nextDueAt: toIsoDate(data.nextDueAt),
    lastCompletedAt: data.lastCompletedAt ? toIsoDate(data.lastCompletedAt) : undefined,
    reminderTime: typeof data.reminderTime === 'string' ? data.reminderTime : undefined,
    enabled: Boolean(data.enabled),
    createdAt: toIsoDate(data.createdAt),
    updatedAt: toIsoDate(data.updatedAt),
  };
}

function mapCareEvent(snapshot: QueryDocumentSnapshot<DocumentData>): CareEvent {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    ownerId: String(data.ownerId),
    plantId: String(data.plantId),
    taskId: String(data.taskId),
    type: data.type,
    completedAt: toIsoDate(data.completedAt),
    scheduledFor: data.scheduledFor ? toIsoDate(data.scheduledFor) : undefined,
    note: typeof data.note === 'string' ? data.note : undefined,
  };
}

export async function createPlantWithCareTasks(ownerId: string, input: CreatePlantInput): Promise<string> {
  const plantRef = doc(userCollection(ownerId, 'plants'));
  const batch = writeBatch(db);

  batch.set(plantRef, {
    ownerId,
    name: input.name.trim(),
    plantCount: input.plantCount,
    category: input.category,
    environment: input.environment,
    light: input.light,
    health: input.health,
    age: input.age?.trim() || null,
    waterType: input.waterType?.trim() || null,
    fertilizerType: input.fertilizerType?.trim() || null,
    notes: input.notes?.trim() || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  input.careSchedules.forEach((schedule) => {
    const taskRef = doc(userCollection(ownerId, 'careTasks'));

    batch.set(taskRef, {
      ownerId,
      plantId: plantRef.id,
      type: schedule.type,
      intervalDays: schedule.intervalDays,
      nextDueAt: toTimestamp(schedule.nextDueAt),
      lastCompletedAt: schedule.lastCompletedAt ? toTimestamp(schedule.lastCompletedAt) : null,
      reminderTime: schedule.reminderTime ?? null,
      enabled: schedule.enabled ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();

  return plantRef.id;
}

export async function updatePlantWithCareTasks(ownerId: string, plantId: string, input: CreatePlantInput): Promise<void> {
  const plantRef = doc(userCollection(ownerId, 'plants'), plantId);
  const existingTasksSnapshot = await getDocs(query(userCollection(ownerId, 'careTasks'), where('plantId', '==', plantId)));
  const batch = writeBatch(db);

  batch.update(plantRef, {
    name: input.name.trim(),
    plantCount: input.plantCount,
    category: input.category,
    environment: input.environment,
    light: input.light,
    health: input.health,
    age: input.age?.trim() || null,
    waterType: input.waterType?.trim() || null,
    fertilizerType: input.fertilizerType?.trim() || null,
    notes: input.notes?.trim() || null,
    updatedAt: serverTimestamp(),
  });

  existingTasksSnapshot.docs.forEach((taskSnapshot) => {
    batch.delete(taskSnapshot.ref);
  });

  input.careSchedules.forEach((schedule) => {
    const taskRef = doc(userCollection(ownerId, 'careTasks'));

    batch.set(taskRef, {
      ownerId,
      plantId,
      type: schedule.type,
      intervalDays: schedule.intervalDays,
      nextDueAt: toTimestamp(schedule.nextDueAt),
      lastCompletedAt: schedule.lastCompletedAt ? toTimestamp(schedule.lastCompletedAt) : null,
      reminderTime: schedule.reminderTime ?? null,
      enabled: schedule.enabled ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function deletePlantWithCareData(ownerId: string, plantId: string): Promise<void> {
  const plantRef = doc(userCollection(ownerId, 'plants'), plantId);
  const [tasksSnapshot, eventsSnapshot] = await Promise.all([
    getDocs(query(userCollection(ownerId, 'careTasks'), where('plantId', '==', plantId))),
    getDocs(query(userCollection(ownerId, 'careEvents'), where('plantId', '==', plantId))),
  ]);
  const batch = writeBatch(db);

  tasksSnapshot.docs.forEach((taskSnapshot) => {
    batch.delete(taskSnapshot.ref);
  });

  eventsSnapshot.docs.forEach((eventSnapshot) => {
    batch.delete(eventSnapshot.ref);
  });

  batch.delete(plantRef);

  await batch.commit();
}

export async function listPlants(ownerId: string): Promise<Plant[]> {
  const snapshot = await getDocs(query(userCollection(ownerId, 'plants'), orderBy('name', 'asc')));

  return snapshot.docs.map(mapPlant);
}

export function subscribePlants(
  ownerId: string,
  onChange: (plants: Plant[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(userCollection(ownerId, 'plants'), orderBy('name', 'asc')),
    (snapshot) => onChange(snapshot.docs.map(mapPlant)),
    onError,
  );
}

export function subscribeCareTasks(
  ownerId: string,
  onChange: (tasks: CareTask[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(userCollection(ownerId, 'careTasks'), orderBy('nextDueAt', 'asc')),
    (snapshot) => onChange(snapshot.docs.map(mapCareTask)),
    onError,
  );
}

export function subscribeCareEvents(
  ownerId: string,
  onChange: (events: CareEvent[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    query(userCollection(ownerId, 'careEvents'), orderBy('completedAt', 'desc')),
    (snapshot) => onChange(snapshot.docs.map(mapCareEvent)),
    onError,
  );
}

export async function listCareTasksDueThrough(ownerId: string, endDate = new Date()): Promise<CareTask[]> {
  const snapshot = await getDocs(
    query(
      userCollection(ownerId, 'careTasks'),
      where('enabled', '==', true),
      where('nextDueAt', '<=', Timestamp.fromDate(getEndOfDay(endDate))),
      orderBy('nextDueAt', 'asc'),
    ),
  );

  return snapshot.docs.map(mapCareTask);
}

export async function completeCareTask(ownerId: string, task: CareTask, completedAt = new Date()): Promise<void> {
  const taskRef = doc(userCollection(ownerId, 'careTasks'), task.id);
  const event: Omit<CareEvent, 'id'> = {
    ownerId,
    plantId: task.plantId,
    taskId: task.id,
    type: task.type,
    completedAt: completedAt.toISOString(),
    scheduledFor: task.nextDueAt,
  };

  await addDoc(userCollection(ownerId, 'careEvents'), {
    ...event,
    completedAt: Timestamp.fromDate(completedAt),
    scheduledFor: toTimestamp(task.nextDueAt),
  });

  await updateDoc(taskRef, {
    lastCompletedAt: Timestamp.fromDate(completedAt),
    nextDueAt: toTimestamp(calculateNextDueAt(completedAt, task.intervalDays)),
    updatedAt: serverTimestamp(),
  });
}
