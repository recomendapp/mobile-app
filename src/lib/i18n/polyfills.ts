import { SupportedLocale } from "@/translations/locales";

export const loadPolyfills = async (locale: SupportedLocale) => {
  const lang = locale.split("-")[0];
  switch (lang) {
    case 'af':
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/af"),
        import("@formatjs/intl-datetimeformat/locale-data/af"),
        import("@formatjs/intl-displaynames/locale-data/af"),
        import("@formatjs/intl-listformat/locale-data/af"),
      ]);
      break;
    case 'ar':
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ar"),
        import("@formatjs/intl-datetimeformat/locale-data/ar"),
        import("@formatjs/intl-displaynames/locale-data/ar"),
        import("@formatjs/intl-listformat/locale-data/ar"),
        import("@formatjs/intl-pluralrules/locale-data/ar"),
      ]);
      break;
    case "be":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/be"),
        import("@formatjs/intl-datetimeformat/locale-data/be"),
        import("@formatjs/intl-displaynames/locale-data/be"),
        import("@formatjs/intl-listformat/locale-data/be"),
      ]);
      break;
    case "bg":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/bg"),
        import("@formatjs/intl-datetimeformat/locale-data/bg"),
        import("@formatjs/intl-displaynames/locale-data/bg"),
        import("@formatjs/intl-listformat/locale-data/bg"),
      ]);
      break;
    case "bn":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/bn"),
        import("@formatjs/intl-datetimeformat/locale-data/bn"),
        import("@formatjs/intl-displaynames/locale-data/bn"),
        import("@formatjs/intl-listformat/locale-data/bn"),
      ]);
      break;
    case "br":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/br"),
        import("@formatjs/intl-datetimeformat/locale-data/br"),
        import("@formatjs/intl-displaynames/locale-data/br"),
        import("@formatjs/intl-listformat/locale-data/br"),
      ]);
      break;
    case "br":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/br"),
        import("@formatjs/intl-datetimeformat/locale-data/br"),
        import("@formatjs/intl-displaynames/locale-data/br"),
        import("@formatjs/intl-listformat/locale-data/br"),
      ]);
      break;
    case "ca":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ca"),
        import("@formatjs/intl-datetimeformat/locale-data/ca"),
        import("@formatjs/intl-displaynames/locale-data/ca"),
        import("@formatjs/intl-listformat/locale-data/ca"),
      ]);
      break;
    // case "ch":
    //   await Promise.all([
    //     import("@formatjs/intl-pluralrules/locale-data/ch"),
    //     import("@formatjs/intl-datetimeformat/locale-data/ch"),
    //     import("@formatjs/intl-displaynames/locale-data/ch"),
    //     import("@formatjs/intl-listformat/locale-data/ch"),
    //   ]);
    //   break;
    case "cs":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/cs"),
        import("@formatjs/intl-datetimeformat/locale-data/cs"),
        import("@formatjs/intl-displaynames/locale-data/cs"),
        import("@formatjs/intl-listformat/locale-data/cs"),
      ]);
      break;
    case "cy":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/cy"),
        import("@formatjs/intl-datetimeformat/locale-data/cy"),
        import("@formatjs/intl-displaynames/locale-data/cy"),
        import("@formatjs/intl-listformat/locale-data/cy"),
      ]);
      break;
    case "da":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/da"),
        import("@formatjs/intl-datetimeformat/locale-data/da"),
        import("@formatjs/intl-displaynames/locale-data/da"),
        import("@formatjs/intl-listformat/locale-data/da"),
      ]);
      break;
    case "de":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/de"),
        import("@formatjs/intl-datetimeformat/locale-data/de"),
        import("@formatjs/intl-displaynames/locale-data/de"),
        import("@formatjs/intl-listformat/locale-data/de"),
      ]);
      break;
    case "el":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/el"),
        import("@formatjs/intl-datetimeformat/locale-data/el"),
        import("@formatjs/intl-displaynames/locale-data/el"),
        import("@formatjs/intl-listformat/locale-data/el"),
      ]);
      break;
    case "eo":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/eo"),
        import("@formatjs/intl-datetimeformat/locale-data/eo"),
        import("@formatjs/intl-displaynames/locale-data/eo"),
        import("@formatjs/intl-listformat/locale-data/eo"),
      ]);
      break;
    case "es":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/es"),
        import("@formatjs/intl-datetimeformat/locale-data/es"),
        import("@formatjs/intl-displaynames/locale-data/es"),
        import("@formatjs/intl-listformat/locale-data/es"),
      ]);
      break;
    case "et":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/et"),
        import("@formatjs/intl-datetimeformat/locale-data/et"),
        import("@formatjs/intl-displaynames/locale-data/et"),
        import("@formatjs/intl-listformat/locale-data/et"),
      ]);
      break;
    case "eu":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/eu"),
        import("@formatjs/intl-datetimeformat/locale-data/eu"),
        import("@formatjs/intl-displaynames/locale-data/eu"),
        import("@formatjs/intl-listformat/locale-data/eu"),
      ]);
      break;
    case "fa":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/fa"),
        import("@formatjs/intl-datetimeformat/locale-data/fa"),
        import("@formatjs/intl-displaynames/locale-data/fa"),
        import("@formatjs/intl-listformat/locale-data/fa"),
      ]);
      break;
    case "fi":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/fi"),
        import("@formatjs/intl-datetimeformat/locale-data/fi"),
        import("@formatjs/intl-displaynames/locale-data/fi"),
        import("@formatjs/intl-listformat/locale-data/fi"),
      ]);
      break;
    case "fr":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/fr"),
        import("@formatjs/intl-datetimeformat/locale-data/fr"),
        import("@formatjs/intl-displaynames/locale-data/fr"),
        import("@formatjs/intl-listformat/locale-data/fr"),
      ]);
      break;
    case "ga":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ga"),
        import("@formatjs/intl-datetimeformat/locale-data/ga"),
        import("@formatjs/intl-displaynames/locale-data/ga"),
        import("@formatjs/intl-listformat/locale-data/ga"),
      ]);
      break;
    case "gd":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/gd"),
        import("@formatjs/intl-datetimeformat/locale-data/gd"),
        import("@formatjs/intl-displaynames/locale-data/gd"),
        import("@formatjs/intl-listformat/locale-data/gd"),
      ]);
      break;
    case "gl":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/gl"),
        import("@formatjs/intl-datetimeformat/locale-data/gl"),
        import("@formatjs/intl-displaynames/locale-data/gl"),
        import("@formatjs/intl-listformat/locale-data/gl"),
      ]);
      break;
    case "he":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/he"),
        import("@formatjs/intl-datetimeformat/locale-data/he"),
        import("@formatjs/intl-displaynames/locale-data/he"),
        import("@formatjs/intl-listformat/locale-data/he"),
      ]);
      break;
    case "hi":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/hi"),
        import("@formatjs/intl-datetimeformat/locale-data/hi"),
        import("@formatjs/intl-displaynames/locale-data/hi"),
        import("@formatjs/intl-listformat/locale-data/hi"),
      ]);
      break;
    case "hr":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/hr"),
        import("@formatjs/intl-datetimeformat/locale-data/hr"),
        import("@formatjs/intl-displaynames/locale-data/hr"),
        import("@formatjs/intl-listformat/locale-data/hr"),
      ]);
      break;
    case "hu":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/hu"),
        import("@formatjs/intl-datetimeformat/locale-data/hu"),
        import("@formatjs/intl-displaynames/locale-data/hu"),
        import("@formatjs/intl-listformat/locale-data/hu"),
      ]);
      break;
    case "id":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/id"),
        import("@formatjs/intl-datetimeformat/locale-data/id"),
        import("@formatjs/intl-displaynames/locale-data/id"),
        import("@formatjs/intl-listformat/locale-data/id"),
      ]);
      break;
    case "it":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/it"),
        import("@formatjs/intl-datetimeformat/locale-data/it"),
        import("@formatjs/intl-displaynames/locale-data/it"),
        import("@formatjs/intl-listformat/locale-data/it"),
      ]);
      break;
    case "ja":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ja"),
        import("@formatjs/intl-datetimeformat/locale-data/ja"),
        import("@formatjs/intl-displaynames/locale-data/ja"),
        import("@formatjs/intl-listformat/locale-data/ja"),
      ]);
      break;
    case "ka":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ka"),
        import("@formatjs/intl-datetimeformat/locale-data/ka"),
        import("@formatjs/intl-displaynames/locale-data/ka"),
        import("@formatjs/intl-listformat/locale-data/ka"),
      ]);
      break;
    case "kk":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/kk"),
        import("@formatjs/intl-datetimeformat/locale-data/kk"),
        import("@formatjs/intl-displaynames/locale-data/kk"),
        import("@formatjs/intl-listformat/locale-data/kk"),
      ]);
      break;
    case "kn":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/kn"),
        import("@formatjs/intl-datetimeformat/locale-data/kn"),
        import("@formatjs/intl-displaynames/locale-data/kn"),
        import("@formatjs/intl-listformat/locale-data/kn"),
      ]);
      break;
    case "ko":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ko"),
        import("@formatjs/intl-datetimeformat/locale-data/ko"),
        import("@formatjs/intl-displaynames/locale-data/ko"),
        import("@formatjs/intl-listformat/locale-data/ko"),
      ]);
      break;
    case "ku":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ku"),
        import("@formatjs/intl-datetimeformat/locale-data/ku"),
        import("@formatjs/intl-displaynames/locale-data/ku"),
        import("@formatjs/intl-listformat/locale-data/ku"),
      ]);
      break;
    case "ky":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ky"),
        import("@formatjs/intl-datetimeformat/locale-data/ky"),
        import("@formatjs/intl-displaynames/locale-data/ky"),
        import("@formatjs/intl-listformat/locale-data/ky"),
      ]);
      break;
    case "lt":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/lt"),
        import("@formatjs/intl-datetimeformat/locale-data/lt"),
        import("@formatjs/intl-displaynames/locale-data/lt"),
        import("@formatjs/intl-listformat/locale-data/lt"),
      ]);
      break;
    case "lv":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/lv"),
        import("@formatjs/intl-datetimeformat/locale-data/lv"),
        import("@formatjs/intl-displaynames/locale-data/lv"),
        import("@formatjs/intl-listformat/locale-data/lv"),
      ]);
      break;
    case "ml":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ml"),
        import("@formatjs/intl-datetimeformat/locale-data/ml"),
        import("@formatjs/intl-displaynames/locale-data/ml"),
        import("@formatjs/intl-listformat/locale-data/ml"),
      ]);
      break;
    case "mr":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/mr"),
        import("@formatjs/intl-datetimeformat/locale-data/mr"),
        import("@formatjs/intl-displaynames/locale-data/mr"),
        import("@formatjs/intl-listformat/locale-data/mr"),
      ]);
      break;
    case "ms":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ms"),
        import("@formatjs/intl-datetimeformat/locale-data/ms"),
        import("@formatjs/intl-displaynames/locale-data/ms"),
        import("@formatjs/intl-listformat/locale-data/ms"),
      ]);
      break;
    case "nb":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/nb"),
        import("@formatjs/intl-datetimeformat/locale-data/nb"),
        import("@formatjs/intl-displaynames/locale-data/nb"),
        import("@formatjs/intl-listformat/locale-data/nb"),
      ]);
      break;
    case "nl":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/nl"),
        import("@formatjs/intl-datetimeformat/locale-data/nl"),
        import("@formatjs/intl-displaynames/locale-data/nl"),
        import("@formatjs/intl-listformat/locale-data/nl"),
      ]);
      break;
    case "no":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/no"),
        import("@formatjs/intl-datetimeformat/locale-data/no"),
        import("@formatjs/intl-displaynames/locale-data/no"),
        import("@formatjs/intl-listformat/locale-data/no"),
      ]);
      break;
    case "pa":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/pa"),
        import("@formatjs/intl-datetimeformat/locale-data/pa"),
        import("@formatjs/intl-displaynames/locale-data/pa"),
        import("@formatjs/intl-listformat/locale-data/pa"),
      ]);
      break;
    case "pl":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/pl"),
        import("@formatjs/intl-datetimeformat/locale-data/pl"),
        import("@formatjs/intl-displaynames/locale-data/pl"),
        import("@formatjs/intl-listformat/locale-data/pl"),
      ]);
      break;
    case "pt":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/pt"),
        import("@formatjs/intl-datetimeformat/locale-data/pt"),
        import("@formatjs/intl-displaynames/locale-data/pt"),
        import("@formatjs/intl-listformat/locale-data/pt"),
      ]);
      break;
    case "ro":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ro"),
        import("@formatjs/intl-datetimeformat/locale-data/ro"),
        import("@formatjs/intl-displaynames/locale-data/ro"),
        import("@formatjs/intl-listformat/locale-data/ro"),
      ]);
      break;
    case "ru":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ru"),
        import("@formatjs/intl-datetimeformat/locale-data/ru"),
        import("@formatjs/intl-displaynames/locale-data/ru"),
        import("@formatjs/intl-listformat/locale-data/ru"),
      ]);
      break;
    case "si":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/si"),
        import("@formatjs/intl-datetimeformat/locale-data/si"),
        import("@formatjs/intl-displaynames/locale-data/si"),
        import("@formatjs/intl-listformat/locale-data/si"),
      ]);
      break;
    case "sk":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/sk"),
        import("@formatjs/intl-datetimeformat/locale-data/sk"),
        import("@formatjs/intl-displaynames/locale-data/sk"),
        import("@formatjs/intl-listformat/locale-data/sk"),
      ]);
      break;
    case "sl":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/sl"),
        import("@formatjs/intl-datetimeformat/locale-data/sl"),
        import("@formatjs/intl-displaynames/locale-data/sl"),
        import("@formatjs/intl-listformat/locale-data/sl"),
      ]);
      break;
    case "so":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/so"),
        import("@formatjs/intl-datetimeformat/locale-data/so"),
        import("@formatjs/intl-displaynames/locale-data/so"),
        import("@formatjs/intl-listformat/locale-data/so"),
      ]);
      break;
    case "sq":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/sq"),
        import("@formatjs/intl-datetimeformat/locale-data/sq"),
        import("@formatjs/intl-displaynames/locale-data/sq"),
        import("@formatjs/intl-listformat/locale-data/sq"),
      ]);
      break;
    case "sr":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/sr"),
        import("@formatjs/intl-datetimeformat/locale-data/sr"),
        import("@formatjs/intl-displaynames/locale-data/sr"),
        import("@formatjs/intl-listformat/locale-data/sr"),
      ]);
      break;
    case "sv":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/sv"),
        import("@formatjs/intl-datetimeformat/locale-data/sv"),
        import("@formatjs/intl-displaynames/locale-data/sv"),
        import("@formatjs/intl-listformat/locale-data/sv"),
      ]);
      break;
    case "sw":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/sw"),
        import("@formatjs/intl-datetimeformat/locale-data/sw"),
        import("@formatjs/intl-displaynames/locale-data/sw"),
        import("@formatjs/intl-listformat/locale-data/sw"),
      ]);
      break;
    case "ta":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ta"),
        import("@formatjs/intl-datetimeformat/locale-data/ta"),
        import("@formatjs/intl-displaynames/locale-data/ta"),
        import("@formatjs/intl-listformat/locale-data/ta"),
      ]);
      break;
    case "te":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/te"),
        import("@formatjs/intl-datetimeformat/locale-data/te"),
        import("@formatjs/intl-displaynames/locale-data/te"),
        import("@formatjs/intl-listformat/locale-data/te"),
      ]);
      break;
    case "th":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/th"),
        import("@formatjs/intl-datetimeformat/locale-data/th"),
        import("@formatjs/intl-displaynames/locale-data/th"),
        import("@formatjs/intl-listformat/locale-data/th"),
      ]);
      break;
    // case "tl":
    //   await Promise.all([
    //     import("@formatjs/intl-pluralrules/locale-data/tl"),
    //     import("@formatjs/intl-datetimeformat/locale-data/tl"),
    //     import("@formatjs/intl-displaynames/locale-data/tl"),
    //     import("@formatjs/intl-listformat/locale-data/tl"),
    //   ]);
    //   break;
    case "tr":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/tr"),
        import("@formatjs/intl-datetimeformat/locale-data/tr"),
        import("@formatjs/intl-displaynames/locale-data/tr"),
        import("@formatjs/intl-listformat/locale-data/tr"),
      ]);
      break;
    case "uk":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/uk"),
        import("@formatjs/intl-datetimeformat/locale-data/uk"),
        import("@formatjs/intl-displaynames/locale-data/uk"),
        import("@formatjs/intl-listformat/locale-data/uk"),
      ]);
      break;
    case "ur":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/ur"),
        import("@formatjs/intl-datetimeformat/locale-data/ur"),
        import("@formatjs/intl-displaynames/locale-data/ur"),
        import("@formatjs/intl-listformat/locale-data/ur"),
      ]);
      break;
    case "uz":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/uz"),
        import("@formatjs/intl-datetimeformat/locale-data/uz"),
        import("@formatjs/intl-displaynames/locale-data/uz"),
        import("@formatjs/intl-listformat/locale-data/uz"),
      ]);
      break;
    case "vi":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/vi"),
        import("@formatjs/intl-datetimeformat/locale-data/vi"),
        import("@formatjs/intl-displaynames/locale-data/vi"),
        import("@formatjs/intl-listformat/locale-data/vi"),
      ]);
      break;
    case "zh":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/zh"),
        import("@formatjs/intl-datetimeformat/locale-data/zh"),
        import("@formatjs/intl-displaynames/locale-data/zh"),
        import("@formatjs/intl-listformat/locale-data/zh"),
      ]);
      break;
    case "zu":
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/zu"),
        import("@formatjs/intl-datetimeformat/locale-data/zu"),
        import("@formatjs/intl-displaynames/locale-data/zu"),
        import("@formatjs/intl-listformat/locale-data/zu"),
      ]);
      break;
    case "en":
    default:
      await Promise.all([
        import("@formatjs/intl-pluralrules/locale-data/en"),
        import("@formatjs/intl-datetimeformat/locale-data/en"),
        import("@formatjs/intl-displaynames/locale-data/en"),
        import("@formatjs/intl-listformat/locale-data/en"),
      ]);
      break;
  }
};