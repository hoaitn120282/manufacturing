# Internationalization (i18n) Implementation Guide

## Overview

This guide provides comprehensive documentation for the internationalization implementation in the Manufacturing ERP system. The system now supports multiple languages with dynamic switching capabilities.

## Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| English | `en` | 🇺🇸 | Complete |
| Vietnamese | `vi` | 🇻🇳 | Complete |
| Chinese (Simplified) | `zh` | 🇨🇳 | Complete |
| Spanish | `es` | 🇪🇸 | Partial |
| French | `fr` | 🇫🇷 | Partial |
| German | `de` | 🇩🇪 | Partial |

## Technology Stack

### Frontend
- **react-i18next**: React integration for i18next
- **i18next**: Main internationalization framework
- **i18next-browser-languagedetector**: Automatic language detection
- **i18next-http-backend**: Dynamic loading of translation files

### Backend
- **Database support**: User language preferences stored in database
- **API endpoints**: Profile management with language settings

## File Structure

```
frontend/src/
├── i18n/
│   ├── index.js                    # Main i18n configuration
│   └── locales/
│       ├── en.json                 # English translations (base)
│       ├── vi.json                 # Vietnamese translations
│       ├── zh.json                 # Chinese translations
│       ├── es.json                 # Spanish translations
│       ├── fr.json                 # French translations
│       └── de.json                 # German translations
├── components/
│   └── common/
│       └── LanguageSwitcher.js     # Language switching component
├── hooks/
│   └── useTranslation.js           # Custom translation hook
└── pages/
    ├── LoginPage.js                # Updated with translations
    ├── ProfilePage.js              # Updated with language settings
    └── [other pages...]            # To be updated with translations
```

## Key Features

### 1. Language Switcher Component

Located in `src/components/common/LanguageSwitcher.js`

- **Dropdown menu** with flag icons and native language names
- **Real-time switching** without page reload
- **Persistent selection** saved to localStorage
- **Visual feedback** showing current language

#### Usage:
```jsx
import LanguageSwitcher from '../components/common/LanguageSwitcher';

// In your component
<LanguageSwitcher />
```

### 2. Translation Keys Structure

All translation keys are organized into logical namespaces:

- **common**: Shared UI elements (buttons, labels, etc.)
- **navigation**: Menu items and navigation elements
- **auth**: Authentication related text
- **dashboard**: Dashboard specific content
- **[module]**: Each module has its own namespace (production, inventory, etc.)
- **errors**: Error messages
- **success**: Success messages
- **language**: Language-related text

#### Example:
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "navigation": {
    "dashboard": "Dashboard",
    "production": "Production"
  }
}
```

### 3. Using Translations in Components

#### Basic Usage:
```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
};
```

#### With Interpolation:
```jsx
const message = t('welcome.message', { name: user.name });
```

#### With Default Values:
```jsx
const text = t('optional.key', 'Default text if translation missing');
```

### 4. Custom Translation Hook

Located in `src/hooks/useTranslation.js`

Provides additional utilities:

```jsx
import useAppTranslation from '../hooks/useTranslation';

const MyComponent = () => {
  const { 
    t, 
    changeLanguage, 
    getCurrentLanguage, 
    hasTranslation 
  } = useAppTranslation();

  const handleLanguageChange = async (lang) => {
    const success = await changeLanguage(lang);
    if (success) {
      console.log('Language changed successfully');
    }
  };

  return (
    // Component JSX
  );
};
```

## Configuration

### i18n Configuration (`src/i18n/index.js`)

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      vi: { translation: viTranslations },
      // ... other languages
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });
```

### Language Detection

The system automatically detects user language preferences in this order:

1. **localStorage**: Previously saved user preference
2. **navigator**: Browser language setting
3. **htmlTag**: HTML lang attribute
4. **fallback**: English (default)

## Backend Integration

### User Model Updates

The User model now includes a `language` field:

```javascript
language: {
  type: DataTypes.STRING,
  defaultValue: 'en',
  validate: {
    isIn: [['en', 'vi', 'zh', 'es', 'fr', 'de']]
  }
}
```

### API Endpoints

#### Update User Language Preference

**Endpoint**: `PUT /api/auth/profile`

