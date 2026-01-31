// assets/app.js
// Main script to load and display news on Makedon World News

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Makedon World News - Initializing...');
    
    const newsContainer = document.getElementById('rss-news-live');
    const lastUpdateEl = document.getElementById('last-update-time');
    const articleCountEl = document.getElementById('article-count');
    
    if (!newsContainer) {
        console.error('❌ Could not find element with id "rss-news-live"');
        return;
    }
    
    // News data URL (automatically created by the GitHub Action)
    const NEWS_DATA_URL = 'data/news.json';
    
    // Categories and regions mapping for filtering
    const categories = {
        'Новости': '🌐',
        'Политика': '🏛️',
        'Економија': '📈',
        'Спорт': '⚽',
        'Култура': '🎭',
        'Наука': '🔬',
        'Забава': '🎬'
    };
    
    const regions = {
        '🌍 World': '🌍 Свет',
        '🇪🇺 Европа': '🇪🇺 Европа', 
        '🏔️ Балкан': '🏔️ Балкан',
        '🇺🇸 Америка': '🇺🇸 Америка',
        '🌏 Азија': '🌏 Азија'
    };
    
    // Fetch and display news
    async function loadNews() {
        try {
            console.log(`📡 Fetching news from: ${NEWS_DATA_URL}`);
            
            // Add cache-buster to prevent browser caching during development
            const url = `${NEWS_DATA_URL}?t=${new Date().getTime()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Loaded ${data.articles.length} articles`);
            
            // Update stats
            if (lastUpdateEl) {
                lastUpdateEl.textContent = data.last_updated || 'Неодамна';
            }
            if (articleCountEl) {
                articleCountEl.textContent = data.article_count || data.articles.length;
            }
            
            // Display articles
            displayArticles(data.articles);
            
        } catch (error) {
            console.error('❌ Error loading news:', error);
            newsContainer.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Привремен проблем со вестите</h3>
                    <p>Системот за вести моментално се ажурира. Ве молиме обидете се повторно за неколку минути.</p>
                    <p><small>Технички детали: ${error.message}</small></p>
                </div>
            `;
        }
    }
    
    // Display articles in the container
    function displayArticles(articles) {
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '<p class="no-news">⚠️ Нема достапни вести во моментов. Проверете подоцна.</p>';
            return;
        }
        
        let html = '';
        
        articles.forEach((article, index) => {
            // Use Macedonian translations for regions
            const regionDisplay = regions[article.region] || article.region;
            const categoryIcon = categories[article.category] || '📰';
            
            html += `
                <article class="news-card" data-index="${index}">
                    <div class="news-header">
                        <span class="news-badge region-badge">${regionDisplay}</span>
                        <span class="news-badge category-badge">${categoryIcon} ${article.category}</span>
                    </div>
                    
                    <h3 class="news-title">
                        <a href="${article.link}" target="_blank" rel="noopener">
                            ${article.title}
                        </a>
                    </h3>
                    
                    <p class="news-summary">${article.summary}</p>
                    
                    <div class="news-footer">
                        <span class="news-source">📰 ${article.source_name}</span>
                        <span class="news-time">🕐 ${formatTime(article.published)}</span>
                        <a href="${article.link}" class="read-more" target="_blank" rel="noopener">Прочитај повеќе →</a>
                    </div>
                </article>
            `;
        });
        
        newsContainer.innerHTML = html;
        console.log(`📰 Displayed ${articles.length} articles`);
    }
    
    // Format time for display
    function formatTime(timeString) {
        if (!timeString) return 'Неодамна';
        
        try {
            const date = new Date(timeString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            
            if (diffMins < 60) {
                return `Пред ${diffMins} мин`;
            } else if (diffHours < 24) {
                return `Пред ${diffHours} час${diffHours !== 1 ? 'а' : ''}`;
            } else {
                return date.toLocaleDateString('mk-MK', { 
                    day: 'numeric', 
                    month: 'short' 
                });
            }
        } catch (e) {
            return timeString;
        }
    }
    
    // Initial load
    loadNews();
    
    // Optional: Auto-refresh every 5 minutes
    setInterval(loadNews, 5 * 60 * 1000);
});
