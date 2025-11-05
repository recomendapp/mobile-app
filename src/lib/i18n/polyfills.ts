import { SupportedLocale } from "@/translations/locales"

const loader = {
  af: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/af");
    await import("@formatjs/intl-datetimeformat/locale-data/af");
    await import("@formatjs/intl-displaynames/locale-data/af");
    await import("@formatjs/intl-listformat/locale-data/af");
  },
  ar: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ar");
    await import("@formatjs/intl-datetimeformat/locale-data/ar");
    await import("@formatjs/intl-displaynames/locale-data/ar");
    await import("@formatjs/intl-listformat/locale-data/ar");
  },
  be: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/be");
    await import("@formatjs/intl-datetimeformat/locale-data/be");
    await import("@formatjs/intl-displaynames/locale-data/be");
    await import("@formatjs/intl-listformat/locale-data/be");
  },
  bg: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/bg");
    await import("@formatjs/intl-datetimeformat/locale-data/bg");
    await import("@formatjs/intl-displaynames/locale-data/bg");
    await import("@formatjs/intl-listformat/locale-data/bg");
  },
  bn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/bn");
    await import("@formatjs/intl-datetimeformat/locale-data/bn");
    await import("@formatjs/intl-displaynames/locale-data/bn");
    await import("@formatjs/intl-listformat/locale-data/bn");
  },
  br: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/br");
    await import("@formatjs/intl-datetimeformat/locale-data/br");
    await import("@formatjs/intl-displaynames/locale-data/br");
    await import("@formatjs/intl-listformat/locale-data/br");
  },
  ca: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ca");
    await import("@formatjs/intl-datetimeformat/locale-data/ca");
    await import("@formatjs/intl-displaynames/locale-data/ca");
    await import("@formatjs/intl-listformat/locale-data/ca");
  },
  cs: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/cs");
    await import("@formatjs/intl-datetimeformat/locale-data/cs");
    await import("@formatjs/intl-displaynames/locale-data/cs");
    await import("@formatjs/intl-listformat/locale-data/cs");
  },
  cy: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/cy");
    await import("@formatjs/intl-datetimeformat/locale-data/cy");
    await import("@formatjs/intl-displaynames/locale-data/cy");
    await import("@formatjs/intl-listformat/locale-data/cy");
  },
  da: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/da");
    await import("@formatjs/intl-datetimeformat/locale-data/da");
    await import("@formatjs/intl-displaynames/locale-data/da");
    await import("@formatjs/intl-listformat/locale-data/da");
  },
  de: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/de");
    await import("@formatjs/intl-datetimeformat/locale-data/de");
    await import("@formatjs/intl-displaynames/locale-data/de");
    await import("@formatjs/intl-listformat/locale-data/de");
  },
  el: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/el");
    await import("@formatjs/intl-datetimeformat/locale-data/el");
    await import("@formatjs/intl-displaynames/locale-data/el");
    await import("@formatjs/intl-listformat/locale-data/el");
  },
  eo: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/eo");
    await import("@formatjs/intl-datetimeformat/locale-data/eo");
    await import("@formatjs/intl-displaynames/locale-data/eo");
    await import("@formatjs/intl-listformat/locale-data/eo");
  },
  es: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/es");
    await import("@formatjs/intl-datetimeformat/locale-data/es");
    await import("@formatjs/intl-displaynames/locale-data/es");
    await import("@formatjs/intl-listformat/locale-data/es");
  },
  et: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/et");
    await import("@formatjs/intl-datetimeformat/locale-data/et");
    await import("@formatjs/intl-displaynames/locale-data/et");
    await import("@formatjs/intl-listformat/locale-data/et");
  },
  eu: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/eu");
    await import("@formatjs/intl-datetimeformat/locale-data/eu");
    await import("@formatjs/intl-displaynames/locale-data/eu");
    await import("@formatjs/intl-listformat/locale-data/eu");
  },
  fa: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/fa");
    await import("@formatjs/intl-datetimeformat/locale-data/fa");
    await import("@formatjs/intl-displaynames/locale-data/fa");
    await import("@formatjs/intl-listformat/locale-data/fa");
  },
  fi: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/fi");
    await import("@formatjs/intl-datetimeformat/locale-data/fi");
    await import("@formatjs/intl-displaynames/locale-data/fi");
    await import("@formatjs/intl-listformat/locale-data/fi");
  },
  fr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/fr");
    await import("@formatjs/intl-datetimeformat/locale-data/fr");
    await import("@formatjs/intl-displaynames/locale-data/fr");
    await import("@formatjs/intl-listformat/locale-data/fr");
  },
  ga: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ga");
    await import("@formatjs/intl-datetimeformat/locale-data/ga");
    await import("@formatjs/intl-displaynames/locale-data/ga");
    await import("@formatjs/intl-listformat/locale-data/ga");
  },
  gd: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/gd");
    await import("@formatjs/intl-datetimeformat/locale-data/gd");
    await import("@formatjs/intl-displaynames/locale-data/gd");
    await import("@formatjs/intl-listformat/locale-data/gd");
  },
  gl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/gl");
    await import("@formatjs/intl-datetimeformat/locale-data/gl");
    await import("@formatjs/intl-displaynames/locale-data/gl");
    await import("@formatjs/intl-listformat/locale-data/gl");
  },
  he: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/he");
    await import("@formatjs/intl-datetimeformat/locale-data/he");
    await import("@formatjs/intl-displaynames/locale-data/he");
    await import("@formatjs/intl-listformat/locale-data/he");
  },
  hi: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/hi");
    await import("@formatjs/intl-datetimeformat/locale-data/hi");
    await import("@formatjs/intl-displaynames/locale-data/hi");
    await import("@formatjs/intl-listformat/locale-data/hi");
  },
  hr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/hr");
    await import("@formatjs/intl-datetimeformat/locale-data/hr");
    await import("@formatjs/intl-displaynames/locale-data/hr");
    await import("@formatjs/intl-listformat/locale-data/hr");
  },
  hu: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/hu");
    await import("@formatjs/intl-datetimeformat/locale-data/hu");
    await import("@formatjs/intl-displaynames/locale-data/hu");
    await import("@formatjs/intl-listformat/locale-data/hu");
  },
  id: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/id");
    await import("@formatjs/intl-datetimeformat/locale-data/id");
    await import("@formatjs/intl-displaynames/locale-data/id");
    await import("@formatjs/intl-listformat/locale-data/id");
  },
  it: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/it");
    await import("@formatjs/intl-datetimeformat/locale-data/it");
    await import("@formatjs/intl-displaynames/locale-data/it");
    await import("@formatjs/intl-listformat/locale-data/it");
  },
  ja: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ja");
    await import("@formatjs/intl-datetimeformat/locale-data/ja");
    await import("@formatjs/intl-displaynames/locale-data/ja");
    await import("@formatjs/intl-listformat/locale-data/ja");
  },
  ka: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ka");
    await import("@formatjs/intl-datetimeformat/locale-data/ka");
    await import("@formatjs/intl-displaynames/locale-data/ka");
    await import("@formatjs/intl-listformat/locale-data/ka");
  },
  kk: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/kk");
    await import("@formatjs/intl-datetimeformat/locale-data/kk");
    await import("@formatjs/intl-displaynames/locale-data/kk");
    await import("@formatjs/intl-listformat/locale-data/kk");
  },
  kl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/kl");
    await import("@formatjs/intl-datetimeformat/locale-data/kl");
    await import("@formatjs/intl-displaynames/locale-data/kl");
    await import("@formatjs/intl-listformat/locale-data/kl");
  },
  km: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/km");
    await import("@formatjs/intl-datetimeformat/locale-data/km");
    await import("@formatjs/intl-displaynames/locale-data/km");
    await import("@formatjs/intl-listformat/locale-data/km");
  },
  kn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/kn");
    await import("@formatjs/intl-datetimeformat/locale-data/kn");
    await import("@formatjs/intl-displaynames/locale-data/kn");
    await import("@formatjs/intl-listformat/locale-data/kn");
  },
  ko: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ko");
    await import("@formatjs/intl-datetimeformat/locale-data/ko");
    await import("@formatjs/intl-displaynames/locale-data/ko");
    await import("@formatjs/intl-listformat/locale-data/ko");
  },
  ku: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ku");
    await import("@formatjs/intl-datetimeformat/locale-data/ku");
    await import("@formatjs/intl-displaynames/locale-data/ku");
    await import("@formatjs/intl-listformat/locale-data/ku");
  },
  ky: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ky");
    await import("@formatjs/intl-datetimeformat/locale-data/ky");
    await import("@formatjs/intl-displaynames/locale-data/ky");
    await import("@formatjs/intl-listformat/locale-data/ky");
  },
  lo: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/lo");
    await import("@formatjs/intl-datetimeformat/locale-data/lo");
    await import("@formatjs/intl-displaynames/locale-data/lo");
    await import("@formatjs/intl-listformat/locale-data/lo");
  },
  lt: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/lt");
    await import("@formatjs/intl-datetimeformat/locale-data/lt");
    await import("@formatjs/intl-displaynames/locale-data/lt");
    await import("@formatjs/intl-listformat/locale-data/lt");
  },
  lv: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/lv");
    await import("@formatjs/intl-datetimeformat/locale-data/lv");
    await import("@formatjs/intl-displaynames/locale-data/lv");
    await import("@formatjs/intl-listformat/locale-data/lv");
  },
  ml: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ml");
    await import("@formatjs/intl-datetimeformat/locale-data/ml");
    await import("@formatjs/intl-displaynames/locale-data/ml");
    await import("@formatjs/intl-listformat/locale-data/ml");
  },
  mn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/mn");
    await import("@formatjs/intl-datetimeformat/locale-data/mn");
    await import("@formatjs/intl-displaynames/locale-data/mn");
    await import("@formatjs/intl-listformat/locale-data/mn");
  },
  mr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/mr");
    await import("@formatjs/intl-datetimeformat/locale-data/mr");
    await import("@formatjs/intl-displaynames/locale-data/mr");
    await import("@formatjs/intl-listformat/locale-data/mr");
  },
  ms: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ms");
    await import("@formatjs/intl-datetimeformat/locale-data/ms");
    await import("@formatjs/intl-displaynames/locale-data/ms");
    await import("@formatjs/intl-listformat/locale-data/ms");
  },
  mt: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/mt");
    await import("@formatjs/intl-datetimeformat/locale-data/mt");
    await import("@formatjs/intl-displaynames/locale-data/mt");
    await import("@formatjs/intl-listformat/locale-data/mt");
  },
  my: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/my");
    await import("@formatjs/intl-datetimeformat/locale-data/my");
    await import("@formatjs/intl-displaynames/locale-data/my");
    await import("@formatjs/intl-listformat/locale-data/my");
  },
  nb: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/nb");
    await import("@formatjs/intl-datetimeformat/locale-data/nb");
    await import("@formatjs/intl-displaynames/locale-data/nb");
    await import("@formatjs/intl-listformat/locale-data/nb");
  },
  nl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/nl");
    await import("@formatjs/intl-datetimeformat/locale-data/nl");
    await import("@formatjs/intl-displaynames/locale-data/nl");
    await import("@formatjs/intl-listformat/locale-data/nl");
  },
  nn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/nn");
    await import("@formatjs/intl-datetimeformat/locale-data/nn");
    await import("@formatjs/intl-displaynames/locale-data/nn");
    await import("@formatjs/intl-listformat/locale-data/nn");
  },
  no: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/no");
    await import("@formatjs/intl-datetimeformat/locale-data/no");
    await import("@formatjs/intl-displaynames/locale-data/no");
    await import("@formatjs/intl-listformat/locale-data/no");
  },
  pa: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/pa");
    await import("@formatjs/intl-datetimeformat/locale-data/pa");
    await import("@formatjs/intl-displaynames/locale-data/pa");
    await import("@formatjs/intl-listformat/locale-data/pa");
  },
  pl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/pl");
    await import("@formatjs/intl-datetimeformat/locale-data/pl");
    await import("@formatjs/intl-displaynames/locale-data/pl");
    await import("@formatjs/intl-listformat/locale-data/pl");
  },
  ps: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ps");
    await import("@formatjs/intl-datetimeformat/locale-data/ps");
    await import("@formatjs/intl-displaynames/locale-data/ps");
    await import("@formatjs/intl-listformat/locale-data/ps");
  },
  pt: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/pt");
    await import("@formatjs/intl-datetimeformat/locale-data/pt");
    await import("@formatjs/intl-displaynames/locale-data/pt");
    await import("@formatjs/intl-listformat/locale-data/pt");
  },
  ro: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ro");
    await import("@formatjs/intl-datetimeformat/locale-data/ro");
    await import("@formatjs/intl-displaynames/locale-data/ro");
    await import("@formatjs/intl-listformat/locale-data/ro");
  },
  ru: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ru");
    await import("@formatjs/intl-datetimeformat/locale-data/ru");
    await import("@formatjs/intl-displaynames/locale-data/ru");
    await import("@formatjs/intl-listformat/locale-data/ru");
  },
  si: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/si");
    await import("@formatjs/intl-datetimeformat/locale-data/si");
    await import("@formatjs/intl-displaynames/locale-data/si");
    await import("@formatjs/intl-listformat/locale-data/si");
  },
  sk: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sk");
    await import("@formatjs/intl-datetimeformat/locale-data/sk");
    await import("@formatjs/intl-displaynames/locale-data/sk");
    await import("@formatjs/intl-listformat/locale-data/sk");
  },
  sl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sl");
    await import("@formatjs/intl-datetimeformat/locale-data/sl");
    await import("@formatjs/intl-displaynames/locale-data/sl");
    await import("@formatjs/intl-listformat/locale-data/sl");
  },
  so: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/so");
    await import("@formatjs/intl-datetimeformat/locale-data/so");
    await import("@formatjs/intl-displaynames/locale-data/so");
    await import("@formatjs/intl-listformat/locale-data/so");
  },
  sq: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sq");
    await import("@formatjs/intl-datetimeformat/locale-data/sq");
    await import("@formatjs/intl-displaynames/locale-data/sq");
    await import("@formatjs/intl-listformat/locale-data/sq");
  },
  sr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sr");
    await import("@formatjs/intl-datetimeformat/locale-data/sr");
    await import("@formatjs/intl-displaynames/locale-data/sr");
    await import("@formatjs/intl-listformat/locale-data/sr");
  },
  sv: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sv");
    await import("@formatjs/intl-datetimeformat/locale-data/sv");
    await import("@formatjs/intl-displaynames/locale-data/sv");
    await import("@formatjs/intl-listformat/locale-data/sv");
  },
  sw: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sw");
    await import("@formatjs/intl-datetimeformat/locale-data/sw");
    await import("@formatjs/intl-displaynames/locale-data/sw");
    await import("@formatjs/intl-listformat/locale-data/sw");
  },
  ta: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ta");
    await import("@formatjs/intl-datetimeformat/locale-data/ta");
    await import("@formatjs/intl-displaynames/locale-data/ta");
    await import("@formatjs/intl-listformat/locale-data/ta");
  },
  te: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/te");
    await import("@formatjs/intl-datetimeformat/locale-data/te");
    await import("@formatjs/intl-displaynames/locale-data/te");
    await import("@formatjs/intl-listformat/locale-data/te");
  },
  th: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/th");
    await import("@formatjs/intl-datetimeformat/locale-data/th");
    await import("@formatjs/intl-displaynames/locale-data/th");
    await import("@formatjs/intl-listformat/locale-data/th");
  },
  tr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/tr");
    await import("@formatjs/intl-datetimeformat/locale-data/tr");
    await import("@formatjs/intl-displaynames/locale-data/tr");
    await import("@formatjs/intl-listformat/locale-data/tr");
  },
  uk: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/uk");
    await import("@formatjs/intl-datetimeformat/locale-data/uk");
    await import("@formatjs/intl-displaynames/locale-data/uk");
    await import("@formatjs/intl-listformat/locale-data/uk");
  },
  ur: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ur");
    await import("@formatjs/intl-datetimeformat/locale-data/ur");
    await import("@formatjs/intl-displaynames/locale-data/ur");
    await import("@formatjs/intl-listformat/locale-data/ur");
  },
  uz: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/uz");
    await import("@formatjs/intl-datetimeformat/locale-data/uz");
    await import("@formatjs/intl-displaynames/locale-data/uz");
    await import("@formatjs/intl-listformat/locale-data/uz");
  },
  vi: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/vi");
    await import("@formatjs/intl-datetimeformat/locale-data/vi");
    await import("@formatjs/intl-displaynames/locale-data/vi");
    await import("@formatjs/intl-listformat/locale-data/vi");
  },
  zh: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/zh");
    await import("@formatjs/intl-datetimeformat/locale-data/zh");
    await import("@formatjs/intl-displaynames/locale-data/zh");
    await import("@formatjs/intl-listformat/locale-data/zh");
  },
  zu: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/zu");
    await import("@formatjs/intl-datetimeformat/locale-data/zu");
    await import("@formatjs/intl-displaynames/locale-data/zu");
    await import("@formatjs/intl-listformat/locale-data/zu");
  },
  en: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/en");
    await import("@formatjs/intl-datetimeformat/locale-data/en");
    await import("@formatjs/intl-displaynames/locale-data/en");
    await import("@formatjs/intl-listformat/locale-data/en");
  }
} as const;

export const loadPolyfills = async (locale: SupportedLocale) => {
  const lang = locale.split("-")[0];
  const fn = loader[lang as keyof typeof loader] ?? loader.en;
  await fn();
};