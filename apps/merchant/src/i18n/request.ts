import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type Locale } from "./config";

const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

function resolveLocaleFromHeaders(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const candidate = acceptLanguage.split(",")[0]?.split(";")[0]?.trim();
  if (!candidate) return defaultLocale;
  const base = candidate.toLowerCase().split("-")[0];
  return isLocale(base) ? base : defaultLocale;
}

export default getRequestConfig(async () => {
  const h = await headers();
  const resolvedLocale = resolveLocaleFromHeaders(h.get("accept-language"));

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  };
});
