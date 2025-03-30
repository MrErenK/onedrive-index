export default {
  supportedLngs: ["en", "tr"],
  fallbackLng: "en",
  defaultNS: "common",
  detection: {
    order: ["htmlTag", "cookie", "navigator"],
    caches: ["cookie"],
  },
  react: {
    useSuspense: false,
  },
};
