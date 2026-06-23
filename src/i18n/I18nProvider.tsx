import { useLocales } from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import {
  translations,
  type LanguageCode,
  type TranslationKey,
  type TranslationParams,
} from "./translations";

type I18nContextValue = {
  language: LanguageCode;
  t: (key: TranslationKey | string, params?: TranslationParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
};

function getSupportedLanguage(locale?: string | null): LanguageCode {
  return locale?.toLowerCase().startsWith("cs") ? "cs" : "en";
}

function interpolate(value: string, params?: TranslationParams): string {
  if (!params) {
    return value;
  }

  return Object.entries(params).reduce(
    (result, [key, paramValue]) =>
      result.replaceAll(`{{${key}}}`, String(paramValue)),
    value
  );
}

export function I18nProvider({ children }: I18nProviderProps) {
  const locales = useLocales();
  const language = getSupportedLanguage(
    locales[0]?.languageCode ?? locales[0]?.languageTag
  );

  const t = useCallback(
    (key: TranslationKey | string, params?: TranslationParams) => {
      const translationKey = key as TranslationKey;
      const value =
        translations[language][translationKey] ??
        translations.cs[translationKey] ??
        key;

      return interpolate(value, params);
    },
    [language]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      t,
    }),
    [language, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

export type { LanguageCode, TranslationKey };
