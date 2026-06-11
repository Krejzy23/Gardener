import type { CareTask, CareTaskStatus } from '@/types/plants';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function calculateNextDueAt(completedAt: Date | string, intervalDays: number): string {
  return addDays(new Date(completedAt), intervalDays).toISOString();
}

export function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getCareTaskStatus(task: Pick<CareTask, 'enabled' | 'nextDueAt'>, now = new Date()): CareTaskStatus {
  if (!task.enabled) {
    return 'disabled';
  }

  const dueAt = new Date(task.nextDueAt);

  if (dueAt < getStartOfDay(now)) {
    return 'overdue';
  }

  if (dueAt <= getEndOfDay(now)) {
    return 'due_today';
  }

  return 'upcoming';
}

export function getDaysUntilDue(nextDueAt: Date | string, now = new Date()): number {
  const today = getStartOfDay(now).getTime();
  const dueDay = getStartOfDay(new Date(nextDueAt)).getTime();

  return Math.ceil((dueDay - today) / MS_PER_DAY);
}
