/* -------------------------------- POLYFILL -------------------------------- */
import '@formatjs/intl-getcanonicallocales/polyfill';
import '@formatjs/intl-locale/polyfill';

// (2) Requis pour Intl.DateTimeFormat
import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/fr';

import '@formatjs/intl-datetimeformat/polyfill';
import '@formatjs/intl-datetimeformat/locale-data/en';
import '@formatjs/intl-datetimeformat/locale-data/fr';

// (3) Requis pour Intl.DisplayNames
import '@formatjs/intl-displaynames/polyfill';
import '@formatjs/intl-displaynames/locale-data/en';
import '@formatjs/intl-displaynames/locale-data/fr';
/* -------------------------------------------------------------------------- */


import { IntlProvider } from "use-intl";
import { createContext, use, useCallback, useEffect, useState } from "react";
import { getLocale, loadMessages, setLocale as setLocaleHook } from "@/lib/i18n"; // à toi d’implémenter
import { useSplashScreen } from "./SplashScreenProvider";
import { getCalendars } from 'expo-localization';
import { defaultLocale, SupportedLocale, supportedLocales } from '@/translations/locales';

type LocaleContextType = {
  locale: SupportedLocale;
  setLocale: (locale: string) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocaleContext = () => {
  const ctx = use(LocaleContext);
  if (!ctx) throw new Error("useLocaleContext must be used in LocaleProvider");
  return ctx;
};

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useSplashScreen();
  const [locale, setLocaleState] = useState<SupportedLocale | undefined>(undefined);
  const [messages, setMessages] = useState<Record<string, string> | null>(null);
  const timeZone = getCalendars()[0]?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const setLocale = useCallback(async (newLocale: string) => {
	  if (newLocale === locale) return;
    if (!supportedLocales.includes(newLocale as SupportedLocale)) {
      throw new Error(`Unsupported locale: ${newLocale}`);
    }
    setLocaleHook(newLocale);
    const msgs = await loadMessages(newLocale as SupportedLocale);
    setLocaleState(newLocale as SupportedLocale);
    setMessages(msgs);
  }, [locale]);

  useEffect(() => {
    (async () => {
      let initial = await getLocale();
      initial = supportedLocales.includes(initial as SupportedLocale) ? initial : defaultLocale; 
      const msgs = await loadMessages(initial as SupportedLocale);
      setLocaleState(initial as SupportedLocale);
      setMessages(msgs);
      i18n.setReady(true);
    })();
  }, []);

  if (!messages || !locale) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages} timeZone={timeZone}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};
