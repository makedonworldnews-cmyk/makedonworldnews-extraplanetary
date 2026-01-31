import feedparser
import json
import os
from datetime import datetime, timezone
import pytz
import requests
from bs4 import BeautifulSoup

# --- CONFIGURATION ---
# Load RSS sources from external config file
CONFIG_PATH = 'config/rss_sources.json'

try:
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        config = json.load(f)
        RSS_SOURCES = config['rss_sources']
    print(f"✅ Loaded {len(RSS_SOURCES)} sources from config file.")
except Exception as e:
    print(f"⚠️  Could not load config, using defaults. Error: {e}")
    RSS_SOURCES = [
        {"url": "https://makfax.com.mk/rss/", "region": "🏔️ Балкан", "category": "Новости"},
        {"url": "https://feeds.bbci.co.uk/news/world/rss.xml", "region": "🌍 World", "category": "Новости"}
    ]

DATA_FILE_PATH = 'data/news.json'
MAX_ARTICLES_TO_KEEP = 100

# --- HELPER FUNCTIONS ---
def get_mkd_time():
    """Get current time in Skopje timezone."""
    skopje_tz = pytz.timezone('Europe/Skopje')
    return datetime.now(skopje_tz).strftime('%Y-%m-%d %H:%M:%S')

def clean_text(text, max_length=200):
    """Clean and truncate text for display."""
    if not text:
        return ""
    # Remove HTML tags if present
    soup = BeautifulSoup(text, "html.parser")
    cleaned = soup.get_text()
    # Remove extra whitespace
    cleaned = " ".join(cleaned.split())
    # Truncate if too long
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length] + "..."
    return cleaned

def safe_fetch(url):
    """Safely fetch RSS feed with error handling and encoding fixes."""
    try:
        # Use requests with a timeout and custom headers
        headers = {
            'User-Agent': 'MakedonWorldNews/1.0 (+https://github.com/makedonworldnews-cmyk/makedonworldnews-extraplanetary)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  # Raise an error for bad status codes
        
        # Force UTF-8 encoding and replace problematic characters
        content = response.content.decode('utf-8', errors='replace')
        return feedparser.parse(content)
        
    except Exception as e:
        print(f"  🔧 Fetch failed for {url}, trying direct feedparser... Error: {e}")
        # Fallback to direct feedparser parsing
        try:
            return feedparser.parse(url)
        except Exception as e2:
            print(f"  ❌ Complete failure for {url}: {e2}")
            return None

# --- MAIN FETCHING LOGIC ---
def fetch_all_news():
    """Fetch news from all RSS sources and return a structured list."""
    all_articles = []
    successful_sources = 0

    for source in RSS_SOURCES:
        print(f"\n🔍 Fetching from: {source['url']}")
        feed = safe_fetch(source['url'])
        
        if feed is None or feed.bozo:  # bozo flag indicates parsing problems
            print(f"  ⚠️  RSS feed has problems or is empty: {source['url']}")
            if feed and feed.bozo_exception:
                print(f"     Exception: {feed.bozo_exception}")
            continue
        
        successful_sources += 1
        articles_from_source = 0
        
        for entry in feed.entries[:10]:  # Get up to 10 articles per source
            article = {
                "title": clean_text(entry.get('title', 'Без наслов')),
                "summary": clean_text(entry.get('summary', entry.get('description', 'Ова е RSS вест. Кликнете за да прочитате повеќе...')), 150),
                "link": entry.get('link', '#'),
                "published": entry.get('published', get_mkd_time()),
                "source_name": feed.feed.get('title', 'Независен извор'),
                "region": source.get('region', '🌍 World'),
                "category": source.get('category', 'Новости'),
                "fetched_at": get_mkd_time(),
                "language": source.get('language', 'unknown')
            }
            all_articles.append(article)
            articles_from_source += 1
        
        print(f"  ✅ Added {articles_from_source} articles from '{feed.feed.get('title', 'Unknown')}'")

    print(f"\n📊 Summary: Successfully fetched from {successful_sources}/{len(RSS_SOURCES)} sources.")
    return all_articles

def save_news_data(articles):
    """Save fetched articles to a JSON file."""
    os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)
    
    news_data = {
        "last_updated": get_mkd_time(),
        "article_count": len(articles),
        "articles": articles[:MAX_ARTICLES_TO_KEEP]
    }
    
    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(news_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Data saved to {DATA_FILE_PATH}")

# --- EXECUTION ---
if __name__ == "__main__":
    print("🚀 Starting Makedon World News RSS Fetcher...")
    print(f"🕐 Current SK time: {get_mkd_time()}")
    print("=" * 60)
    
    articles = fetch_all_news()
    
    if articles:
        save_news_data(articles)
        print(f"\n🎉 Success! Total articles: {len(articles)}")
    else:
        print("\n⚠️  No articles were fetched. Check your RSS sources in config/rss_sources.json")
        # Create empty data file to prevent frontend errors
        save_news_data([])
