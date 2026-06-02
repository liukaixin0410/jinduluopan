import type { IncomingMessage, ServerResponse } from 'http';
import Parser from 'rss-parser';

type VercelRequest = IncomingMessage & { query: Record<string, string | string[]> };
type VercelResponse = ServerResponse;

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  imageUrl: string;
  category: 'ai' | 'tech' | 'finance';
  publishedAt: string;
}

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
    'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0; +https://example.com)'
  }
});

async function fetchFromRSS(feedUrl: string, category: string, sourceName: string): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(feedUrl);
    const items: NewsItem[] = [];

    // 从每个 RSS 源获取更多新闻
    for (let i = 0; i < Math.min(feed.items.length, 20); i++) {
      const item = feed.items[i];
      if (!item.title || !item.link) continue;

      // 提取图片
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

      // 如果没有图片，使用生成的图片
      if (!imageUrl) {
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(item.title.slice(0, 30))}/800/450`;
      }

      // 清理摘要
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
        category: category as 'ai' | 'tech' | 'finance',
        publishedAt: item.pubDate || new Date().toISOString(),
      });
    }

    return items;
  } catch (error) {
    console.error(`Failed to fetch RSS from ${feedUrl}:`, error);
    return [];
  }
}

// 备用生成函数
function generateBackupNews(category: string, count: number): NewsItem[] {
  const newsTemplates = {
    ai: [
      { title: 'AI大模型在{domain}领域取得新突破', source: 'TechCrunch' },
      { title: '多家科技巨头联手发布新一代{tech}模型', source: 'Wired' },
      { title: 'DeepMind最新研究：AI在{task}方面能力提升', source: 'Nature' },
      { title: 'ChatGPT升级：新增{feature}功能', source: 'The Verge' },
      { title: '开源{model}模型发布，性能提升', source: 'GitHub Blog' },
      { title: 'AI在医学影像诊断中开始临床应用', source: 'HealthTech' },
      { title: 'Meta推出最新Llama{version}模型', source: 'Meta AI' },
      { title: '英伟达发布新AI芯片，训练速度提升', source: 'NVIDIA Blog' },
    ],
    tech: [
      { title: '苹果发布全新{product}产品', source: '9to5Mac' },
      { title: '特斯拉{vehicle}销量创新高', source: 'Electrek' },
      { title: 'SpaceX成功发射{rocket}', source: 'Space.com' },
      { title: '小米汽车新款车型{model}曝光', source: 'AutoHome' },
      { title: '三星发布{product}，屏幕技术突破', source: 'SamMobile' },
      { title: 'Google推出{product}新产品', source: 'Android Police' },
      { title: '量子计算取得突破', source: 'Quantum Magazine' },
      { title: '新能源汽车市场持续增长', source: 'CleanTechnica' },
    ],
    finance: [
      { title: '美联储宣布{action}，全球股市{trend}', source: 'Bloomberg' },
      { title: '比特币价格波动，创{record}', source: 'CoinDesk' },
      { title: '中国央行{policy}新政策', source: 'SCMP' },
      { title: '{company}发布财报，营收增长', source: 'Reuters' },
      { title: 'AI创业公司{name}完成大额融资', source: 'TechCrunch' },
      { title: '人民币汇率{trend}', source: 'Financial Times' },
      { title: '沙特宣布AI投资计划', source: 'Arabian Business' },
      { title: '股市{trend}，{sector}板块领涨', source: 'CNBC' },
    ],
  };

  const domains = ['医疗', '金融', '自动驾驶', '编程', '教育'];
  const techs = ['多模态', '推理', '强化学习'];
  const tasks = ['复杂数学推理', '代码生成', '医学诊断'];
  const features = ['视频生成', '长文本理解', '联网搜索'];
  const models = ['Qwen', 'Yi', 'DeepSeek', 'Mistral'];
  const versions = ['4', '3.5', '4.5'];
  const products = ['iPhone 17', 'Vision Pro 2', 'MacBook Air M5'];
  const vehicles = ['Model 3', 'Model Y', 'Cybertruck'];
  const rockets = ['Starship', 'Falcon 9', 'Starlink'];
  const models2 = ['SU7', 'YU7'];
  const actions = ['降息25个基点', '维持利率'];
  const trends1 = ['上涨', '下跌'];
  const trends2 = ['走强', '稳定'];
  const sectors = ['科技', '金融', '新能源'];
  const companies = ['苹果', '微软', '谷歌'];
  const records = ['年内新高', '历史新高'];
  const names = ['创新科技', '智算公司'];

  const templates = newsTemplates[category as keyof typeof newsTemplates] || newsTemplates.tech;
  const news: NewsItem[] = [];

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
    title = title.replace('{trend}', trends1[Math.floor(Math.random() * trends1.length)]);
    title = title.replace('{trend}', trends2[Math.floor(Math.random() * trends2.length)]);
    title = title.replace('{sector}', sectors[Math.floor(Math.random() * sectors.length)]);
    title = title.replace('{company}', companies[Math.floor(Math.random() * companies.length)]);
    title = title.replace('{record}', records[Math.floor(Math.random() * records.length)]);
    title = title.replace('{name}', names[Math.floor(Math.random() * names.length)]);

    const summaries = [
      '业内专家表示，这一进展将对行业产生深远影响。',
      '分析人士指出，该领域进入了新的发展阶段。',
      '据了解，该技术已在多个场景进行测试。',
      '消息发布后，相关公司股价应声上涨。',
      '这一突破被认为是近年来重要进展。',
    ];

    news.push({
      id: `news_${Date.now()}_${i}`,
      title,
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      sourceName: template.source,
      sourceUrl: `https://example.com/news/${Date.now()}_${i}`,
      imageUrl: `https://picsum.photos/seed/${category}${i}${Date.now()}/800/450`,
      category: category as 'ai' | 'tech' | 'finance',
      publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    });
  }

  return news;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = (req.query.category as string) || 'all';
  const count = Math.min(Math.max(Number(req.query.count) || 30, 10), 100);

  try {
    let news: NewsItem[] = [];
    let usedRSS = false;

    // 获取分类对应的 RSS 源
    const categoriesToFetch = category === 'all' ? ['ai', 'tech', 'finance'] : [category];
    
    for (const cat of categoriesToFetch) {
      const feeds = RSS_FEEDS[cat as keyof typeof RSS_FEEDS];
      if (feeds && feeds.length > 0) {
        // 并行获取所有 RSS 源（不再只取前2个）
        const feedPromises = feeds.map(feed => 
          fetchFromRSS(feed.url, cat, feed.name)
        );
        
        const results = await Promise.allSettled(feedPromises);
        
        for (const result of results) {
          if (result.status === 'fulfilled' && result.value.length > 0) {
            news = [...news, ...result.value];
            usedRSS = true;
          }
        }
      }
    }

    // 如果 RSS 获取成功，按时间排序并限制数量
    if (news.length > 0) {
      // 去重：根据标题去重
      const seenTitles = new Set<string>();
      const uniqueNews: NewsItem[] = [];
      
      for (const item of news) {
        // 使用标题的前30个字符作为去重键，避免完全相同但有细微差异的情况
        const titleKey = item.title.slice(0, 30);
        if (!seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          uniqueNews.push(item);
        }
      }
      
      // 按时间降序排列（最新的在前）
      news = uniqueNews.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      news = news.slice(0, count);
    } else {
      // 备用方案
      if (category === 'all') {
        const aiNews = generateBackupNews('ai', Math.floor(count / 3));
        const techNews = generateBackupNews('tech', Math.floor(count / 3));
        const financeNews = generateBackupNews('finance', count - aiNews.length - techNews.length);
        news = [...aiNews, ...techNews, ...financeNews];
      } else {
        news = generateBackupNews(category, count);
      }
    }

    // 不再随机打乱，保持按时间降序排列
    // news = news.sort(() => Math.random() - 0.5);

    res.status(200).json({
      success: true,
      data: news,
      timestamp: new Date().toISOString(),
      source: usedRSS ? 'rss-feeds' : 'fallback-generator',
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // 完全失败时的备用方案
    let news: NewsItem[] = [];
    if (category === 'all') {
      news = [
        ...generateBackupNews('ai', 8),
        ...generateBackupNews('tech', 8),
        ...generateBackupNews('finance', 8),
      ];
    } else {
      news = generateBackupNews(category, 20);
    }

    res.status(200).json({
      success: true,
      data: news,
      timestamp: new Date().toISOString(),
      source: 'emergency-fallback',
    });
  }
}
