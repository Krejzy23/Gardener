import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  languageNames,
  supportedLanguages,
  translations,
  type LanguageCode,
  type TranslationKey,
  type TranslationParams,
} from "./translations";

type I18nContextValue = {
  deviceLanguage: LanguageCode;
  isLoadingLanguage: boolean;
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: TranslationKey | string, params?: TranslationParams) => string;
};

const LANGUAGE_STORAGE_KEY = "gardener:language";

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  children: ReactNode;
};

function isLanguageCode(value: unknown): value is LanguageCode {
  return (
    typeof value === "string" &&
    supportedLanguages.includes(value as LanguageCode)
  );
}

function getDeviceLanguage(): LanguageCode {
  const locale =
    getLocales()[0]?.languageTag ??
    Intl.DateTimeFormat().resolvedOptions().locale;

  return locale.toLowerCase().startsWith("cs") ? "cs" : "en";
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
  const [deviceLanguage] = useState<LanguageCode>(() => getDeviceLanguage());
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);
  const [language, setLanguageState] = useState<LanguageCode>(deviceLanguage);

  useEffect(() => {
    let isMounted = true;

    async function loadLanguage() {
      try {
        const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (isMounted && isLanguageCode(storedLanguage)) {
          setLanguageState(storedLanguage);
        }
      } finally {
        if (isMounted) {
          setIsLoadingLanguage(false);
        }
      }
    }

    void loadLanguage();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = useCallback(async (nextLanguage: LanguageCode) => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  }, []);

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
      deviceLanguage,
      isLoadingLanguage,
      language,
      setLanguage,
      t,
    }),
    [deviceLanguage, isLoadingLanguage, language, setLanguage, t]
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

export { languageNames };
export type { LanguageCode, TranslationKey };
