// Глобальные переменные
let arcanaBaseData = []; // Данные из base.json n 
let arcanaMeaningsData = []; // Данные из ind.json/shadow.json/karma.json
let currentDay, currentMonth, currentYear;
let currentSpreadType = 'individual';
let currentJsonFile = 'ind.json';

//функция для нормализации работы шута с id0, но числом 22 
function getCardValue(id) {
    return id === 0 ? 22 : id; // Преобразует ID карты в числовое значение (Шут=0 → 22)
}
//конец этой функции

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Загружаем базовые названия арканов
    await loadBaseData();
    
    // 2. Настраиваем календарь и обработчики
    initDatePicker();
    setupEventListeners();
});

// 1. Вспомогательные функции ! 
// Упрощённая функция расчёта карты
function calculateCard(number, isYear = false) {
    let n = Math.abs(number);
    
    // Только для года: сумма цифр
    if (isYear) n = String(n).split('').reduce((sum, d) => sum + +d, 0);
    
    // Для всех случаев: вычитаем 22 если >22
    if (n > 22) n -= 22;
    return n === 22 ? 0 : n;
}

function isValidDate(dateStr) {
    const [d, m, y] = dateStr.split('.').map(Number);
    const date = new Date(y, m-1, d);
    return date.getDate() === d && date.getMonth() === m-1 && date.getFullYear() === y;
}

function getCardMeaning(card, position, spreadType) {
    if (!card?.meanings?.[spreadType]) return 'Нет данных';
    const meanings = card.meanings[spreadType];
    return meanings[position] || meanings.default || 'Нет описания';
}


// 2. Функции загрузки данных

// Загрузка base.json
async function loadBaseData() {
    try {
        const response = await fetch('data/base.json');
        if (!response.ok) throw new Error('Ошибка загрузки base.json');
        const data = await response.json();
        arcanaBaseData = data.arcana;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось загрузить базовые данные. Проверьте консоль.');
    }
}

// Загрузка ind.json/shadow.json/karma.json
async function loadMeaningsData(jsonFile) {
    try {
        const response = await fetch(`data/${jsonFile}`);
        if (!response.ok) throw new Error(`Ошибка загрузки ${jsonFile}`);
        const data = await response.json();
        arcanaMeaningsData = data.arcana;
        return true;
    } catch (error) {
        console.error('Ошибка:', error);
        alert(`Не удалось загрузить данные для ${jsonFile}`);
        return false;
    }
}


// 3. Функции работы с интерфейсом
// Инициализация календаря (flatpickr)
function initDatePicker() {
    const dateInput = document.getElementById('birthDate');
    if (!dateInput) {
        console.error('Элемент birthDate не найден!');
        return;
    }

    flatpickr(dateInput, {
        dateFormat: "d.m.Y",
        maxDate: "today",
        locale: "ru",
        allowInput: true,
        onReady: function(selectedDates, dateStr, instance) {
            if (instance?.input) {
                instance.input.removeAttribute('readonly');
                instance.input.addEventListener('input', function(e) {
                    let value = e.target.value.replace(/[^\d]/g, '');
                    let formatted = '';
                    for (let i = 0; i < value.length; i++) {
                        if (i === 2 || i === 4) formatted += '.';
                        formatted += value[i];
                        if (formatted.length >= 10) break;
                    }
                    e.target.value = formatted;
                    e.target.classList.toggle('error', !isValidDate(formatted));
                });
            }
        }
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение портретов
    document.querySelectorAll('.spread-card').forEach(card => {
        card.addEventListener('click', async function() {
            document.querySelectorAll('.spread-card').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            currentSpreadType = this.getAttribute('data-spread');
            currentJsonFile = this.getAttribute('data-json');
            updateTitle(currentSpreadType);
            
            await loadMeaningsData(currentJsonFile);
            
            // Перерасчёт, если дата уже введена
            const birthDate = document.getElementById('birthDate').value;
            if (birthDate && isValidDate(birthDate)) {
                calculatePortrait();
            }
        });
    });

    // Кнопка "Рассчитать"
    document.getElementById('calculateBtn')?.addEventListener('click', calculatePortrait);
    
    // Обработка Enter в поле даты
    document.getElementById('birthDate')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculatePortrait();
    });
}

