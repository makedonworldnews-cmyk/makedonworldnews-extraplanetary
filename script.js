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
// НОВА ФУНКЦИЈА ЗА СОЦИЈАЛНИ МРЕЖИ
function showSocial(network) {
    let url;
    switch(network) {
        case 'twitter':
        case 'x':
            url = 'https://x.com/makedonworldnew';
            break;
        // ... и сите други case-ови што ги дадов ...
        default:
            alert('Линкот за оваа мрежа сè уште не е конфигуриран.');
            return;
    }
    if (url) {
        window.open(url, '_blank');
    }
}
// Настройки за бескрајно скролување
let currentPage = 1;
const itemsPerPage = 20;

// Функција за вчитување на следната страница
function loadMoreNews() {
    // Пресметај кои вести да се прикажат
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = appState.allNewsItems.slice(startIndex, endIndex);
    
    // Прикажи ги тие вести
    itemsToShow.forEach(item => {
        item.style.display = 'block';
    });
    
    // Ажурирај го бројачот
    updateNewsCounter();
    currentPage++;
}

// Детектирај кога корисникот стигнал до дното
window.addEventListener('scroll', function() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;
    
    // Ако е близу до дното (на 100 пиксели), вчитај повеќе
    if (pageHeight - scrollPosition < 100) {
        loadMoreNews();
    }
});

// При старт, вчитај ја првата страница
document.addEventListener('DOMContentLoaded', function() {
    // ... вашиот постоечки код ...
    loadMoreNews(); // Додади го ова на крајот од постоечкиот DOMContentLoaded
});// ============================================
// СИСТЕМ ЗА БЕСКРАЈНО ЛИЗГАЊЕ (INFINITE SCROLL)
// ============================================

let currentPage = 1;
const itemsPerPage = 25; // Колку вести се вчитуваат секој пат
let isLoading = false;   // За да не се вчитуваат повеќе страници истовремено

// Функција за вчитување и приказ на следната страница со вести
function loadNextPage() {
    // Ако веќе се вчитува или нема повеќе вести, не прави ништо
    if (isLoading) return;
    if ((currentPage - 1) * itemsPerPage >= appState.allNewsItems.length) {
        // Може да се додаде порака "Нема повеќе вести"
        console.log('Сите вести се вчитани.');
        return;
    }
    
    isLoading = true;
    // Симулирај мала забава за подобро корисничко искуство
    setTimeout(() => {
        // Пресметај кои вести да се прикажат
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const nextItems = appState.allNewsItems.slice(startIndex, endIndex);
        
        // Прикажи ги следните вести
        nextItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Ажурирај го бројачот на видливи вести
        updateNewsCounter();
        
        currentPage++;
        isLoading = false;
        console.log(`Вчитана страница ${currentPage - 1}. Вкупно прикажано: ${Math.min(currentPage * itemsPerPage, appState.allNewsItems.length)} вести.`);
    }, 300); // 300ms забава за "реално" чувство
}

// Функција за откривање кога корисникот стигнал до дното на страницата
function setupInfiniteScroll() {
    // Додади слушач за scroll настан
    window.addEventListener('scroll', function() {
        // Пресметка: дали корисникот е близу до дното?
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        const threshold = 500; // Почни да вчитуваш кога е на 500px од дното
        
        if (pageHeight - scrollPosition < threshold) {
            loadNextPage();
        }
    });
    // Активирај бескрајно лизгање
setupInfiniteScroll();
    // Вчитај ја првата страница веднаш по вчитување
    loadNextPage();
}

// Функција за ресетирање на бескрајното лизгање при промена на филтер
function resetInfiniteScroll() {
    currentPage = 1;
    // Прво скриј ги сите вести
    appState.allNewsItems.forEach(item => {
        item.style.display = 'none';
    });
    // Потоа вчитај ги првите повторно
    loadNextPage();
}

// ============================================
// АКТИВИРАЈ ГО СИСТЕМОТ ЗА БЕСКРАЈНО ЛИЗГАЊЕ
// ============================================

// Додади ја иницијализацијата во главниот DOMContentLoaded слушач
// НАЈДЕТЕ ГО ВАШИОТ ПОСТОЕЧКИ 'DOMContentLoaded' слушач и ДОДАДЕТЕ ЈА ОВАА ЛИНИЈА НА КРАЈ ОД НЕГО:
// setupInfiniteScroll();
// (Опционално) 10. Функција за симулирање на акцијата "showSystemActivation"
function showSystemActivation() {
    resetAllFilters();
}
// (Опционално) 10. Функција за симулирање на акцијата "showSystemActivation"
function showSystemActivation() {
    // Оваа функција е заменета со resetAllFilters
    // Ја задржувам за компатибилност доколку некој друг код повикува
    resetAllFilters();
}
function resetAllFilters() {
    // Ресетирај го бескрајното лизгање
    resetInfiniteScroll();
    // ... останатиот постоечки код ...
