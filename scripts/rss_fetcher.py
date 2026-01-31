import feedparser
import json
import os
from datetime import datetime, timezone
import pytz

# --- CONFIGURATION ---
# Load RSS sources from external config file
import json
CONFIG_PATH = 'config/rss_sources.json'

try:
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        config = json.load(f)
        RSS_SOURCES = config['rss_sources']
    print(f"✅ Loaded {len(RSS_SOURCES)} sources from config file.")
except Exception as e:
    print(f"⚠️  Could not load config, using defaults. Error: {e}")
    # Fallback to defaults if config file is missing
    RSS_SOURCES = [
        {"url": "https://makfax.com.mk/rss/", "region": "🏔️ Балкан", "category": "Новости"},
        {"url": "http://feeds.bbci.co.uk/news/world/rss.xml", "region": "🌍 World", "category": "Новости"}
    ]
]

# Define the path to save the news data
DATA_FILE_PATH = 'data/news.json'
MAX_ARTICLES_TO_KEEP = 50  # Max number of articles to store

# --- HELPER FUNCTIONS ---
def get_mkd_time():
    """Get current time in Skopje timezone."""
    skopje_tz = pytz.timezone('Europe/Skopje')
    return datetime.now(skopje_tz).strftime('%Y-%m-%d %H:%M:%S')

def clean_text(text, max_length=200):
    """Clean and truncate text for display."""
    if not text:
        return ""
    # Remove extra whitespace and newlines
    cleaned = " ".join(text.split())
    # Truncate if too long
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length] + "..."
    return cleaned

# --- MAIN FETCHING LOGIC ---
def fetch_all_news():
    """Fetch news from all RSS sources and return a structured list."""
    all_articles = []

    for source in RSS_SOURCES:
        try:
            print(f"Fetching from: {source['url']}")
            feed = feedparser.parse(source['url'])

            for entry in feed.entries[:5]:  # Get up to 5 articles per source
                article = {
                    "title": clean_text(entry.get('title', 'Без наслов')),
                    "summary": clean_text(entry.get('summary', entry.get('description', 'Ова е RSS вест. Кликнете за да прочитате повеќе...')), 150),
                    "link": entry.get('link', '#'),
                    "published": entry.get('published', get_mkd_time()),
                    "source_name": feed.feed.get('title', 'Независен извор'),
                    "region": source['region'],
                    "category": source['category'],
                    "fetched_at": get_mkd_time()
                }
                all_articles.append(article)
                print(f"  ✅ {article['title'][:50]}...")

        except Exception as e:
            print(f"  ❌ Error fetching {source['url']}: {e}")

    return all_articles

def save_news_data(articles):
    """Save fetched articles to a JSON file."""
    # Create data directory if it doesn't exist
    os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)

    # Prepare the data structure
    news_data = {
        "last_updated": get_mkd_time(),
        "article_count": len(articles),
        "articles": articles[:MAX_ARTICLES_TO_KEEP]  # Keep only the newest ones
    }

    # Write to file
    with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(news_data, f, ensure_ascii=False, indent=2)

    print(f"\n💾 Data saved to {DATA_FILE_PATH}. Total articles: {len(news_data['articles'])}")

# --- EXECUTION ---
if __name__ == "__main__":
    print("🚀 Starting Makedon World News RSS Fetcher...")
    print(f"🕐 Current SK time: {get_mkd_time()}")
    print("-" * 50)

    # Fetch news
    articles = fetch_all_news()

    if articles:
        # Save the data
        save_news_data(articles)
        print(f"\n✅ Successfully fetched {len(articles)} articles.")
    else:
        print("\n⚠️  No articles were fetched. Check your RSS sources.")
