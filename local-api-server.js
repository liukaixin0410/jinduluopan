#!/usr/bin/env node
import http from 'http';
import { URL } from 'url';
import Parser from 'rss-parser';

const PORT = 3001;

// 环境变量：是否使用真实RSS抓取（默认 true，获取真实新闻网站数据）
const USE_REAL_RSS = process.env.USE_REAL_RSS !== 'false';

const RSS_FEEDS = {
  ai: [
    // 国内AI科技媒体
    { url: 'https://www.qbitai.com/feeds/all', name: '量子位' },
    { url: 'https://www.jiqizhixin.com/rss', name: '机器之心' },
    { url: 'https://36kr.com/feed', name: '36氪 - AI' },
    { url: 'https://www.leiphone.com/rss', name: '雷锋网' },
    { url: 'https://www.infoq.cn/topic/ai/rss', name: 'InfoQ AI' },
    // 海外AI科技媒体
    { url: 'https://www.technologyreview.com/feed', name: 'MIT Technology Review' },
    { url: 'https://ai.googleblog.com/feeds/posts/default', name: 'Google AI Blog' },
    { url: 'https://openai.com/blog/rss.xml', name: 'OpenAI Blog' },
    { url: 'https://www.nature.com/nature.rss', name: 'Nature' },
    { url: 'https://www.science.org/rss/news_current.xml', name: 'Science' },
  ],
  tech: [
    // 国内科技媒体
    { url: 'https://36kr.com/feed', name: '36氪' },
    { url: 'https://www.ifanr.com/feed', name: '爱范儿' },
    { url: 'https://www.huxiu.com/rss', name: '虎嗅' },
    { url: 'https://www.tmtpost.com/rss', name: '钛媒体' },
    { url: 'https://www.leiphone.com/rss', name: '雷锋网' },
    { url: 'https://rss.sina.com.cn/tech', name: '新浪科技' },
    { url: 'https://www.thepaper.cn/rss_channel_25959', name: '澎湃新闻' },
    // 海外科技媒体
    { url: 'https://techcrunch.com/feed', name: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://www.wired.com/feed/rss', name: 'Wired' },
    { url: 'https://www.cnet.com/rss/news/', name: 'CNET' },
    { url: 'https://arstechnica.com/feeds/posts.rss', name: 'Ars Technica' },
    { url: 'https://www.engadget.com/rss.xml', name: 'Engadget' },
    { url: 'https://venturebeat.com/feed', name: 'VentureBeat' },
  ],
  finance: [
    // 国内财经媒体
    { url: 'https://36kr.com/feed', name: '36氪 - 财经' },
    { url: 'https://www.huxiu.com/rss', name: '虎嗅 - 商业' },
    { url: 'https://www.tmtpost.com/rss', name: '钛媒体 - 科技财经' },
    { url: 'https://rss.sina.com.cn/finance', name: '新浪财经' },
    { url: 'https://wallstreetcn.com/api/feeds/realnews', name: '华尔街见闻' },
    // 海外财经媒体
    { url: 'https://feeds.bloomberg.com/markets.rss', name: 'Bloomberg' },
    { url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', name: 'Wall Street Journal' },
    { url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=15839069', name: 'CNBC' },
    { url: 'https://www.ft.com/myft/rss/0e0b836e-0421-408c-ac37-75c0ebf077dc', name: 'Financial Times' },
    { url: 'https://feeds.feedburner.com/zerohedge/feed', name: 'ZeroHedge' },
  ],
};

const parser = new Parser({
  defaultRSS: 2.0,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
});

async function fetchFromRSS(feedUrl, category, sourceName) {
  try {
    console.log(`📡 Fetching RSS from ${sourceName}...`);
    const feed = await parser.parseURL(feedUrl);
    const items = [];

    // 从每个RSS源获取更多新闻
    for (let i = 0; i < Math.min(feed.items.length, 20); i++) {
      const item = feed.items[i];
      if (!item.title || !item.link) continue;

      let imageUrl = '';
      if (item.content?.includes('<img')) {
        const imgMatch = item.content.match(/<img[^>]+src="([^"]+)"/);
        if (imgMatch) imageUrl = imgMatch[1];
      }
      if (!imageUrl && item.itunes?.image) {
        imageUrl = item.itunes.image;
      }
      if (!imageUrl && item.enclosure?.url) {
        imageUrl = item.enclosure.url;
      }

      // 不使用外部图片，避免加载错误
      if (!imageUrl) {
        imageUrl = '';
      }

      let summary = item.contentSnippet || item.summary || '';
      if (summary.length > 200) {
        summary = summary.slice(0, 197) + '...';
      }

      items.push({
        id: `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: item.title,
        summary: summary,
        sourceName: sourceName,
        sourceUrl: item.link,
        imageUrl: imageUrl,
        category: category,
        publishedAt: item.pubDate || new Date().toISOString(),
      });
    }

    console.log(`✅ Got ${items.length} items from ${sourceName}`);
    return items;
  } catch (error) {
    console.error(`❌ Failed to fetch RSS from ${sourceName}:`, error.message);
    return [];
  }
}

function generateBackupNews(category, count) {
  const newsTemplates = {
    ai: [
      { title: 'AI大模型在{domain}领域取得新突破', source: 'TechCrunch' },
      { title: '多家科技巨头联手发布新一代{tech}模型', source: 'Wired' },
      { title: 'DeepMind最新研究：AI在{task}方面能力提升', source: 'Nature' },
      { title: 'ChatGPT升级：新增{feature}功能', source: 'The Verge' },
      { title: '开源{model}模型发布，性能提升', source: 'GitHub Blog' },
    ],
    tech: [
      { title: '苹果发布全新{product}产品', source: '9to5Mac' },
      { title: '特斯拉{vehicle}销量创新高', source: 'Electrek' },
      { title: 'SpaceX成功发射{rocket}', source: 'Space.com' },
      { title: '小米汽车新款车型{model}曝光', source: 'AutoHome' },
      { title: 'Google推出{product}新产品', source: 'Android Police' },
    ],
    finance: [
      { title: '美联储宣布{action}，全球股市{trend}', source: 'Bloomberg' },
      { title: '比特币价格波动，创{record}', source: 'CoinDesk' },
      { title: '中国央行{policy}新政策', source: 'SCMP' },
      { title: '{company}发布财报，营收增长', source: 'Reuters' },
      { title: 'AI创业公司{name}完成大额融资', source: 'TechCrunch' },
    ],
  };

  const domains = ['医疗', '金融', '自动驾驶', '编程', '教育', '科研'];
  const techs = ['多模态', '推理', '强化学习', '小样本'];
  const tasks = ['复杂数学推理', '代码生成', '医学诊断', '语言理解'];
  const features = ['视频生成', '长文本理解', '联网搜索', '语音通话'];
  const models = ['Qwen', 'Yi', 'DeepSeek', 'Mistral', 'Llama'];
  const versions = ['4', '3.5', '4.5', '5'];
  const products = ['iPhone 17', 'Vision Pro 2', 'MacBook Air M5', 'Apple Watch'];
  const vehicles = ['Model 3', 'Model Y', 'Cybertruck', 'Robotaxi'];
  const rockets = ['Starship', 'Falcon 9', 'Starlink', 'New Shepard'];
  const models2 = ['SU7', 'YU7', 'MU7'];
  const actions = ['降息25个基点', '维持利率', '缩表计划'];
  const trends1 = ['上涨', '下跌', '震荡'];
  const trends2 = ['走强', '创新高', '稳定'];
  const sectors = ['科技', '金融', '新能源', 'AI'];
  const companies = ['苹果', '微软', '谷歌', '特斯拉', '英伟达'];
  const records = ['年内新高', '历史新高', '三年来最高'];
  const names = ['创新科技', '智算公司', '未来科技', '星云AI'];
  const policies = ['降准', '降息', '市场化改革', '金融开放'];

  const templates = newsTemplates[category] || newsTemplates.tech;
  const news = [];

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const hoursAgo = Math.random() * 72;
    
    let title = template.title;
    title = title.replace('{domain}', domains[Math.floor(Math.random() * domains.length)]);
    title = title.replace('{tech}', techs[Math.floor(Math.random() * techs.length)]);
    title = title.replace('{task}', tasks[Math.floor(Math.random() * tasks.length)]);
    title = title.replace('{feature}', features[Math.floor(Math.random() * features.length)]);
    title = title.replace('{model}', models[Math.floor(Math.random() * models.length)]);
    title = title.replace('{version}', versions[Math.floor(Math.random() * versions.length)]);
    title = title.replace('{product}', products[Math.floor(Math.random() * products.length)]);
    title = title.replace('{vehicle}', vehicles[Math.floor(Math.random() * vehicles.length)]);
    title = title.replace('{rocket}', rockets[Math.floor(Math.random() * rockets.length)]);
    title = title.replace('{model}', models2[Math.floor(Math.random() * models2.length)]);
    title = title.replace('{action}', actions[Math.floor(Math.random() * actions.length)]);
    title = title.replace(/{trend}/g, trends1[Math.floor(Math.random() * trends1.length)]);
    title = title.replace('{sector}', sectors[Math.floor(Math.random() * sectors.length)]);
    title = title.replace('{company}', companies[Math.floor(Math.random() * companies.length)]);
    title = title.replace('{record}', records[Math.floor(Math.random() * records.length)]);
    title = title.replace('{name}', names[Math.floor(Math.random() * names.length)]);
    title = title.replace('{policy}', policies[Math.floor(Math.random() * policies.length)]);

    const summaries = [
      '业内专家表示，这一进展将对行业产生深远影响，预计相关产业链将迎来重大发展机遇。',
      '分析人士指出，这标志着该领域进入了新的发展阶段，未来几年将持续保持高速增长。',
      '据了解，该技术已在多个场景进行测试，效果超出预期，预计很快将正式商用。',
      '消息发布后，相关公司股价应声上涨，市场对该技术的前景普遍持乐观态度。',
      '这一突破被认为是该领域近年来最重要进展之一，将重塑整个行业格局。',
    ];

    news.push({
      id: `news_${Date.now()}_${i}`,
      title,
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      sourceName: template.source,
      sourceUrl: `https://example.com/news/${Date.now()}_${i}`,
      imageUrl: '',
      category: category,
      publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    });
  }

  return news;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  
  if (parsedUrl.pathname === '/api/news') {
    const category = parsedUrl.searchParams.get('category') || 'all';
    const count = Math.min(Math.max(Number(parsedUrl.searchParams.get('count')) || 30, 10), 100);

    try {
      let news = [];
      let source = '';

      if (USE_REAL_RSS) {
        console.log('🔄 Using REAL RSS feeds...');
        source = 'rss-feeds';
        const categoriesToFetch = category === 'all' ? ['ai', 'tech', 'finance'] : [category];
        
        for (const cat of categoriesToFetch) {
          const feeds = RSS_FEEDS[cat];
          if (feeds && feeds.length > 0) {
            const feedPromises = feeds.map(feed => 
              fetchFromRSS(feed.url, cat, feed.name)
            );
            
            const results = await Promise.allSettled(feedPromises);
            
            for (const result of results) {
              if (result.status === 'fulfilled' && result.value.length > 0) {
                news = [...news, ...result.value];
              }
            }
          }
        }

        if (news.length > 0) {
          // 去重：根据标题去重
          const seenTitles = new Set();
          const uniqueNews = [];
          
          for (const item of news) {
            // 使用标题的前30个字符作为去重键，避免完全相同但有细微差异的情况
            const titleKey = item.title.slice(0, 30);
            if (!seenTitles.has(titleKey)) {
              seenTitles.add(titleKey);
              uniqueNews.push(item);
            }
          }
          
          news = uniqueNews.sort((a, b) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          news = news.slice(0, count);
        } else {
          console.log('⚠️ No RSS items, using fallback');
          if (category === 'all') {
            news = [
              ...generateBackupNews('ai', Math.floor(count / 3)),
              ...generateBackupNews('tech', Math.floor(count / 3)),
              ...generateBackupNews('finance', count - 2 * Math.floor(count / 3)),
            ];
          } else {
            news = generateBackupNews(category, count);
          }
          source = 'fallback-generator';
        }
      } else {
        console.log('🎭 Using mock data (set USE_REAL_RSS=true to use real RSS)');
        source = 'mock-generator';
        if (category === 'all') {
          news = [
            ...generateBackupNews('ai', Math.floor(count / 3)),
            ...generateBackupNews('tech', Math.floor(count / 3)),
            ...generateBackupNews('finance', count - 2 * Math.floor(count / 3)),
          ];
        } else {
          news = generateBackupNews(category, count);
        }
      }

      // 不再随机打乱，保持按时间降序排列
      // news = news.sort(() => Math.random() - 0.5);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: news,
        timestamp: new Date().toISOString(),
        source: source,
        isRealRSS: USE_REAL_RSS,
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      
      let news = [];
      if (category === 'all') {
        news = [
          ...generateBackupNews('ai', 8),
          ...generateBackupNews('tech', 8),
          ...generateBackupNews('finance', 8),
        ];
      } else {
        news = generateBackupNews(category, 20);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        data: news,
        timestamp: new Date().toISOString(),
        source: 'emergency-fallback',
        error: error.message,
      }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 本地 API 服务器已启动！');
  console.log(`📡 地址: http://localhost:${PORT}`);
  console.log(`📰 测试: http://localhost:${PORT}/api/news?category=all&count=25`);
  console.log(`\n📊 当前模式: ${USE_REAL_RSS ? '✅ 真实RSS抓取' : '🎭 模拟数据'}`);
  console.log(`\n💡 切换模式: 设置环境变量 USE_REAL_RSS=true`);
  console.log('='.repeat(50) + '\n');
});
