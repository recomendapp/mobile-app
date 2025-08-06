import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import deepmerge from "deepmerge";
import defaultMessages from "@/translations/en-US.json";

export const DEFAULT_LOCALE = "en-US";

export const getLocale = async (): Promise<string> => {
  let saved = await AsyncStorage.getItem("language");

  if (!saved) {
    const deviceLocale = Localization.getLocales()[0]?.languageTag ?? DEFAULT_LOCALE;
    saved = deviceLocale;
    await AsyncStorage.setItem("language", saved);
  }

  return saved;
};

export const setLocale = async (locale: string): Promise<void> => {
  await AsyncStorage.setItem("language", locale);
};

export const loadMessages = async (locale: string) => {
  const fallback = defaultMessages;
  let userMessages;
  try {
    switch (locale) {
      case "fr":
      case "fr-FR":
        userMessages = (await import("@/translations/fr-FR.json")).default;
        break;
      case "en":
      case "en-US":
        userMessages = fallback;
        break;
      default:
        userMessages = {};
        break;
    }
  } catch {
    userMessages = {};
  }
  return deepmerge(fallback, userMessages as Record<string, string>);
};