// assets/app.js - Simple Loader for Makedon World News
console.log('🔧 Makedon World News JS script is loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM is ready. Starting news loader...');
    
    const newsContainer = document.getElementById('rss-news-live');
    
    if (!newsContainer) {
        console.error('❌ CRITICAL: Could not find HTML element with id="rss-news-live"');
        alert('Грешка: Не можам да го најдам контејнерот за вести на страницата.');
        return;
    }
    
    // TRY 1: Load from the data folder (relative path used by GitHub Pages)
    const dataUrl = 'data/news.json';
    // TRY 2: Direct link to the raw JSON file on GitHub (fallback)
    const rawUrl = 'https://raw.githubusercontent.com/makedonworldnews-cmyk/makedonworldnews-extraplanetary/main/data/news.json';
    
    console.log(`📡 Attempting to fetch news from: ${dataUrl}`);
    
    fetch(dataUrl)
        .then(response => {
            if (!response.ok) {
                console.warn(`⚠️ First attempt failed (${response.status}). Trying fallback URL...`);
                // If first fails, try the direct raw URL
                return fetch(rawUrl);
            }
            return response;
        })
        .then(response => response.json())
        .then(newsData => {
            console.log(`✅ SUCCESS! Loaded news data:`, newsData);
            console.log(`📰 Total articles: ${newsData.articles.length}`);
            
            // Update the stats on the page
            const countEl = document.getElementById('article-count');
            const timeEl = document.getElementById('last-update-time');
            if (countEl) countEl.textContent = newsData.articles.length;
            if (timeEl) timeEl.textContent = newsData.last_updated || 'Неодамна';
            
            // Clear the "loading" message
            newsContainer.innerHTML = '';
            
            // Display each article
            if (newsData.articles.length === 0) {
                newsContainer.innerHTML = '<p>⚠️ Нема нови вести во моментов.</p>';
                return;
            }
            
            newsData.articles.forEach(article => {
                const articleEl = document.createElement('div');
                articleEl.style.cssText = `
                    background: white; border-radius: 8px; padding: 15px; margin-bottom: 15px;
                    border-left: 5px solid #007acc; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                `;
                articleEl.innerHTML = `
                    <h3 style="margin-top: 0; color: #1a365d;">
                        <a href="${article.link}" target="_blank" style="color: inherit; text-decoration: none;">
                            ${article.title}
                        </a>
                    </h3>
                    <p>${article.summary}</p>
                    <div style="font-size: 0.9em; color: #666;">
                        <strong>Извор:</strong> ${article.source_name} | 
                        <strong>Регион:</strong> ${article.region} | 
                        <strong>Објавено:</strong> ${article.published}
                    </div>
                `;
                newsContainer.appendChild(articleEl);
            });
            
        })
        .catch(error => {
            console.error('❌ FATAL ERROR loading news:', error);
            newsContainer.innerHTML = `
                <div style="background: #fee; padding: 20px; border-radius: 8px; border: 1px solid #fcc;">
                    <h3>⚠️ Грешка при вчитување на вести</h3>
                    <p>Системот не можеше да ги вчита вестите. Технички детали:</p>
                    <pre style="background: #fff; padding: 10px; overflow: auto;">${error.message}</pre>
                    <p><strong>Акции што можете да ги преземете:</strong></p>
                    <ul>
                        <li>Проверете дали датотеката <code>data/news.json</code> постои во репозиториумот.</li>
                        <li>Пуштете го работниот тек "Fetch RSS News" рачно од табот Actions.</li>
                        <li>Проверете дали има грешки во табот "Console".</li>
                    </ul>
                </div>
            `;
        });
});
