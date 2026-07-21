import { createContext, useContext, useState, useCallback } from 'react';
import en from './en';
import hi from './hi';
import te from './te';
import ta from './ta';
import kn from './kn';
import mr from './mr';

const translations = { en, hi, te, ta, kn, mr };

export const languages = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
];

const I18nContext = createContext();

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
};

// Resolve nested keys like "nav.dashboard"
const getNestedValue = (obj, keyPath) => {
    return keyPath.split('.').reduce((acc, key) => {
        if (acc && typeof acc === 'object' && key in acc) {
            return acc[key];
        }
        return undefined;
    }, obj);
};

export const I18nProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        return localStorage.getItem('agriconnect_lang') || 'en';
    });

    const setLanguage = useCallback((lang) => {
        if (translations[lang]) {
            setLanguageState(lang);
            localStorage.setItem('agriconnect_lang', lang);
            document.documentElement.lang = lang;
        }
    }, []);

    // Translation function: t('key') or t('section.key')
    const t = useCallback((key, fallback) => {
        const currentTranslations = translations[language] || translations.en;
        const value = getNestedValue(currentTranslations, key);
        if (value !== undefined) return value;

        // Fallback to English
        if (language !== 'en') {
            const enValue = getNestedValue(translations.en, key);
            if (enValue !== undefined) return enValue;
        }

        // Return fallback or key itself
        return fallback || key;
    }, [language]);

    const value = {
        language,
        setLanguage,
        t,
        languages,
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
