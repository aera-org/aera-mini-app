import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { it } from './locales/it';
import { pl } from './locales/pl';
import { ru } from './locales/ru';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'ru', 'es', 'fr', 'de', 'it', 'pl'],
  resources: { de, en, es, fr, it, pl, ru },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
