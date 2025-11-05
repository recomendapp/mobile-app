import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import deepmerge from "deepmerge";
import { defaultLocale, SupportedLocale } from "@/translations/locales";
import { getFallbackLocale } from "@/translations/utils/getFallbackLocale";
import { loadPolyfills } from "./polyfills";

export const getLocale = async (): Promise<string> => {
  let saved = await AsyncStorage.getItem("language");

  if (!saved) {
    const deviceLocale = Localization.getLocales()[0]?.languageTag ?? defaultLocale;
    saved = deviceLocale;
    await AsyncStorage.setItem("language", saved);
  }

  return saved;
};

export const setLocale = async (locale: string): Promise<void> => {
  await AsyncStorage.setItem("language", locale);
};

const loadMessages = async (locale: SupportedLocale): Promise<Record<string, any>> => {
  const getMessagesForLocale = (loc: SupportedLocale) => {
    switch (loc) {
      case 'fr-FR':
        return require('@/translations/fr-FR.json');
      default:
        return require('@/translations/en-US.json');
    }
  };
  const fallback = getFallbackLocale({ locale });
  if (!fallback) {
    return getMessagesForLocale(locale);
  }
  const fallbackMessages = await loadMessages(fallback); // Recursive call
  const userMessages = getMessagesForLocale(locale);
  return deepmerge(fallbackMessages, userMessages);
};

export const initI18n = async (locale: SupportedLocale) => {
  const messages = await loadMessages(locale);
  await loadPolyfills(locale);
  return {
    messages,
  };
};