function updateTitle(spreadType) {
    const titles = {
        individual: '🔮 Индивидуальный портрет',
        shadow: '🌑 Теневой портрет',
        karma: '🔄 Кармический портрет'
    };
    document.querySelector('.container h1').textContent = titles[spreadType] || titles.individual;
}

// 4. Основные функции расчета
// Функция для вычисления номера карты (аркана) из числа
function calculateAllPositions(day, month, year) {
    const positions = {};
    // Основные позиции
    positions[1] = calculateCard(day); // День
    positions[2] = calculateCard(month); // Месяц
   positions[3] = (() => {
        const sum = [...String(year)].reduce((s, d) => s + Number(d), 0);
        return sum > 22 ? sum - 22 : sum === 22 ? 0 : sum;
    })();

    // Индивидуальный портрет
    // производные 4-14
    positions[4] = calculateCard(positions[1] + positions[2]);
    positions[5] = calculateCard(positions[2] + positions[3]);
    positions[6] = calculateCard(positions[4] + positions[5]);
    positions[7] = calculateCard(positions[1] + positions[5]);
    positions[8] = calculateCard(positions[2] + positions[6]);
    positions[12] = calculateCard(positions[4] + positions[5] + positions[6]);
    positions[13] = calculateCard(positions[1] + positions[4] + positions[6]);
    positions[14] = calculateCard(positions[3] + positions[5] + positions[6]);
    // новые позиции, которые добавлены 08.07 после анализа формул. 
    positions[19] = calculateCard(positions[4] + positions[6]);
    positions[20] = calculateCard(positions[5] + positions[6] + positions[7]);
    positions[21] = calculateCard(positions[1] + positions[2] + positions[3]+ positions[4]+ positions[5]+ positions[6]);

    // Теневой портрет
    positions['4.1'] = calculateCard(positions[1] + positions[2]);
    positions[22] = calculateCard(positions[1] + positions[4]);
    positions[23] = calculateCard(positions[2] + positions[4]);
    positions[24] = calculateCard(positions[2] + positions[5]);
    positions[25] = calculateCard(positions[3] + positions[5]);
    positions[26] = calculateCard(positions[4] + positions[6]);
    positions[27] = calculateCard(positions[5] + positions[6]);
    positions[28] = calculateCard(positions[24] + positions[25]);
    positions['28.1'] = calculateCard(positions[23] + positions[27]);
    positions[29] = calculateCard(positions[22] + positions[26]);

    // Кармический портрет
    positions['2.1'] = positions[2];
    positions[9] = calculateCard(Math.abs(positions[1] - positions[2]));
    positions[10] = calculateCard(Math.abs(positions[2] - positions[3]));
    positions[11] = calculateCard(
    Math.abs(getCardValue(positions[9]) - getCardValue(positions[10]))); //первая исправленная версия с шутом и магом на этих позициях. 
    positions[15] = calculateCard((positions[9] + positions[10] + positions[11]) - positions[7]); //!!!!!!!!!!!!!!
    positions['15.1'] = calculateCard(positions[9] + positions[10] + positions[11]); //!!!!!!!!!!
    positions[16] = calculateCard(positions[1] + positions[3] + positions[4] + positions[5]);
    positions[17] = calculateCard(positions[11] + positions[6]);
    positions[18] = calculateCard(positions[11] + positions[8]);

    return positions;    
}
// вот эта функция непонятная, но пускай пока будет. 
function calculateCard(number) {
    number = Math.abs(number);
    // Приводим число к диапазону 0-22
    while (number > 22) {
        number -= 22;
    }
    // Шут (22) становится 0
    return number === 22 ? 0 : number;
}
//вот тут она заканчивается. Если че - удалить нахуй. 
// Расчёт портрета
async function calculatePortrait() {
    const btn = document.getElementById('calculateBtn');
    if (!btn) return;
    
    btn.classList.add('loading');
    
    try {
        const dateStr = document.getElementById('birthDate').value;
        if (!dateStr || !isValidDate(dateStr)) {
            alert('Введите корректную дату в формате ДД.ММ.ГГГГ');
            return;
        }

        const startMessage = document.getElementById('startMessage'); // стартовое сообщение 
        if (startMessage) startMessage.classList.add('hidden'); // скрыть старт.сообщение
        
        const [day, month, year] = dateStr.split('.').map(Number);
        const positions = calculateAllPositions(day, month, year);
        createCardsLayout(currentSpreadType, positions);
        
    } catch (error) {
        console.error('Ошибка расчёта:', error);
        alert('Ошибка при расчёте портрета');
    } finally {
        btn.classList.remove('loading');
    }
}



