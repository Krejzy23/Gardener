import { getDaysUntilDue } from './careSchedule';
import { languageLocales, type LanguageCode } from '@/i18n/translations';

export function formatDayName(date: Date | string, language: LanguageCode = 'cs'): string {
  return new Intl.DateTimeFormat(languageLocales[language], {
    weekday: 'long',
  }).format(new Date(date));
}

export function formatShortDate(date: Date | string, language: LanguageCode = 'cs'): string {
  return new Intl.DateTimeFormat(languageLocales[language], {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}

export function toDateKey(date: Date | string): string {
  const dateValue = new Date(date);
  const year = dateValue.getFullYear();
  const month = `${dateValue.getMonth() + 1}`.padStart(2, '0');
  const day = `${dateValue.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function toDateInputValue(date: Date | string): string {
  return toDateKey(date);
}

export function dateInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function isSameCalendarDay(firstDate: Date | string, secondDate: Date | string): boolean {
  return toDateKey(firstDate) === toDateKey(secondDate);
}

export function formatDueDistance(date: Date | string, language: LanguageCode = 'cs', now = new Date()): string {
  const days = getDaysUntilDue(date, now);

  if (days < 0) {
    const count = Math.abs(days);
    if (language === 'en') {
      return count === 1 ? 'yesterday' : `${count} days ago`;
    }

    return count === 1 ? 'včera' : `před ${count} dny`;
  }

  if (days === 0) {
    return language === 'en' ? 'today' : 'dnes';
  }

  if (days === 1) {
    return language === 'en' ? 'tomorrow' : 'zítra';
  }

  return language === 'en' ? `in ${days} days` : `za ${days} dní`;
}
