import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'it', 'fr', 'hi', 'si'],
  defaultLocale: 'en',
});
