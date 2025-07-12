// version-tracker.js
let version = localStorage.getItem('tarot-version') || '0.1.1.1';

const updateVersion = () => {
  const parts = version.split('.');
  parts[3] = String(Number(parts[3]) + 1); // Увеличиваем последнюю цифру
  version = parts.join('.');
  localStorage.setItem('tarot-version', version);
  
  console.log(
    `%c🔮 Версия: ${version}\n` +
    `%cПоследнее изменение: ${new Date().toLocaleTimeString()}`,
    'color: #8a2be2; font-weight: bold;',
    'color: #777;'
  );
};

// Проверяем изменения при загрузке
document.addEventListener('DOMContentLoaded', () => {
  updateVersion();
});

// Для ручного обновления (по Ctrl+S)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    updateVersion();
  }
});