function createCardsLayout(spreadType, positions) {
    const resultSection = document.getElementById('result');
    if (!resultSection) return;
    
    resultSection.innerHTML = '<div class="cards-grid"></div>';
    const cardsGrid = resultSection.querySelector('.cards-grid');

    getCardDefinitions(spreadType).forEach(cardDef => {
        let cardNum = positions[cardDef.position] || 0;
        const displayNum = cardNum === 0 ? 22 : cardNum;
        
        const baseCard = arcanaBaseData.find(c => c.id === cardNum) || {};
        const meaningsCard = arcanaMeaningsData.find(c => c.id === cardNum) || {};
        const meaning = getCardMeaning(meaningsCard, cardDef.position, spreadType);
        
        const cardHTML = `
            <div class="card" id="pos${cardDef.position}-card">
                <h3>${cardDef.title}</h3>
                <p class="position-description">${cardDef.description}</p>
                
                <div class="arcana-result">
                    <h4>${baseCard.name || 'Неизвестно'} <span class="arcana-number">${displayNum}</span></h4>
                    <div class="arcana-meaning-container">
                        <p class="arcana-meaning hidden"><strong>${meaning}</strong></p>
                        <button class="toggle-description">▼ Показать трактовку</button>
                    </div>
                </div>
            </div>
        `;
        
        cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Обработчики для кнопок
    document.querySelectorAll('.toggle-description').forEach(btn => {
        btn.addEventListener('click', function() {
            const meaning = this.parentElement.querySelector('.arcana-meaning');
            meaning.classList.toggle('hidden');
            this.textContent = meaning.classList.contains('hidden') 
                ? '▼ Показать трактовку' 
                : '▲ Скрыть трактовку';
        });
    });
} //здесь заканчивается функция для создания карточек. 

// Ваши заполненные карточки (оставьте без изменений!)
function getCardDefinitions(spreadType) {
const cardDefinitions = {
        individual: [
            { position: '1', title: '1. Детство и Юность (до 25 лет)', description: 'Базовая энергия', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '2', title: '2. Зрелость (25-40 лет)', description: 'Ключевой жизненный урок этого периода', fullDescription: 'Позиция 2 - Зрелость (25-40 лет). Уроки и Задачи этого воплощения.' },
            { position: '3', title: '3. Мудрость (40+ лет) Экзамен.', description: 'Итоговая мудрость и духовные достижения', fullDescription: 'Позиция 3 - Мудрость (40+ лет). Этот период связан с подведением итогов, передачей опыта и осмыслением прожитой жизни.' },
            { position: '4', title: '4. Подсознание, страхи и комплексы', description: 'Детские травмы и ограничивающие установки', fullDescription: 'Позиция 4 - Проблемная зона детства. Показывает основные трудности, с которыми вы столкнулись в детстве, и ограничивающие убеждения, сформированные в этот период. Эти проблемы могут влиять на вашу взрослую жизнь, пока вы не осознаете и не проработаете их' },
            { position: '5', title: '5. Сознание, цели, стремления', description: 'Вызовы и уроки старшего возраста', fullDescription: 'Позиция 5 - Треугольник Старости. Показывает основные вызовы и уроки, с которыми вы столкнётесь в пожилом возрасте. Это также может указывать на вашу кармическую задачу в отношении старшего поколения.' },
            { position: '6', title: '6. Сверхнознание и скрытие таланты', description: 'Незавершенные задачи из прошлых воплощений', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '7', title: '7. Миссия Воплощения', description: 'Миссия человека в этой жизни', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '8', title: '8. Дары свыше', description: 'Скрытые способности, которые нужно раскрыть', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '12', title: '12. Зоны Гармониик', description: 'Зоны гармонии и дисгармонии', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '13', title: '13. Внутреннее восприятие', description: 'Внутренняя самооценка', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '14', title: '14. Внешнее восприятие', description: 'Как вас воспринимают окружающие', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '19', title: '19. Неосознанный страх', description: 'Подсознательные блоки восприятия и страхи', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '20', title: '20. Экстренные условия', description: ' ЧП и помощь ВЫсших Сил вместе с вашими возможностями', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '21', title: '21. Максимум Жизни', description: 'Предельная точка, апофеоз возможностей', fullDescription: 'Позиция 1 - Базовая энергия.' }
        ],
        shadow: [
            { position: '4.1', title: '4.1 Детские и подростковые травмы', description: 'Ключевой жизненный урок этого периода', fullDescription: 'Позиция 4.1 - Детские травмы.' },
            { position: '22', title: '22. Влияние на подсознание', description: 'Позиция А', fullDescription: 'Показывает вытесненные события, влияющие на настоящее.' },
            { position: '23', title: '23. Детские травмы', description: 'Позиция В', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '24', title: '24. Приоритеты и потребности души', description: 'Позиция С', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '25', title: '25. Влияние на Сознание', description: 'Позиция D', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '26', title: '26. Неосознанный Талант и предрасположенность', description: 'Позиция Е', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '27', title: '27. Отвергаемое и непринятое .', description: 'Позиция F', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '28', title: '28. Первый путь достижения Максимума', description: 'Позиция G1', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '28.1', title: '28.1. Второй путь достижения Максимума', description: 'Позиция G2', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '29', title: '29. Точка "слива". Деструктив', description: 'Позиция H', fullDescription: 'Позиция 1 - Базовая энергия.' }
        ],
        karma: [
            { position: '2.1', title: '2.1. Зрелость (25-40 лет)', description: 'Ключевой жизненный урок этого периода', fullDescription: 'Позиция 2.1 - Кармические долги и задачи.' },
            { position: '9', title: '9. Прошлая жизнь', description: 'Кем был человек в прошлой жизни', fullDescription: 'Позиция 9 - Прошлая жизнь.' },
            { position: '10', title: '10. Род деятельности в прошлом', description: 'Какая профессия была у вас в прошлом', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '11', title: '11. Кармический долг', description: 'Задачи, которые тянутся с прошлой жизни', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '15', title: '15. Способы проработки кармы', description: 'Как выполнить прошлые задачи в этой жизни', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '15.1', title: '15.1. Позиция 15А. Кармическое прошлое.', description: 'Кем вы были в прошлом.', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '16', title: '16. Кармические "грабли"', description: 'Точка зацикленности уроков', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '17', title: '17. Зона психологического комфорта', description: 'Психологический комфорт в прошлой жизни и проблемы с ним', fullDescription: 'Позиция 1 - Базовая энергия.' },
            { position: '18', title: '18. Работа с Миссией.', description: 'Как выполнить миссию в этой жизни', fullDescription: 'Позиция 1 - Базовая энергия.' }
        ]
    };
    return cardDefinitions[spreadType] || [];
}

// Кнопка "Наверх" с улучшенной логикой
const backToTopBtn = document.getElementById('backToTopBtn');

// Плавное появление/исчезновение
window.addEventListener('scroll', () => {
  backToTopBtn.classList.toggle('visible', window.scrollY > 300);
});

// Плавный скролл с инерцией
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Микро-анимация при первом появлении
setTimeout(() => {
  backToTopBtn.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
}, 1000);



// тестовые функции для консоли

// Проверка для даты 07.07.1999

// =============================================
// ▲▲▲ КОНЕЦ БЛОКА ДЛЯ ВСТАВКИ ▲▲▲





