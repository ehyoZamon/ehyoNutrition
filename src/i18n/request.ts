// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async (config) => {
  // Если config.locale окажется undefined, возьмется 'en'
  const locale = config.locale ?? 'en'; 

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});