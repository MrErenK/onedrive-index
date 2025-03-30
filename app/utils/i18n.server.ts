import Backend from "i18next-http-backend";
import { RemixI18Next } from "remix-i18next/server";
import i18n from "~/i18n";
import { languageCookie } from "./cookie.server";

const i18next = new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    cookie: languageCookie,
  },
  i18next: {
    ...i18n,
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
  },
  plugins: [Backend],
});

export default i18next;
