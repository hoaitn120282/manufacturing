import { useTranslation } from 'react-i18next';

// Custom hook wrapper for easier use and potential future enhancements
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();

  // Helper function to translate with default fallback
  const translate = (key, defaultValue = null, options = {}) => {
    const translation = t(key, options);
    
    // If translation is the same as key (not translated), return default if provided
    if (translation === key && defaultValue) {
      return defaultValue;
    }
    
    return translation;
  };

  // Helper function to change language with error handling
  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  };

  // Helper function to get current language info
  const getCurrentLanguage = () => {
    return {
      code: i18n.language,
      isRTL: i18n.dir() === 'rtl'
    };
  };

  // Helper function to check if a translation exists
  const hasTranslation = (key) => {
    return i18n.exists(key);
  };

  // Helper function to get all available languages
  const getAvailableLanguages = () => {
    return Object.keys(i18n.options.resources || {});
  };

  return {
    t: translate,
    i18n,
    changeLanguage,
    getCurrentLanguage,
    hasTranslation,
    getAvailableLanguages,
    isReady: i18n.isInitialized
  };
};

export default useAppTranslation;
