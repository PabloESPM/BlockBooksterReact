/**
 * Formatea una cadena de fecha a un formato legible por humanos usando toLocaleDateString.
 *
 * @param {string} dateString
 * @param {string} locale
 * @param {object} options
 * @returns {string}
 */
export function formatDate(dateString, locale = 'es-ES', options = { day: 'numeric', month: 'short', year: 'numeric' }) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, options);
}
