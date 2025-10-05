#!/usr/bin/env node

/**
 * Translation Helper Script
 * 
 * This script helps manage translations in the ERP system:
 * - Find missing translation keys
 * - Check for unused translations
 * - Validate translation file structure
 * - Generate translation templates
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = path.join(__dirname, '..', 'src', 'i18n', 'locales');
const SRC_DIR = path.join(__dirname, '..', 'src');
const BASE_LANGUAGE = 'en';

// Supported languages
const SUPPORTED_LANGUAGES = ['en', 'vi', 'zh', 'es', 'fr', 'de'];

/**
 * Read all translation files
 */
function readTranslations() {
  const translations = {};
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const filePath = path.join(LOCALES_DIR, `${lang}.json`);
    if (fs.existsSync(filePath)) {
      try {
        translations[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (error) {
        console.error(`Error reading ${lang}.json:`, error.message);
        translations[lang] = {};
      }
    } else {
      translations[lang] = {};
    }
  });
  
  return translations;
}

/**
 * Get all translation keys from a nested object
 */
function getTranslationKeys(obj, prefix = '') {
  const keys = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      keys.push(...getTranslationKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Find all t() function calls in source files
 */
function findUsedTranslationKeys() {
  const usedKeys = new Set();
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx') || item.endsWith('.ts') || item.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Find t('key') and t("key") patterns
        const regex = /\bt\s*\(\s*['"`]([^'"`]+)['"`]/g;
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          usedKeys.add(match[1]);
        }
      }
    }
  }
  
  scanDirectory(SRC_DIR);
  return Array.from(usedKeys);
}

/**
 * Find missing translations
 */
function findMissingTranslations(translations) {
  const baseKeys = getTranslationKeys(translations[BASE_LANGUAGE]);
  const missing = {};
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    if (lang === BASE_LANGUAGE) return;
    
    const langKeys = getTranslationKeys(translations[lang]);
    missing[lang] = baseKeys.filter(key => !langKeys.includes(key));
  });
  
  return missing;
}

/**
 * Find unused translations
 */
function findUnusedTranslations(translations) {
  const usedKeys = findUsedTranslationKeys();
  const unused = {};
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    const langKeys = getTranslationKeys(translations[lang]);
    unused[lang] = langKeys.filter(key => !usedKeys.includes(key));
  });
  
  return unused;
}

/**
 * Validate translation file structure
 */
function validateTranslationStructure(translations) {
  const issues = [];
  const baseStructure = translations[BASE_LANGUAGE];
  
  SUPPORTED_LANGUAGES.forEach(lang => {
    if (lang === BASE_LANGUAGE) return;
    
    const langTranslations = translations[lang];
    
    function validateNested(base, current, path = '') {
      for (const [key, value] of Object.entries(base)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (!(key in current)) {
          issues.push(`Missing key in ${lang}: ${currentPath}`);
          continue;
        }
        
        if (typeof value === 'object' && value !== null) {
          if (typeof current[key] !== 'object' || current[key] === null) {
            issues.push(`Type mismatch in ${lang}: ${currentPath} (expected object)`);
          } else {
            validateNested(value, current[key], currentPath);
          }
        } else {
          if (typeof current[key] !== 'string') {
            issues.push(`Type mismatch in ${lang}: ${currentPath} (expected string)`);
          }
        }
      }
    }
    
    validateNested(baseStructure, langTranslations);
  });
  
  return issues;
}

/**
 * Generate template for a new language
 */
function generateLanguageTemplate(targetLang) {
  const baseTranslations = readTranslations()[BASE_LANGUAGE];
  
  function createTemplate(obj) {
    const template = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        template[key] = createTemplate(value);
      } else {
        template[key] = `[${targetLang.toUpperCase()}] ${value}`;
      }
    }
    
    return template;
  }
  
  const template = createTemplate(baseTranslations);
  const outputPath = path.join(LOCALES_DIR, `${targetLang}.json`);
  
  fs.writeFileSync(outputPath, JSON.stringify(template, null, 2), 'utf8');
  console.log(`✅ Generated template for ${targetLang} at ${outputPath}`);
}

/**
 * Main function
 */
function main() {
  const command = process.argv[2];
  
  console.log('🌍 Translation Helper Tool\\n');
  
  switch (command) {
    case 'check':
      console.log('📋 Checking translations...\\n');
      
      const translations = readTranslations();
      
      // Check missing translations
      const missing = findMissingTranslations(translations);
      console.log('🔍 Missing Translations:');
      for (const [lang, keys] of Object.entries(missing)) {
        if (keys.length > 0) {
          console.log(`  ${lang}: ${keys.length} missing keys`);
          keys.slice(0, 5).forEach(key => console.log(`    - ${key}`));
          if (keys.length > 5) {
            console.log(`    ... and ${keys.length - 5} more`);
          }
        } else {
          console.log(`  ${lang}: ✅ Complete`);
        }
      }
      
      console.log('\\n');
      
      // Check unused translations
      const unused = findUnusedTranslations(translations);
      console.log('🗑️  Unused Translations:');
      for (const [lang, keys] of Object.entries(unused)) {
        if (keys.length > 0) {
          console.log(`  ${lang}: ${keys.length} unused keys`);
          keys.slice(0, 5).forEach(key => console.log(`    - ${key}`));
          if (keys.length > 5) {
            console.log(`    ... and ${keys.length - 5} more`);
          }
        } else {
          console.log(`  ${lang}: ✅ All used`);
        }
      }
      
      console.log('\\n');
      
      // Validate structure
      const issues = validateTranslationStructure(translations);
      console.log('🔧 Structure Validation:');
      if (issues.length > 0) {
        console.log(`  ❌ ${issues.length} issues found:`);
        issues.slice(0, 10).forEach(issue => console.log(`    - ${issue}`));
        if (issues.length > 10) {
          console.log(`    ... and ${issues.length - 10} more`);
        }
      } else {
        console.log('  ✅ Structure is valid');
      }
      
      break;
      
    case 'template':
      const targetLang = process.argv[3];
      if (!targetLang) {
        console.log('❌ Please specify a language code: npm run translation template <lang>');
        process.exit(1);
      }
      
      generateLanguageTemplate(targetLang);
      break;
      
    case 'stats':
      const stats = readTranslations();
      console.log('📊 Translation Statistics:\\n');
      
      SUPPORTED_LANGUAGES.forEach(lang => {
        const keys = getTranslationKeys(stats[lang]);
        console.log(`  ${lang}: ${keys.length} translations`);
      });
      
      break;
      
    default:
      console.log('Usage:');
      console.log('  npm run translation check     - Check for missing/unused translations');
      console.log('  npm run translation template <lang> - Generate template for new language');
      console.log('  npm run translation stats     - Show translation statistics');
      break;
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  readTranslations,
  getTranslationKeys,
  findUsedTranslationKeys,
  findMissingTranslations,
  findUnusedTranslations,
  validateTranslationStructure,
  generateLanguageTemplate
};
