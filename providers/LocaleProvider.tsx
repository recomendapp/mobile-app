import 'intl-pluralrules';
import { IntlProvider } from "use-intl";
import { createContext, useContext, useEffect, useState } from "react";
import { getLocale, loadMessages, setLocale as setLocaleHook } from "@/lib/i18n"; // à toi d’implémenter
import { useSplashScreen } from "./SplashScreenProvider";

type LocaleContextType = {
  locale: string;
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
  const [locale, setLocaleState] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Record<string, string> | null>(null);

  const setLocale = async (newLocale: string) => {
	  if (newLocale === locale) return;
    setLocaleHook(newLocale);
    const msgs = await loadMessages(newLocale);
    setLocaleState(newLocale);
    setMessages(msgs);
  };

  useEffect(() => {
    (async () => {
      const initial = await getLocale();
      const msgs = await loadMessages(initial);
      setLocaleState(initial);
      setMessages(msgs);
      i18n.setReady(true);
    })();
  }, []);

  if (!messages || !locale) return null;

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
};