**Request Body**:
```json
{
  "language": "vi",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "language": "vi",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

## Implementation Status

### Completed Components

- ✅ **LanguageSwitcher**: Fully functional dropdown component
- ✅ **LoginPage**: Complete translation integration
- ✅ **Layout**: Navigation menu and header translated
- ✅ **ProfilePage**: Language preference settings
- ✅ **Backend API**: User language preference support

### Pending Components

- ⏳ **Dashboard**: Charts and statistics
- ⏳ **Production Pages**: Work orders, scheduling
- ⏳ **Inventory Pages**: Items, categories, warehouses
- ⏳ **Sales Pages**: Orders, customers, products
- ⏳ **Quality Pages**: Inspections, tests
- ⏳ **Maintenance Pages**: Equipment, schedules
- ⏳ **HRM Pages**: Employees, departments
- ⏳ **Finance Pages**: Accounts, transactions
- ⏳ **Procurement Pages**: Suppliers, purchase orders
- ⏳ **Integration Pages**: APIs, connections
- ⏳ **Reports Pages**: Report generation
- ⏳ **Users Pages**: User management

## Adding New Languages

### 1. Create Translation File

Create a new JSON file in `src/i18n/locales/[lang_code].json`:

```json
{
  "common": {
    "save": "Save in New Language",
    "cancel": "Cancel in New Language"
  }
  // ... add all required translations
}
```

### 2. Update i18n Configuration

Add the new language to `src/i18n/index.js`:

```javascript
import newLangTranslations from './locales/new_lang.json';

const resources = {
  // ... existing languages
  new_lang: {
    translation: newLangTranslations
  }
};
```

### 3. Update Language Switcher

Add the new language option to `LanguageSwitcher.js`:

```javascript
const languages = [
  // ... existing languages
  {
    code: 'new_lang',
    name: 'New Language',
    flag: '🏳️',
    nativeName: 'Native Name'
  }
];
```

### 4. Update Backend Validation

Update the User model validation in `backend/models/User.js`:

```javascript
language: {
  type: DataTypes.STRING,
  defaultValue: 'en',
  validate: {
    isIn: [['en', 'vi', 'zh', 'es', 'fr', 'de', 'new_lang']]
  }
}
```

## Best Practices

### 1. Translation Key Naming

- Use **dot notation** for hierarchical organization
- Use **descriptive names**: `user.profile.updateSuccess` vs `msg1`
- Group related translations: `errors.*`, `success.*`
- Keep keys **lowercase** with **camelCase** for clarity

### 2. Translation Content

- Keep translations **concise** but **clear**
- Maintain **consistent terminology** across the application
- Consider **cultural context** for different regions
- Use **placeholder variables** for dynamic content

### 3. Component Integration

- Import translations **at the component level**
- Use **destructuring** for cleaner code: `const { t } = useTranslation()`
- Provide **fallback text** for missing translations
- Test all language combinations

### 4. Performance Considerations

- Translation files are **loaded on demand**
- Use **namespaces** to split large translation files
- Consider **lazy loading** for rarely used languages
- Cache translations in **localStorage**

## Testing

### Manual Testing Checklist

- [ ] Language switcher displays correctly in header
- [ ] Language switcher works on login page
- [ ] All menu items translate properly
- [ ] Profile page language setting persists
- [ ] Page refresh maintains selected language
- [ ] Forms validate in all languages
- [ ] Error messages display in correct language
- [ ] Success messages display in correct language

### Automated Testing

```javascript
// Example test for translation functionality
describe('Internationalization', () => {
  it('should change language when selected', async () => {
    // Test language switching
    await changeLanguage('vi');
    expect(t('common.save')).toBe('Lưu');
  });

  it('should persist language selection', () => {
    // Test localStorage persistence
    localStorage.setItem('i18nextLng', 'zh');
    // Reload and verify
  });
});
```

## Troubleshooting

### Common Issues

1. **Translation not appearing**: Check key spelling and namespace
2. **Language not persisting**: Verify localStorage is enabled
3. **Fallback not working**: Check fallbackLng configuration
4. **Performance issues**: Consider splitting large translation files

### Debug Mode

Enable debug mode in development:

```javascript
i18n.init({
  debug: process.env.NODE_ENV === 'development',
  // ... other options
});
```

## Future Enhancements

### Planned Features

1. **Right-to-Left (RTL) support** for Arabic/Hebrew
2. **Pluralization rules** for complex grammar
3. **Date/time localization** with moment.js
4. **Number formatting** for currencies
5. **Dynamic translation loading** from API
6. **Translation management system** for non-developers
7. **Automated translation** using AI services
8. **Context-aware translations** based on user role

### Integration Opportunities

1. **CMS integration** for dynamic content
2. **Analytics** for language usage tracking
3. **A/B testing** for translation effectiveness
4. **User feedback** system for translation quality
5. **Professional translation services** API integration

## Conclusion

The internationalization system provides a robust foundation for multi-language support in the Manufacturing ERP system. The modular architecture allows for easy addition of new languages and seamless integration with existing components.

For questions or contributions, please refer to the development team or create an issue in the project repository.
