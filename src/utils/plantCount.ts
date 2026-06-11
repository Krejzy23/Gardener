import type { LanguageCode } from "@/i18n/translations";

export function normalizePlantCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

export function formatPlantCount(count: number, language: LanguageCode = "cs"): string {
  if (language === "en") {
    return count === 1 ? "1 plant" : `${count} plants`;
  }

  if (count === 1) {
    return '1 kus';
  }

  if (count >= 2 && count <= 4) {
    return `${count} kusy`;
  }

  return `${count} kusů`;
}
