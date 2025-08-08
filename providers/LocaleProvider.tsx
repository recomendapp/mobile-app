import 'intl-pluralrules';
import { IntlProvider } from "use-intl";
import { createContext, useContext, useEffect, useState } from "react";
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
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocaleContext must be used in LocaleProvider");
  return ctx;
};

export const LocaleProvider = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useSplashScreen();
  const [locale, setLocaleState] = useState<SupportedLocale | undefined>(undefined);
  const [messages, setMessages] = useState<Record<string, string> | null>(null);
  const timeZone = getCalendars()[0]?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const setLocale = async (newLocale: string) => {
	  if (newLocale === locale) return;
    if (!supportedLocales.includes(newLocale as SupportedLocale)) {
      throw new Error(`Unsupported locale: ${newLocale}`);
    }
    setLocaleHook(newLocale);
    const msgs = await loadMessages(newLocale);
    setLocaleState(newLocale as SupportedLocale);
    setMessages(msgs);
  };

  useEffect(() => {
    (async () => {
      const initial = await getLocale();
      const msgs = await loadMessages(initial);
      if (!supportedLocales.includes(initial as SupportedLocale)) {
        setLocaleState(defaultLocale);
      } else {
        setLocaleState(initial as SupportedLocale);
      }
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
