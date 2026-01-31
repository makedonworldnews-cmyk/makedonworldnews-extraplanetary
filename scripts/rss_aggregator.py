import json
import feedparser
from datetime import datetime
import os

# Вчитај RSS извори
with open('config/rss_sources.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

all_news = []

# Земи вести од секој извор
for source in config['sources']:
    try:
        feed = feedparser.parse(source['url'])
        
        for entry in feed.entries[:config['maxItemsPerSource']]:
            news_item = {
                'title': entry.title,
                'link': entry.link,
                'summary': entry.summary if hasattr(entry, 'summary') else '',
                'published': entry.published if hasattr(entry, 'published') else datetime.now().isoformat(),
                'source': source['name'],
                'region': source['region'],
                'category': source['category']
            }
            all_news.append(news_item)
            
        print(f"✅ {source['name']}: {len(feed.entries[:config['maxItemsPerSource']])} вести")
    except Exception as e:
        print(f"❌ Грешка со {source['name']}: {str(e)}")

# Сортирај по датум (најнови први)
all_news.sort(key=lambda x: x['published'], reverse=True)

# Зачувај ги вестите
output_data = {
    'last_updated': datetime.now().isoformat(),
    'total_news': len(all_news),
    'news': all_news[:100]  # Максимум 100 вести
}

with open('data/news.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"\n🎉 Вкупно собрани {len(all_news)} вести. Зачувано во data/news.json")
