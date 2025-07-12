// Просто выводит версию без автообновления
const SITE_VERSION = '0.1.1.1'; 
console.log(
  `%c🔮 Версия: ${SITE_VERSION}\n` +
  `%cПоследнее изменение: ${document.lastModified}`,
  'color: #8a2be2; font-weight: bold;',
  'color: #777;'
);
