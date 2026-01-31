// ============================================
// MAKEDON WORLD NEWS - Интеракција и Филтрирање
// ============================================

// Главен објект за состојба на апликацијата
const appState = {
    activeTopic: null,
    activeRegion: null,
    allNewsItems: []
};

// 1. Функција за иницијализација при вчитување на страницата
document.addEventListener('DOMContentLoaded', function() {
    
    // Собира ги сите елементи со вести од DOM
    appState.allNewsItems = Array.from(document.querySelectorAll('.rss-item'));
    
    // Постави почетни филтри (Македонија & Најнови Вести)
    initializeDefaultFilters();
    
    // Додади слушачи за настани (клик) на сите теми
    const topicItems = document.querySelectorAll('.topic-item');
    topicItems.forEach(item => {
        item.addEventListener('click', function() {
            handleTopicClick(this);
        });
    });
    
    // Додади слушачи за настани (клик) на сите регионални икони
    const regionIcons = document.querySelectorAll('.region-icon');
    regionIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            handleRegionClick(this);
        });
    });
    
    // Додади слушач за копчето "АКТИВИРАЈ ГИ СИТЕ СИСТЕМИ"
    const activateBtn = document.querySelector('.btn[onclick*="showSystemActivation"]');
    if (activateBtn) {
        // Отстрани го постојниот inline onclick и замени го
        activateBtn.removeAttribute('onclick');
        activateBtn.addEventListener('click', resetAllFilters);
    }
    
    console.log('Makedon World News системот е иницијализиран!');
});

// 2. Поставување на почетни филтри (Македонија & Најнови Вести)
function initializeDefaultFilters() {
    // Активирај ја темата "Најнови Вести" (последната во листата)
    const latestNewsTopic = document.querySelector('.topic-item:nth-last-child(2)');
    if (latestNewsTopic) {
        handleTopicClick(latestNewsTopic, false); // false = не префилтрирај повторно
    }
    
    // Активирај ја иконата "Македонија" (веќе има active класа во HTML)
    const macedoniaIcon = document.querySelector('.region-icon.region-macedonia');
    if (macedoniaIcon) {
        handleRegionClick(macedoniaIcon, false); // false = не префилтрирај повторно
    }
    
    // При прво вчитување, филтрирај ги вестите за Балкан (соодветно за Македонија)
    filterNewsByRegion('Балкан');
}

// 3. Ракување со клик на тема
function handleTopicClick(clickedTopic, shouldFilterNews = true) {
    // Отстрани активна класа од сите теми
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Додади активна класа на кликнатата тема
    clickedTopic.classList.add('active');
    
    // Зачувај ја активната тема во состојбата
    const topicTitle = clickedTopic.querySelector('h4')?.textContent || clickedTopic.textContent;
    appState.activeTopic = topicTitle.trim();
    
    // Ажурирај го приказот (доколку е потребно филтрирање)
    if (shouldFilterNews) {
        updateNewsDisplay();
    }
    
    console.log(`Активна тема: ${appState.activeTopic}`);
}

// 4. Ракување со клик на регионална икона
function handleRegionClick(clickedIcon, shouldFilterNews = true) {
    // Отстрани активна класа од сите икони
    document.querySelectorAll('.region-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    // Додади активна класа на кликнатата икона
    clickedIcon.classList.add('active');
    
    // Зачувај го активниот регион во состојбата (користи го title атрибутот)
    const regionName = clickedIcon.getAttribute('title');
    appState.activeRegion = regionName;
    
    // Ажурирај го приказот (доколку е потребно филтрирање)
    if (shouldFilterNews) {
        filterNewsByRegion(regionName);
    }
    
    console.log(`Активен регион: ${appState.activeRegion}`);
}

// 5. Филтрирај ги вестите според регион
function filterNewsByRegion(regionName) {
    // Мапа за преведување на иконските title во текстот што се појавува во вестите
    const regionMap = {
        'Македонија': 'Балкан',
        'Балкан': 'Балкан',
        'Европа': 'Европска',
        'Азија': 'Азија',
        'Индија': 'Индија',
        'Африка': 'Африка',
        'Америка': 'Америка',
        'Австралија': 'Австралија',
        'Антарктик': 'Антарктик'
    };
    
    // Текст за филтрирање (според текстот во вестите)
    const filterText = regionMap[regionName] || regionName;
    
    // Филтрирај ги вестите
    appState.allNewsItems.forEach(newsItem => {
        const newsText = newsItem.textContent;
        // Прикажи ја веста ако содржи текст на филтер (регион)
        if (newsText.includes(filterText)) {
            newsItem.style.display = 'block';
        } else {
            newsItem.style.display = 'none';
        }
    });
    
    // Ажурирај го бројачот на "Вчитани Вести"
    updateNewsCounter();
}

// 6. Општа функција за ажурирање на приказот на вести (според тема И регион)
function updateNewsDisplay() {
    // Во оваа верзија, темите немаат ознаки во RSS вестите,
    // па за сега филтрирањето е само по регион.
    // Оваа функција е поставена за идна експанзија.
    
    if (appState.activeRegion) {
        filterNewsByRegion(appState.activeRegion);
    } else {
        // Ако нема активен регион, прикажи сите вести
        showAllNews();
    }
}

// 7. Прикажи сите вести (ресетирање на филтри)
function showAllNews() {
    appState.allNewsItems.forEach(newsItem => {
        newsItem.style.display = 'block';
    });
    updateNewsCounter();
    console.log('Сите филтри се ресетирани. Прикажани се сите вести.');
}

// 8. Ресетирање на сите филтри (се повикува од главното копче)
function resetAllFilters() {
    // Отстрани активна класа од сите теми
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Отстрани активна класа од сите икони
    document.querySelectorAll('.region-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    // Ресетирај ја состојбата
    appState.activeTopic = null;
    appState.activeRegion = null;
    
    // Прикажи сите вести
    showAllNews();
    
    // Врати го фокусот на Македонија и Најнови Вести (опционално)
    initializeDefaultFilters();
    
    alert('Сите системи се активирани! Филтрите се ресетирани.');
}

// 9. Ажурирање на бројачот "Вчитани Вести"
function updateNewsCounter() {
    const visibleNewsCount = appState.allNewsItems.filter(item => 
        item.style.display !== 'none'
    ).length;
    
    const counterElement = document.querySelector('.rss-counter');
    if (counterElement) {
        counterElement.textContent = visibleNewsCount;
    }
}

// (Опционално) 10. Функција за симулирање на акцијата "showSystemActivation"
function showSystemActivation() {
    // Оваа функција е заменета со resetAllFilters
    // Ја задржувам за компатибилност доколку некој друг код повикува
    resetAllFilters();
}
