import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        welcome: 'Welcome',
        // Add more translations here
      },
    },
    uk: {
      translation: {
        welcome: 'Ласкаво просимо',
        // Add more translations here
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
