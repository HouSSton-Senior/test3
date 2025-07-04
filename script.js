// Глобальные переменные
let arcanaBaseData = []; // Данные из base.json
let arcanaMeaningsData = []; // Данные из ind.json/shadow.json/karma.json
let currentDay, currentMonth, currentYear;
let currentSpreadType = 'individual';
let currentJsonFile = 'ind.json';

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Загружаем базовые названия арканов
    await loadBaseData();
    
    // 2. Настраиваем календарь и обработчики
    initDatePicker();
    setupEventListeners();
});

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

// Инициализация календаря (flatpickr)
function initDatePicker() {
    flatpickr("#birthDate", {
        dateFormat: "d.m.Y",
        maxDate: "today",
        locale: "ru",
        allowInput: true,
        onReady: function(instance) {
            instance.input.removeAttribute('readonly');
            instance.input.addEventListener('input', function(e) {
                // Форматирование ввода ДД.ММ.ГГГГ
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

// Создание карточек на странице
function createCardsLayout(spreadType, positions) {
    const resultSection = document.getElementById('result');
    if (!resultSection) return;
    
    resultSection.innerHTML = '<div class="cards-grid"></div>';
    const cardsGrid = resultSection.querySelector('.cards-grid');
    
    getCardDefinitions(spreadType).forEach(cardDef => {
        const cardNum = positions[cardDef.position] || 0;
        const baseCard = arcanaBaseData.find(c => c.id === cardNum) || {};
        const meaningsCard = arcanaMeaningsData.find(c => c.id === cardNum) || {};
        const meaning = getCardMeaning(meaningsCard, cardDef.position, spreadType);
        
        const cardHTML = `
            <div class="card" id="pos${cardDef.position}-card">
                <h3>${cardDef.title}</h3>
                <p class="position-description">${cardDef.description}</p>
                <div class="full-description hidden">
                    <p>${cardDef.fullDescription || 'Описание отсутствует'}</p>
                </div>
                <button class="toggle-description">Показать описание</button>
                <div class="arcana-result">
                    <h4>${baseCard.name || 'Неизвестно'} <span class="arcana-number">${cardNum}</span></h4>
                    <p class="arcana-meaning"><strong>${meaning}</strong></p>
                    ${spreadType === 'shadow' ? 
                        `<p class="shadow-aspect"><em>Теневая сторона: ${meaningsCard.meanings?.shadow?.default || 'нет информации'}</em></p>` : ''}
                </div>
            </div>
        `;
        
        cardsGrid.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Добавляем обработчики для кнопок описания
    document.querySelectorAll('.toggle-description').forEach(btn => {
        btn.addEventListener('click', function() {
            const desc = this.previousElementSibling;
            if (desc.classList.contains('hidden')) {
                desc.classList.remove('hidden');
                this.textContent = 'Скрыть описание';
            } else {
                desc.classList.add('hidden');
                this.textContent = 'Показать описание';
            }
        });
    });
}

// Ваши заполненные карточки (оставьте без изменений!)
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

// Остальные функции (без изменений)
function getCardMeaning(card, position, spreadType) {
    if (!card?.meanings?.[spreadType]) return 'Нет данных';
    const meanings = card.meanings[spreadType];
    return meanings[position] || meanings.default || 'Нет описания';
}

function calculateAllPositions(day, month, year) {
  function calculateAllPositions(day, month, year) {
    // 1. Валидация входных данных
    day = Math.abs(Number(day)) || 1;
    month = Math.abs(Number(month)) || 1;
    year = Math.abs(Number(year)) || 2000;

    // 2. Базовые позиции
    const p1 = calculateCard(day);
    const p2 = calculateCard(month);
    const p3 = calculateCard([...String(year)].reduce((sum, d) => sum + Number(d), 0));

    // 3. Основные комбинации
    const p4 = calculateCard(p1 + p2);
    const p5 = calculateCard(p2 + p3);
    const p6 = calculateCard(p4 + p5);
    const p7 = calculateCard(p1 + p5);
    const p8 = calculateCard(p2 + p6);

    // 4. Дополнительные позиции
    const p12 = calculateCard(p7 + p8);
    const p13 = calculateCard(p1 + p4 + p6);
    const p14 = calculateCard(p3 + p5 + p6);
    const p19 = calculateCard(p4 + p6);
    const p20 = calculateCard(p5 + p6);
    const p21 = calculateCard(p1 + p2 + p3 + p4 + p5 + p6);

    // 5. Теневой портрет
    const p4_1 = calculateCard(p1 + p2);
    const p22 = calculateCard(p1 + p4);
    const p23 = calculateCard(p2 + p4);
    const p24 = calculateCard(p2 + p5);
    const p25 = calculateCard(p3 + p5);
    const p26 = calculateCard(p4 + p6);
    const p27 = calculateCard(p5 + p6);
    const p28 = calculateCard(p24 + p25);
    const p28_1 = calculateCard(p23 + p27);
    const p29 = calculateCard(p22 + p26);

    // 6. Кармический портрет
    const p2_1 = p2;
    const p9 = calculateCard(Math.abs(p1 - p2));
    const p10 = calculateCard(Math.abs(p2 - p3));
    const p11 = calculateCard(Math.abs(p9 - p10));
    const p15 = calculateCard(p9 + p10 + p11);
    const p15_1 = calculateCard((p9 + p10 + p11) - p7);
    const p16 = calculateCard(p1 + p4 + p5 + p3);
    const p17 = calculateCard(p11 + p6);
    const p18 = calculateCard(p11 + p8);

    // 7. Собираем все позиции в объект
    return {
        // Индивидуальный портрет
        1: p1, 2: p2, 3: p3, 4: p4, 5: p5, 6: p6,
        7: p7, 8: p8, 12: p12, 13: p13, 14: p14,
        19: p19, 20: p20, 21: p21,
        
        // Теневой портрет
        '4.1': p4_1, 22: p22, 23: p23, 24: p24,
        25: p25, 26: p26, 27: p27, 28: p28,
        '28.1': p28_1, 29: p29,
        
        // Кармический портрет
        '2.1': p2_1, 9: p9, 10: p10, 11: p11,
        15: p15, '15.1': p15_1, 16: p16,
        17: p17, 18: p18
    };
}

function calculateCard(num) {
    const result = num % 22;
    return result === 0 ? 22 : result;
}
}

function calculateCard(num) {
    return num % 22 || 0;
}

function isValidDate(dateStr) {
    const [d, m, y] = dateStr.split('.').map(Number);
    const date = new Date(y, m-1, d);
    return date.getDate() === d && date.getMonth() === m-1 && date.getFullYear() === y;
}

function updateTitle(spreadType) {
    const titles = {
        individual: '🔮 Индивидуальный портрет',
        shadow: '🌑 Теневой портрет',
        karma: '🔄 Кармический портрет'
    };
    document.querySelector('.container h1').textContent = titles[spreadType] || titles.individual;
}
