
  // Расширенный набор символов (120 элементов)
  const symbols = [
    "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚻ", 
    "ᚾ", "ᚿ", "ᛁ", "ᛂ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛋ",
    "ᛌ", "ᛍ", "ᛎ", "ᛏ", "ᛐ", "ᛑ", "ᛒ", "ᛓ", "ᛔ", "ᛕ",
    "☉", "☿", "♀", "♁", "♂", "♃", "♄", "♅", "♆", "♇",
    "🜀", "🜁", "🜂", "🜃", "🜄", "🜅", "🜆", "🜇", "🜈", "🜉",
    "𓀀", "𓀁", "𓀂", "𓀃", "𓀄", "𓀅", "𓀆", "𓀇", "𓀈", "𓀉",
    "☥", "𓂀", "☤", "⚚", "🕉", "ॐ", "✡", "☯", "☮", "☸",
    "꧁", "꧂", "✺", "✹", "✸", "✷", "✶", "✵", "✴", "✳",
    "✲", "✱", "✰", "✦", "✧", "✩", "✪", "✫", "✬", "✭",
    "⚕", "⚖", "⚗", "⚘", "⚙", "⚚", "⚛", "⚜", "⚝", "⚞",
    "⚟", "⚠", "⚡", "⚢", "⚣", "⚤", "⚥", "⚦", "⚧", "⚨",
    "⚩", "⚪", "⚫", "⚬", "⚭", "⚮", "⚯", "⚰", "⚱", "⚲",
    "✡️","🔮","🜁","🜂","🜃","🜄","🜅","🜆","🜇","🜈",
    "⚕️","⚖️","🔯","🕉️","☥","☬","☸️","☯️","☦️","✝️",
    "☪️","☫️","☬️",
    "⚗️","🔱","🔺","🔻","🔸","🔹","🔶","🔷",
    "⚖️","⚙️","⚔️","⚰️","⚱️","⚖️",
    "🕎","✠","✡︎ ","✦ ","✧ ","✩ ","✪ ","✫ ","✬ ","✭ ",
    "☀️ ","🌙 ","⭐ ","✨ ",
    "🔥 ","💧 ","🌟 ","🌈 ","🌪️ ","🌊 ","🌬️ ",
    "🔮 ","📿 ","🧙‍♂️ ","🧙‍♀️ ","🧙‍♂️‍♀️ ","𓀀","𓁐","𓂀","𓃰","𓄿","𓅓",
    "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚻ",
    "ᚾ", "ᚿ", "ᛁ", "ᛂ", "ᛃ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛋ",
    "ᛌ", "ᛍ", "ᛎ", "ᛏ", "ᛐ", "ᛑ", "ᛒ", "ᛓ", "ᛔ", "ᛕ",
    "☉", "☿", "♀", "♁", "♂", "♃", "♄", "♅", "♆", "♇"
  ];

  const colors = [
    "#20c20e", "#ff0000", "#00a2ff", "#ffffff", 
    "#ffd700", "#9400d3", "#ff00ff", "#00ffff",
    "#4b0082", "#ff8c00", "#7cfc00", "#ff1493"
  ];

  const container = document.querySelector('.matrix-background');
  let symbolsCount = 0;
  const maxSymbols = 100; // количество отображаемых символов на экране 

   function createSymbol() {
  if (symbolsCount >= maxSymbols) return;
  
  const symbol = document.createElement('div');
  symbol.className = 'matrix-symbol';
  
  // Размер и прозрачность
  const size = Math.round((0.01 + Math.random() * 4.5) * 16); // менять размер символов. 
  const opacity = 0.4 + Math.random() * 0.6;

  // Генерация позиций (50% с краёв, 50% внутри экрана)
  let startX, startY;
  if (Math.random() > 0.5) {
    const edge = Math.floor(Math.random() * 4);
    const padding = 50;
    startX = edge % 2 ? 
      (edge === 1 ? window.innerWidth + padding : -padding) : 
      Math.random() * window.innerWidth;
    startY = edge % 2 ? 
      Math.random() * window.innerHeight : 
      (edge === 0 ? -padding : window.innerHeight + padding);
  } else {
    startX = Math.random() * window.innerWidth;
    startY = Math.random() * window.innerHeight;
  }

  // Случайное направление и скорость
  const angle = Math.random() * Math.PI * 2;
  const distance = 200 + Math.random() * 600;
  const duration = 4 + Math.random() * 8; // 4-12 секунд

  const endX = startX + Math.cos(angle) * distance;
  const endY = startY + Math.sin(angle) * distance;

  // Настройка элемента
  symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  symbol.style.cssText = `
    --symbol-size: ${size}px;
    --start-x: ${startX}px;
    --start-y: ${startY}px;
    --end-x: ${endX}px;
    --end-y: ${endY}px;
    --start-rotation: ${(Math.random() - 0.5) * 360}deg;
    --end-rotation: ${(Math.random() - 0.5) * 360}deg;
    --max-opacity: ${opacity};
    color: ${colors[Math.floor(Math.random() * colors.length)]};
    animation-duration: ${duration}s;
  `;

  container.appendChild(symbol);
  symbolsCount++;

  // Автоматический респавн при завершении анимации
  symbol.addEventListener('animationend', () => {
    symbol.remove();
    symbolsCount--;
    createSymbol(); // Создаём новый символ вместо исчезнувшего
  });
}
 // Инициализация
function startAnimation() {
  // Первоначальное заполнение
  for (let i = 0; i < 100; i++) createSymbol();
  
  // Постоянное добавление новых символов
  const intervalId = setInterval(createSymbol, 30);
  
  // Обработчик ресайза
  window.addEventListener('resize', () => {
    clearInterval(intervalId);
    document.querySelectorAll('.matrix-symbol').forEach(el => el.remove());
    symbolsCount = 0;
    startAnimation();
  });
}

startAnimation();