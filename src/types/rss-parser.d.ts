declare module 'rss-parser' {
  interface RSSFeed {
    items: RSSItem[];
    title?: string;
    description?: string;
    link?: string;
    feedUrl?: string;
  }

  interface RSSItem {
    title?: string;
    link?: string;
    pubDate?: string;
    content?: string;
    contentSnippet?: string;
    summary?: string;
    itunes?: {
      image?: string;
    };
    enclosure?: {
      url?: string;
    };
  }

  class Parser {
    constructor(options?: any);
    parseURL(url: string): Promise<RSSFeed>;
    parseString(xml: string): Promise<RSSFeed>;
  }

  export = Parser;
}
