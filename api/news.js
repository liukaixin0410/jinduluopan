// Vercel Serverless Function - RSS 新闻抓取
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; jinduluopan-bot/1.0; +https://jinduluopan.vercel.app)'
  }
});

const RSS_SOURCES = [
  { name: '36氪', url: 'https://36kr.com/feed', category: 'tech' },
  { name: '机器之心', url: 'https://www.jiqizhixin.com/rss', category: 'ai' },
  { name: '量子位', url: 'https://www.qbitai.com/feed/', category: 'ai' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'tech' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech' },
  { name: 'Bloomberg - Markets', url: 'https://feeds.bloomberg.com/markets/news.rss', category: 'finance' },
  { name: 'CNBC', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', category: 'finance' },
];

export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 处理 OPTIONS 预检
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = req.query.category || 'all';
  const count = Math.min(parseInt(req.query.count || '30'), 50);

  try {
    const filteredSources = category === 'all'
      ? RSS_SOURCES
      : RSS_SOURCES.filter(s => s.category === category);

    // 并行抓取所有 RSS 源
    const fetchPromises = filteredSources.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        return feed.items.slice(0, 10).map(item => ({
          id: `${source.name}-${item.guid || item.link || Math.random()}`,
          title: item.title || 'No Title',
          summary: item.contentSnippet || item.description || '',
          sourceName: source.name,
          sourceUrl: item.link || source.url,
          imageUrl: '',
          category: source.category,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        }));
      } catch (err) {
        console.log(`[RSS] Failed to fetch ${source.name}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    let allItems = results.flat();

    // 去重（按标题前30字符）
    const seen = new Set();
    allItems = allItems.filter(item => {
      const key = item.title?.substring(0, 30);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 按时间倒序
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const finalItems = allItems.slice(0, count);

    console.log(`[RSS] 返回 ${finalItems.length} 条新闻 (category=${category}, count=${count})`);

    return res.status(200).json({
      success: true,
      data: finalItems,
      source: 'rss-feeds',
      isRealRSS: true,
      totalAvailable: allItems.length,
      category: category,
      fetchedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[RSS] Error:', error);
    return res.status(500).json({
      success: false,
      data: [],
      error: error.message,
      source: 'rss-feeds',
      isRealRSS: false,
    });
  }
}
