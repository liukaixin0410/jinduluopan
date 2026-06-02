// 简单版本：直接返回备用新闻数据
function generateBackupNews(category, count) {
  const newsTemplates = {
    ai: [
      { title: 'AI大模型在医疗领域取得新突破', source: 'TechCrunch' },
      { title: '多家科技巨头联手发布新一代多模态模型', source: 'Wired' },
      { title: 'DeepMind最新研究：AI在复杂数学推理方面能力提升', source: 'Nature' },
      { title: 'ChatGPT升级：新增视频生成功能', source: 'The Verge' },
      { title: '开源Qwen模型发布，性能大幅提升', source: 'GitHub Blog' },
      { title: 'AI在医学影像诊断中开始临床应用', source: 'HealthTech' },
      { title: 'Meta推出最新Llama 4模型', source: 'Meta AI' },
      { title: '英伟达发布新AI芯片，训练速度提升3倍', source: 'NVIDIA Blog' },
    ],
    tech: [
      { title: '苹果发布全新iPhone 17产品', source: '9to5Mac' },
      { title: '特斯拉Model Y销量创新高', source: 'Electrek' },
      { title: 'SpaceX成功发射Starship', source: 'Space.com' },
      { title: '小米汽车新款SU7曝光', source: 'AutoHome' },
      { title: '三星发布Vision Pro 2，屏幕技术突破', source: 'SamMobile' },
      { title: 'Google推出新MacBook Air M5产品', source: 'Android Police' },
      { title: '量子计算取得重大突破', source: 'Quantum Magazine' },
      { title: '新能源汽车市场持续增长', source: 'CleanTechnica' },
    ],
    finance: [
      { title: '美联储宣布降息25个基点，全球股市上涨', source: 'Bloomberg' },
      { title: '比特币价格波动，创年内新高', source: 'CoinDesk' },
      { title: '中国央行发布新政策', source: 'SCMP' },
      { title: '苹果发布财报，营收增长15%', source: 'Reuters' },
      { title: 'AI创业公司创新科技完成大额融资', source: 'TechCrunch' },
      { title: '人民币汇率走强', source: 'Financial Times' },
      { title: '沙特宣布1000亿美元AI投资计划', source: 'Arabian Business' },
      { title: '股市上涨，科技板块领涨', source: 'CNBC' },
    ],
  };

  const summaries = [
    '业内专家表示，这一进展将对行业产生深远影响。',
    '分析人士指出，该领域进入了新的发展阶段。',
    '据了解，该技术已在多个场景进行测试。',
    '消息发布后，相关公司股价应声上涨。',
    '这一突破被认为是近年来重要进展。',
  ];

  const templates = newsTemplates[category] || newsTemplates.tech;
  const news = [];

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    const hoursAgo = Math.random() * 72;

    news.push({
      id: `news_${Date.now()}_${i}`,
      title: template.title,
      summary: summaries[i % summaries.length],
      sourceName: template.source,
      sourceUrl: `https://example.com/news/${Date.now()}_${i}`,
      imageUrl: `https://picsum.photos/seed/${category}${i}${Date.now()}/800/450`,
      category: category,
      publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    });
  }

  return news;
}

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const category = (req.query.category) || 'all';
  const count = Math.min(Math.max(Number(req.query.count) || 30, 10), 100);

  let news = [];
  if (category === 'all') {
    const aiNews = generateBackupNews('ai', Math.floor(count / 3));
    const techNews = generateBackupNews('tech', Math.floor(count / 3));
    const financeNews = generateBackupNews('finance', count - aiNews.length - techNews.length);
    news = [...aiNews, ...techNews, ...financeNews];
  } else {
    news = generateBackupNews(category, count);
  }

  // 按时间降序排列
  news = news.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  res.status(200).json({
    success: true,
    data: news,
    timestamp: new Date().toISOString(),
    source: 'fallback-generator',
  });
}
