import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      // Mapear variantes de español a 'es'
      convertDetectedLanguage: (lng) => {
        if (lng.startsWith('es-')) {
          return 'es';
        }
        return lng;
      },
      // Opciones de detección
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    ns: ['common', 'layout', 'home', 'mascotas', 'auth', 'rescate' ,'translation','suscripciones'],
    defaultNS: 'common',
  });

export default i18n;