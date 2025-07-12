// Версия обновляется ТОЛЬКО через GitHub Actions
const SITE_VERSION = '0.1.1.6'; // <- Это значение будет меняться автоматически
console.log(
  `%c🔮 Версия: ${SITE_VERSION}\n` +
  `%cПоследнее обновление: ${document.lastModified || 'неизвестно'}`,
  'color: #8a2be2; font-weight: bold;',
  'color: #777;'
);
