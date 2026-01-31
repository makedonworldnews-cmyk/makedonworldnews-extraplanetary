// ============================================
// MAKEDON WORLD NEWS - Интеракција и Филтрирање
// ============================================

// Главен објект за состојба на апликацијата
const appState = {
    activeTopic: null,
    activeRegion: null,
    allNewsItems: []
};

// Променливи за бескрајно лизгање
let currentPage = 1;
const itemsPerPage = 25;
let isLoading = false;

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
        activateBtn.removeAttribute('onclick');
        activateBtn.addEventListener('click', resetAllFilters);
    }
    
    console.log('Makedon World News системот е иницијализиран!');
    
    // АКТИВИРАЈ БЕСКРАЈНО ЛИЗГАЊЕ ТУКА
    setupInfiniteScroll();
});

// 2. Поставување на почетни филтри (Македонија & Најнови Вести)
function initializeDefaultFilters() {
    const latestNewsTopic = document.querySelector('.topic-item:nth-last-child(2)');
    if (latestNewsTopic) {
        handleTopicClick(latestNewsTopic, false);
    }
    
    const macedoniaIcon = document.querySelector('.region-icon.region-macedonia');
    if (macedoniaIcon) {
        handleRegionClick(macedoniaIcon, false);
    }
    
    filterNewsByRegion('Балкан');
}

// 3. Ракување со клик на тема
function handleTopicClick(clickedTopic, shouldFilterNews = true) {
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('active');
    });
    
    clickedTopic.classList.add('active');
    const topicTitle = clickedTopic.querySelector('h4')?.textContent || clickedTopic.textContent;
    appState.activeTopic = topicTitle.trim();
    
    if (shouldFilterNews) {
        updateNewsDisplay();
    }
    console.log(`Активна тема: ${appState.activeTopic}`);
}

// 4. Ракување со клик на регионална икона
function handleRegionClick(clickedIcon, shouldFilterNews = true) {
    document.querySelectorAll('.region-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    clickedIcon.classList.add('active');
    const regionName = clickedIcon.getAttribute('title');
    appState.activeRegion = regionName;
    
    if (shouldFilterNews) {
        filterNewsByRegion(regionName);
    }
    console.log(`Активен регион: ${appState.activeRegion}`);
}

// 5. Филтрирај ги вестите според регион
function filterNewsByRegion(regionName) {
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
    
    const filterText = regionMap[regionName] || regionName;
    
    appState.allNewsItems.forEach(newsItem => {
        const newsText = newsItem.textContent;
        if (newsText.includes(filterText)) {
            newsItem.style.display = 'block';
        } else {
            newsItem.style.display = 'none';
        }
    });
    
    // Ресетирај ги страниците при нов филтер
    currentPage = 1;
    updateNewsCounter();
}

// 6. Општа функција за ажурирање на приказот на вести
function updateNewsDisplay() {
    if (appState.activeRegion) {
        filterNewsByRegion(appState.activeRegion);
    } else {
        showAllNews();
    }
}

// 7. Прикажи сите вести
function showAllNews() {
    appState.allNewsItems.forEach(newsItem => {
        newsItem.style.display = 'block';
    });
    updateNewsCounter();
    console.log('Сите филтри се ресетирани.');
}

// 8. Ресетирање на сите филтри
function resetAllFilters() {
    // Ресетирај го бескрајното лизгање
    resetInfiniteScroll();
    
    document.querySelectorAll('.topic-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelectorAll('.region-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    appState.activeTopic = null;
    appState.activeRegion = null;
    
    showAllNews();
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

// 10. Функција за социјални мрежи (дополнета)
function showSocial(network) {
    let url;
    switch(network) {
        case 'twitter':
        case 'x':
            url = 'https://x.com/makedonworldnew';
            break;
        case 'instagram':
            url = 'https://www.instagram.com/makedonworldnews?igsh=MW42bzR2bHl6OTdyeQ==';
            break;
        case 'facebook_page':
            url = 'https://www.facebook.com/share/17iEhWcYLD/';
            break;
        case 'tiktok':
            url = 'https://www.tiktok.com/@makedon.worldnews?_r=1&_t=ZM-93EhHJ9W';
            break;
        case 'youtube':
            url = 'https://youtube.com/@makedonworldnews?si=4VCLKHEMfxajUB9_';
            break;
        case 'linkedin':
        case 'truthsocial':
        case 'rumble':
        case 'academia':
        default:
            alert('Линкот за оваа мрежа сè уште не е конфигуриран.');
            return;
    }
    if (url) {
        window.open(url, '_blank');
    }
}

// ============================================
// СИСТЕМ ЗА БЕСКРАЈНО ЛИЗГАЊЕ (INFINITE SCROLL)
// ============================================

// Функција за вчитување на следната страница
function loadNextPage() {
    if (isLoading) return;
    if ((currentPage - 1) * itemsPerPage >= appState.allNewsItems.length) {
        console.log('Сите вести се вчитани.');
        return;
    }
    
    isLoading = true;
    setTimeout(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const nextItems = appState.allNewsItems.slice(startIndex, endIndex);
        
        nextItems.forEach(item => {
            item.style.display = 'block';
        });
        
        updateNewsCounter();
        currentPage++;
        isLoading = false;
        console.log(`Вчитана страница ${currentPage - 1}.`);
    }, 300);
}

// Функција за откривање на скрол
function setupInfiniteScroll() {
    window.addEventListener('scroll', function() {
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;
        const threshold = 500;
        
        if (pageHeight - scrollPosition < threshold) {
            loadNextPage();
        }
    });
    
    // Вчитај ја првата страница веднаш
    loadNextPage();
}

// Функција за ресетирање на бескрајното лизгање
function resetInfiniteScroll() {
    currentPage = 1;
    appState.allNewsItems.forEach(item => {
        item.style.display = 'none';
    });
    loadNextPage();
}
// ============================================
// КРАЕН ЕФЕКТ: ДИНАМИЧЕН СИСТЕМСКИ СТАТУС
// ============================================

function updateLiveStatus() {
    const statusElement = document.querySelector('.system-status-message'); // Ќе го создадеме подолу
    if (!statusElement) return;

    const messages = [
        "🟢 СИСТЕМОТ Е ЦЕЛОСНО АКТИВЕН И МОНИТОРИРА",
        "📡 ПРИМАМ ВЕСТИ ОД 1,334+ ИЗВОРИ",
        "🌍 ФИЛТРИРАМ СПОРЕД РЕГИОН ВО РЕАЛНО ВРЕМЕ",
        "🔄 АЖУРИРАЊЕТО ТЕЧЕ НОРМАЛНО",
        "✅ СИТЕ ФУНКЦИИ СЕ ОПЕРАТИВНИ"
    ];
    let currentIndex = 0;

    // Смени ја пораката на секои 3 секунди
    setInterval(() => {
        statusElement.textContent = messages[currentIndex];
        currentIndex = (currentIndex + 1) % messages.length;
    }, 3000);
}

// Вклучи го динамичниот статус кога страницата се вчита
document.addEventListener('DOMContentLoaded', function() {
    // ... (вашиот постоечки код останува) ...
    updateLiveStatus(); // Додади го ова на крајот
});

// (Опционално) Функција за симулирање на акцијата "showSystemActivation"
function showSystemActivation() {
    resetAllFilters();
}
