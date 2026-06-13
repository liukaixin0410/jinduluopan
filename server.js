// 生产环境服务器 - 同时托管前端静态文件和 RSS API
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// === 1. RSS API 路由（从 local-api-server.js 复用逻辑）===
let rssParser = null;
try {
  const Parser = require('rss-parser');
  rssParser = new Parser({
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; jinduluopan-bot/1.0)' }
  });
} catch (e) {
  console.warn('rss-parser 未安装，RSS API 将返回空数据');
}

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

app.get('/api/news', async (req, res) => {
  const category = req.query.category || 'all';
  const count = Math.min(parseInt(req.query.count || '30'), 50);

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');

  if (!rssParser) {
    return res.json({ success: false, data: [], error: 'RSS parser not configured', source: 'rss-feeds', isRealRSS: false });
  }

  try {
    const filteredSources = category === 'all'
      ? RSS_SOURCES
      : RSS_SOURCES.filter(s => s.category === category);

    const fetchPromises = filteredSources.map(async (source) => {
      try {
        const feed = await rssParser.parseURL(source.url);
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

    res.json({
      success: true,
      data: finalItems,
      source: 'rss-feeds',
      isRealRSS: true,
      totalAvailable: allItems.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      error: error.message,
      source: 'rss-feeds',
      isRealRSS: false,
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === 2. 托管前端静态文件 ===
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, {
  maxAge: '1h',
  extensions: ['html'],
}));

// SPA fallback - 所有非 API 路由返回 index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distDir, 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 进度罗盘 - 生产服务器已启动');
  console.log(`📍 访问地址: http://localhost:${PORT}`);
  console.log(`📰 新闻API: http://localhost:${PORT}/api/news?category=all&count=30`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📦 前端资源: ${distDir}`);
  console.log('='.repeat(60) + '\n');
});
