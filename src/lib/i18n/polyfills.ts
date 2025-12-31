import { SupportedLocale } from "@/translations/locales"

const loader = {
  af: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/af.js");
    await import("@formatjs/intl-datetimeformat/locale-data/af.js");
    await import("@formatjs/intl-displaynames/locale-data/af.js");
    await import("@formatjs/intl-listformat/locale-data/af.js");
  },
  ar: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ar.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ar.js");
    await import("@formatjs/intl-displaynames/locale-data/ar.js");
    await import("@formatjs/intl-listformat/locale-data/ar.js");
  },
  be: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/be.js");
    await import("@formatjs/intl-datetimeformat/locale-data/be.js");
    await import("@formatjs/intl-displaynames/locale-data/be.js");
    await import("@formatjs/intl-listformat/locale-data/be.js");
  },
  bg: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/bg.js");
    await import("@formatjs/intl-datetimeformat/locale-data/bg.js");
    await import("@formatjs/intl-displaynames/locale-data/bg.js");
    await import("@formatjs/intl-listformat/locale-data/bg.js");
  },
  bn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/bn.js");
    await import("@formatjs/intl-datetimeformat/locale-data/bn.js");
    await import("@formatjs/intl-displaynames/locale-data/bn.js");
    await import("@formatjs/intl-listformat/locale-data/bn.js");
  },
  br: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/br.js");
    await import("@formatjs/intl-datetimeformat/locale-data/br.js");
    await import("@formatjs/intl-displaynames/locale-data/br.js");
    await import("@formatjs/intl-listformat/locale-data/br.js");
  },
  ca: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ca.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ca.js");
    await import("@formatjs/intl-displaynames/locale-data/ca.js");
    await import("@formatjs/intl-listformat/locale-data/ca.js");
  },
  cs: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/cs.js");
    await import("@formatjs/intl-datetimeformat/locale-data/cs.js");
    await import("@formatjs/intl-displaynames/locale-data/cs.js");
    await import("@formatjs/intl-listformat/locale-data/cs.js");
  },
  cy: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/cy.js");
    await import("@formatjs/intl-datetimeformat/locale-data/cy.js");
    await import("@formatjs/intl-displaynames/locale-data/cy.js");
    await import("@formatjs/intl-listformat/locale-data/cy.js");
  },
  da: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/da.js");
    await import("@formatjs/intl-datetimeformat/locale-data/da.js");
    await import("@formatjs/intl-displaynames/locale-data/da.js");
    await import("@formatjs/intl-listformat/locale-data/da.js");
  },
  de: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/de.js");
    await import("@formatjs/intl-datetimeformat/locale-data/de.js");
    await import("@formatjs/intl-displaynames/locale-data/de.js");
    await import("@formatjs/intl-listformat/locale-data/de.js");
  },
  el: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/el.js");
    await import("@formatjs/intl-datetimeformat/locale-data/el.js");
    await import("@formatjs/intl-displaynames/locale-data/el.js");
    await import("@formatjs/intl-listformat/locale-data/el.js");
  },
  eo: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/eo.js");
    await import("@formatjs/intl-datetimeformat/locale-data/eo.js");
    await import("@formatjs/intl-displaynames/locale-data/eo.js");
    await import("@formatjs/intl-listformat/locale-data/eo.js");
  },
  es: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/es.js");
    await import("@formatjs/intl-datetimeformat/locale-data/es.js");
    await import("@formatjs/intl-displaynames/locale-data/es.js");
    await import("@formatjs/intl-listformat/locale-data/es.js");
  },
  et: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/et.js");
    await import("@formatjs/intl-datetimeformat/locale-data/et.js");
    await import("@formatjs/intl-displaynames/locale-data/et.js");
    await import("@formatjs/intl-listformat/locale-data/et.js");
  },
  eu: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/eu.js");
    await import("@formatjs/intl-datetimeformat/locale-data/eu.js");
    await import("@formatjs/intl-displaynames/locale-data/eu.js");
    await import("@formatjs/intl-listformat/locale-data/eu.js");
  },
  fa: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/fa.js");
    await import("@formatjs/intl-datetimeformat/locale-data/fa.js");
    await import("@formatjs/intl-displaynames/locale-data/fa.js");
    await import("@formatjs/intl-listformat/locale-data/fa.js");
  },
  fi: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/fi.js");
    await import("@formatjs/intl-datetimeformat/locale-data/fi.js");
    await import("@formatjs/intl-displaynames/locale-data/fi.js");
    await import("@formatjs/intl-listformat/locale-data/fi.js");
  },
  fr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/fr.js");
    await import("@formatjs/intl-datetimeformat/locale-data/fr.js");
    await import("@formatjs/intl-displaynames/locale-data/fr.js");
    await import("@formatjs/intl-listformat/locale-data/fr.js");
  },
  ga: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ga.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ga.js");
    await import("@formatjs/intl-displaynames/locale-data/ga.js");
    await import("@formatjs/intl-listformat/locale-data/ga.js");
  },
  gd: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/gd.js");
    await import("@formatjs/intl-datetimeformat/locale-data/gd.js");
    await import("@formatjs/intl-displaynames/locale-data/gd.js");
    await import("@formatjs/intl-listformat/locale-data/gd.js");
  },
  gl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/gl.js");
    await import("@formatjs/intl-datetimeformat/locale-data/gl.js");
    await import("@formatjs/intl-displaynames/locale-data/gl.js");
    await import("@formatjs/intl-listformat/locale-data/gl.js");
  },
  he: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/he.js");
    await import("@formatjs/intl-datetimeformat/locale-data/he.js");
    await import("@formatjs/intl-displaynames/locale-data/he.js");
    await import("@formatjs/intl-listformat/locale-data/he.js");
  },
  hi: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/hi.js");
    await import("@formatjs/intl-datetimeformat/locale-data/hi.js");
    await import("@formatjs/intl-displaynames/locale-data/hi.js");
    await import("@formatjs/intl-listformat/locale-data/hi.js");
  },
  hr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/hr.js");
    await import("@formatjs/intl-datetimeformat/locale-data/hr.js");
    await import("@formatjs/intl-displaynames/locale-data/hr.js");
    await import("@formatjs/intl-listformat/locale-data/hr.js");
  },
  hu: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/hu.js");
    await import("@formatjs/intl-datetimeformat/locale-data/hu.js");
    await import("@formatjs/intl-displaynames/locale-data/hu.js");
    await import("@formatjs/intl-listformat/locale-data/hu.js");
  },
  id: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/id.js");
    await import("@formatjs/intl-datetimeformat/locale-data/id.js");
    await import("@formatjs/intl-displaynames/locale-data/id.js");
    await import("@formatjs/intl-listformat/locale-data/id.js");
  },
  it: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/it.js");
    await import("@formatjs/intl-datetimeformat/locale-data/it.js");
    await import("@formatjs/intl-displaynames/locale-data/it.js");
    await import("@formatjs/intl-listformat/locale-data/it.js");
  },
  ja: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ja.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ja.js");
    await import("@formatjs/intl-displaynames/locale-data/ja.js");
    await import("@formatjs/intl-listformat/locale-data/ja.js");
  },
  ka: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ka.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ka.js");
    await import("@formatjs/intl-displaynames/locale-data/ka.js");
    await import("@formatjs/intl-listformat/locale-data/ka.js");
  },
  kk: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/kk.js");
    await import("@formatjs/intl-datetimeformat/locale-data/kk.js");
    await import("@formatjs/intl-displaynames/locale-data/kk.js");
    await import("@formatjs/intl-listformat/locale-data/kk.js");
  },
  kl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/kl.js");
    await import("@formatjs/intl-datetimeformat/locale-data/kl.js");
    await import("@formatjs/intl-displaynames/locale-data/kl.js");
    await import("@formatjs/intl-listformat/locale-data/kl.js");
  },
  km: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/km.js");
    await import("@formatjs/intl-datetimeformat/locale-data/km.js");
    await import("@formatjs/intl-displaynames/locale-data/km.js");
    await import("@formatjs/intl-listformat/locale-data/km.js");
  },
  kn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/kn.js");
    await import("@formatjs/intl-datetimeformat/locale-data/kn.js");
    await import("@formatjs/intl-displaynames/locale-data/kn.js");
    await import("@formatjs/intl-listformat/locale-data/kn.js");
  },
  ko: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ko.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ko.js");
    await import("@formatjs/intl-displaynames/locale-data/ko.js");
    await import("@formatjs/intl-listformat/locale-data/ko.js");
  },
  ku: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ku.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ku.js");
    await import("@formatjs/intl-displaynames/locale-data/ku.js");
    await import("@formatjs/intl-listformat/locale-data/ku.js");
  },
  ky: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ky.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ky.js");
    await import("@formatjs/intl-displaynames/locale-data/ky.js");
    await import("@formatjs/intl-listformat/locale-data/ky.js");
  },
  lo: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/lo.js");
    await import("@formatjs/intl-datetimeformat/locale-data/lo.js");
    await import("@formatjs/intl-displaynames/locale-data/lo.js");
    await import("@formatjs/intl-listformat/locale-data/lo.js");
  },
  lt: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/lt.js");
    await import("@formatjs/intl-datetimeformat/locale-data/lt.js");
    await import("@formatjs/intl-displaynames/locale-data/lt.js");
    await import("@formatjs/intl-listformat/locale-data/lt.js");
  },
  lv: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/lv.js");
    await import("@formatjs/intl-datetimeformat/locale-data/lv.js");
    await import("@formatjs/intl-displaynames/locale-data/lv.js");
    await import("@formatjs/intl-listformat/locale-data/lv.js");
  },
  ml: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ml.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ml.js");
    await import("@formatjs/intl-displaynames/locale-data/ml.js");
    await import("@formatjs/intl-listformat/locale-data/ml.js");
  },
  mn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/mn.js");
    await import("@formatjs/intl-datetimeformat/locale-data/mn.js");
    await import("@formatjs/intl-displaynames/locale-data/mn.js");
    await import("@formatjs/intl-listformat/locale-data/mn.js");
  },
  mr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/mr.js");
    await import("@formatjs/intl-datetimeformat/locale-data/mr.js");
    await import("@formatjs/intl-displaynames/locale-data/mr.js");
    await import("@formatjs/intl-listformat/locale-data/mr.js");
  },
  ms: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ms.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ms.js");
    await import("@formatjs/intl-displaynames/locale-data/ms.js");
    await import("@formatjs/intl-listformat/locale-data/ms.js");
  },
  mt: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/mt.js");
    await import("@formatjs/intl-datetimeformat/locale-data/mt.js");
    await import("@formatjs/intl-displaynames/locale-data/mt.js");
    await import("@formatjs/intl-listformat/locale-data/mt.js");
  },
  my: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/my.js");
    await import("@formatjs/intl-datetimeformat/locale-data/my.js");
    await import("@formatjs/intl-displaynames/locale-data/my.js");
    await import("@formatjs/intl-listformat/locale-data/my.js");
  },
  nb: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/nb.js");
    await import("@formatjs/intl-datetimeformat/locale-data/nb.js");
    await import("@formatjs/intl-displaynames/locale-data/nb.js");
    await import("@formatjs/intl-listformat/locale-data/nb.js");
  },
  nl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/nl.js");
    await import("@formatjs/intl-datetimeformat/locale-data/nl.js");
    await import("@formatjs/intl-displaynames/locale-data/nl.js");
    await import("@formatjs/intl-listformat/locale-data/nl.js");
  },
  nn: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/nn.js");
    await import("@formatjs/intl-datetimeformat/locale-data/nn.js");
    await import("@formatjs/intl-displaynames/locale-data/nn.js");
    await import("@formatjs/intl-listformat/locale-data/nn.js");
  },
  no: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/no.js");
    await import("@formatjs/intl-datetimeformat/locale-data/no.js");
    await import("@formatjs/intl-displaynames/locale-data/no.js");
    await import("@formatjs/intl-listformat/locale-data/no.js");
  },
  pa: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/pa.js");
    await import("@formatjs/intl-datetimeformat/locale-data/pa.js");
    await import("@formatjs/intl-displaynames/locale-data/pa.js");
    await import("@formatjs/intl-listformat/locale-data/pa.js");
  },
  pl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/pl.js");
    await import("@formatjs/intl-datetimeformat/locale-data/pl.js");
    await import("@formatjs/intl-displaynames/locale-data/pl.js");
    await import("@formatjs/intl-listformat/locale-data/pl.js");
  },
  ps: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ps.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ps.js");
    await import("@formatjs/intl-displaynames/locale-data/ps.js");
    await import("@formatjs/intl-listformat/locale-data/ps.js");
  },
  pt: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/pt.js");
    await import("@formatjs/intl-datetimeformat/locale-data/pt.js");
    await import("@formatjs/intl-displaynames/locale-data/pt.js");
    await import("@formatjs/intl-listformat/locale-data/pt.js");
  },
  ro: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ro.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ro.js");
    await import("@formatjs/intl-displaynames/locale-data/ro.js");
    await import("@formatjs/intl-listformat/locale-data/ro.js");
  },
  ru: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ru.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ru.js");
    await import("@formatjs/intl-displaynames/locale-data/ru.js");
    await import("@formatjs/intl-listformat/locale-data/ru.js");
  },
  si: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/si.js");
    await import("@formatjs/intl-datetimeformat/locale-data/si.js");
    await import("@formatjs/intl-displaynames/locale-data/si.js");
    await import("@formatjs/intl-listformat/locale-data/si.js");
  },
  sk: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sk.js");
    await import("@formatjs/intl-datetimeformat/locale-data/sk.js");
    await import("@formatjs/intl-displaynames/locale-data/sk.js");
    await import("@formatjs/intl-listformat/locale-data/sk.js");
  },
  sl: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sl.js");
    await import("@formatjs/intl-datetimeformat/locale-data/sl.js");
    await import("@formatjs/intl-displaynames/locale-data/sl.js");
    await import("@formatjs/intl-listformat/locale-data/sl.js");
  },
  so: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/so.js");
    await import("@formatjs/intl-datetimeformat/locale-data/so.js");
    await import("@formatjs/intl-displaynames/locale-data/so.js");
    await import("@formatjs/intl-listformat/locale-data/so.js");
  },
  sq: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sq.js");
    await import("@formatjs/intl-datetimeformat/locale-data/sq.js");
    await import("@formatjs/intl-displaynames/locale-data/sq.js");
    await import("@formatjs/intl-listformat/locale-data/sq.js");
  },
  sr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sr.js");
    await import("@formatjs/intl-datetimeformat/locale-data/sr.js");
    await import("@formatjs/intl-displaynames/locale-data/sr.js");
    await import("@formatjs/intl-listformat/locale-data/sr.js");
  },
  sv: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sv.js");
    await import("@formatjs/intl-datetimeformat/locale-data/sv.js");
    await import("@formatjs/intl-displaynames/locale-data/sv.js");
    await import("@formatjs/intl-listformat/locale-data/sv.js");
  },
  sw: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/sw.js");
    await import("@formatjs/intl-datetimeformat/locale-data/sw.js");
    await import("@formatjs/intl-displaynames/locale-data/sw.js");
    await import("@formatjs/intl-listformat/locale-data/sw.js");
  },
  ta: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ta.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ta.js");
    await import("@formatjs/intl-displaynames/locale-data/ta.js");
    await import("@formatjs/intl-listformat/locale-data/ta.js");
  },
  te: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/te.js");
    await import("@formatjs/intl-datetimeformat/locale-data/te.js");
    await import("@formatjs/intl-displaynames/locale-data/te.js");
    await import("@formatjs/intl-listformat/locale-data/te.js");
  },
  th: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/th.js");
    await import("@formatjs/intl-datetimeformat/locale-data/th.js");
    await import("@formatjs/intl-displaynames/locale-data/th.js");
    await import("@formatjs/intl-listformat/locale-data/th.js");
  },
  tr: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/tr.js");
    await import("@formatjs/intl-datetimeformat/locale-data/tr.js");
    await import("@formatjs/intl-displaynames/locale-data/tr.js");
    await import("@formatjs/intl-listformat/locale-data/tr.js");
  },
  uk: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/uk.js");
    await import("@formatjs/intl-datetimeformat/locale-data/uk.js");
    await import("@formatjs/intl-displaynames/locale-data/uk.js");
    await import("@formatjs/intl-listformat/locale-data/uk.js");
  },
  ur: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/ur.js");
    await import("@formatjs/intl-datetimeformat/locale-data/ur.js");
    await import("@formatjs/intl-displaynames/locale-data/ur.js");
    await import("@formatjs/intl-listformat/locale-data/ur.js");
  },
  uz: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/uz.js");
    await import("@formatjs/intl-datetimeformat/locale-data/uz.js");
    await import("@formatjs/intl-displaynames/locale-data/uz.js");
    await import("@formatjs/intl-listformat/locale-data/uz.js");
  },
  vi: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/vi.js");
    await import("@formatjs/intl-datetimeformat/locale-data/vi.js");
    await import("@formatjs/intl-displaynames/locale-data/vi.js");
    await import("@formatjs/intl-listformat/locale-data/vi.js");
  },
  zh: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/zh.js");
    await import("@formatjs/intl-datetimeformat/locale-data/zh.js");
    await import("@formatjs/intl-displaynames/locale-data/zh.js");
    await import("@formatjs/intl-listformat/locale-data/zh.js");
  },
  zu: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/zu.js");
    await import("@formatjs/intl-datetimeformat/locale-data/zu.js");
    await import("@formatjs/intl-displaynames/locale-data/zu.js");
    await import("@formatjs/intl-listformat/locale-data/zu.js");
  },
  en: async () => {
    await import("@formatjs/intl-pluralrules/locale-data/en.js");
    await import("@formatjs/intl-datetimeformat/locale-data/en.js");
    await import("@formatjs/intl-displaynames/locale-data/en.js");
    await import("@formatjs/intl-listformat/locale-data/en.js");
  }
} as const;

export const loadPolyfills = async (locale: SupportedLocale) => {
  const lang = locale.split("-")[0];
  const fn = loader[lang as keyof typeof loader] ?? loader.en;
  await fn();
};