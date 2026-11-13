/**
 * Utilitaire pour extraire dynamiquement les champs traduits de la base de données.
 * @param {Object} item - L'objet backend (ex: hotel, restaurant)
 * @param {String} fieldName - Le champ de base (ex: 'description')
 * @param {String} language - Le code langue i18n (ex: 'fr', 'en', 'ar')
 * @returns {String} Le texte traduit correspondant, ou fallback
 */
export const getTranslatedField = (item, fieldName, language) => {
  if (!item) return '';

  const capitalLang = language.charAt(0).toUpperCase() + language.slice(1);
  const langKeyCamel = `${fieldName}${capitalLang}`; // descriptionAr
  const langKeySnake = `${fieldName}_${language}`;   // description_ar

  // Renvoie d'abord la clé formatée, sinon la clé traduite native de l'objet, sinon fallback sur le champ par défaut
  return item[langKeyCamel] || item[langKeySnake] || item[fieldName] || '';
};
