import { useState, useMemo } from 'react';
import {
  Newspaper, Search, Filter, TrendingUp, TrendingDown, Clock, ExternalLink,
  Bookmark, BookmarkCheck, Share2, ChevronRight, Sparkles, Globe, Zap,
  AlertCircle, Building2, DollarSign, BarChart2, Eye, RefreshCw, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

type NewsCategory = 'all' | 'market' | 'earnings' | 'policy' | 'global' | 'crypto' | 'commodity';
type Sentiment = 'positive' | 'negative' | 'neutral';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceLogo: string;
  category: NewsCategory;
  sentiment: Sentiment;
  symbols: string[];
  timestamp: string;
  readTime: string;
  imageColor: string;
  isBreaking?: boolean;
  bookmarked?: boolean;
}

const mockNews: NewsItem[] = [
  { id: 'n1', title: 'RBI keeps repo rate unchanged at 6.5% — accommodative stance continues', summary: 'The Reserve Bank of India maintained the repo rate at 6.5% for the ninth consecutive meeting, citing balanced inflation and growth concerns. Banking and realty stocks expected to react positively.', source: 'Economic Times', sourceLogo: 'ET', category: 'policy', sentiment: 'positive', symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'DLF'], timestamp: '15 min ago', readTime: '3 min read', imageColor: 'from-blue-500 to-cyan-500', isBreaking: true },
  { id: 'n2', title: 'TCS Q1 net profit rises 8.2% YoY to ₹12,040 crore, beats estimates', summary: 'Tata Consultancy Services reported better-than-expected Q1 results with revenue growth driven by BFSI and retail verticals in North America. Management guides for strong deal pipeline.', source: 'Moneycontrol', sourceLogo: 'MC', category: 'earnings', sentiment: 'positive', symbols: ['TCS', 'INFY', 'WIPRO', 'HCLTECH'], timestamp: '42 min ago', readTime: '4 min read', imageColor: 'from-primary-500 to-accent-500', isBreaking: true },
  { id: 'n3', title: 'Reliance Industries board approves ₹20,000 crore fund raise via rights issue', summary: 'RIL board cleared a fundraising plan through a rights issue to bolster its green energy and telecom ventures. Jio Financial and Reliance Power likely beneficiaries.', source: 'Business Standard', sourceLogo: 'BS', category: 'market', sentiment: 'neutral', symbols: ['RELIANCE', 'JIOFIN', 'RELIANCEPOWER'], timestamp: '1 hour ago', readTime: '5 min read', imageColor: 'from-purple-500 to-pink-500' },
  { id: 'n4', title: 'NIFTY 50 ends above 24,500 for first time, metals and auto lead rally', summary: 'Benchmark NIFTY 50 closed at a new all-time high of 24,580, lifted by strong gains in Tata Motors, M&M, and JSW Steel. Broader markets also participated.', source: 'Reuters', sourceLogo: 'R', category: 'market', sentiment: 'positive', symbols: ['NIFTY', 'TATAMOTORS', 'JSWSTEEL', 'M&M'], timestamp: '2 hours ago', readTime: '2 min read', imageColor: 'from-green-500 to-emerald-500' },
  { id: 'n5', title: 'Crude oil falls below $78/bbl on demand concerns from China', summary: 'Brent crude slipped 1.8% as weak Chinese manufacturing data raised concerns about demand outlook. OMC stocks like BPCL, HPCL likely to gain on lower input cost.', source: 'Bloomberg', sourceLogo: 'B', category: 'commodity', sentiment: 'negative', symbols: ['BPCL', 'HPCL', 'IOC', 'ONGC'], timestamp: '3 hours ago', readTime: '3 min read', imageColor: 'from-orange-500 to-red-500' },
  { id: 'n6', title: 'Foreign portfolio investors net buyers of ₹3,200 crore in Indian equities', summary: 'FPIs turned net buyers after 5 sessions of selling, with bulk inflows in banking and IT sectors. Signals improving global risk appetite for Indian markets.', source: 'Mint', sourceLogo: 'M', category: 'market', sentiment: 'positive', symbols: ['HDFCBANK', 'TCS', 'INFY'], timestamp: '4 hours ago', readTime: '3 min read', imageColor: 'from-cyan-500 to-blue-500' },
  { id: 'n7', title: 'SEBI tightens disclosure norms for SME IPOs after complaint surge', summary: 'Markets regulator SEBI announced stricter disclosure and due diligence requirements for small and medium enterprise IPOs following a surge in investor complaints.', source: 'CNBC', sourceLogo: 'C', category: 'policy', sentiment: 'neutral', symbols: [], timestamp: '5 hours ago', readTime: '4 min read', imageColor: 'from-yellow-500 to-orange-500' },
  { id: 'n8', title: 'US Fed signals September rate cut — FII flows likely to surge into India', summary: 'Fed Chair Powell hinted at a potential September rate cut, citing cooling inflation. Indian markets with high carry trade exposure expected to attract fresh flows.', source: 'CNBC', sourceLogo: 'C', category: 'global', sentiment: 'positive', symbols: ['NIFTY', 'BANKNIFTY'], timestamp: '6 hours ago', readTime: '3 min read', imageColor: 'from-violet-500 to-purple-500' },
  { id: 'n9', title: 'HDFC Bank reports 12% loan growth, NIM stays steady at 3.44%', summary: 'India\'s largest private lender reported strong advances growth with stable net interest margins. Asset quality improved with gross NPA at 1.24%.', source: 'NDTV Profit', sourceLogo: 'ND', category: 'earnings', sentiment: 'positive', symbols: ['HDFCBANK'], timestamp: '7 hours ago', readTime: '4 min read', imageColor: 'from-emerald-500 to-green-500' },
  { id: 'n10', title: 'Bitcoin breaks $67,000 as institutional inflows resume', summary: 'Bitcoin hit a new monthly high driven by renewed ETF inflows and corporate treasury allocations. Indian crypto-related stocks in green.', source: 'CoinDesk', sourceLogo: 'CD', category: 'crypto', sentiment: 'positive', symbols: ['COIN', 'MSTR'], timestamp: '8 hours ago', readTime: '2 min read', imageColor: 'from-amber-500 to-yellow-500' },
];

const CATEGORY_META: Record<NewsCategory, { label: string; color: string; icon: React.ComponentType<any> }> = {
  all: { label: 'All', color: 'text-dark-300 bg-dark-800', icon: Globe },
  market: { label: 'Markets', color: 'text-blue-400 bg-blue-500/10', icon: TrendingUp },
  earnings: { label: 'Earnings', color: 'text-primary-400 bg-primary-500/10', icon: DollarSign },
  policy: { label: 'Policy', color: 'text-purple-400 bg-purple-500/10', icon: Building2 },
  global: { label: 'Global', color: 'text-cyan-400 bg-cyan-500/10', icon: Globe },
  crypto: { label: 'Crypto', color: 'text-yellow-400 bg-yellow-500/10', icon: Hash },
  commodity: { label: 'Commodity', color: 'text-orange-400 bg-orange-500/10', icon: BarChart2 },
};

const SENTIMENT_META: Record<Sentiment, { label: string; color: string }> = {
  positive: { label: 'Positive', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  negative: { label: 'Negative', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  neutral: { label: 'Neutral', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

export default function News() {
  const [category, setCategory] = useState<NewsCategory>('all');
  const [sentiment, setSentiment] = useState<Sentiment | 'all'>('all');
  const [search, setSearch] = useState('');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(['n1', 'n4']));
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const filtered = useMemo(() => {
    return mockNews.filter(n => {
      const matchesCategory = category === 'all' || n.category === category;
      const matchesSentiment = sentiment === 'all' || n.sentiment === sentiment;
      const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.summary.toLowerCase().includes(search.toLowerCase()) ||
        n.symbols.some(s => s.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSentiment && matchesSearch;
    });
  }, [category, sentiment, search]);

  const trendingSymbols = useMemo(() => {
    const map: Record<string, number> = {};
    mockNews.forEach(n => n.symbols.forEach(s => { map[s] = (map[s] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, []);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <Newspaper size={24} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Market News</div>
              <p className="text-dark-400 text-sm mt-1">Real-time market, policy, and global financial news</p>
            </div>
          </h1>
        </div>
        <button onClick={() => toast.success('News refreshed')} className="btn-secondary gap-2"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(CATEGORY_META) as NewsCategory[]).map(cat => {
          const M = CATEGORY_META[cat];
          const Icon = M.icon;
          const count = cat === 'all' ? mockNews.length : mockNews.filter(n => n.category === cat).length;
          return (
            <button key={cat} onClick={() => setCategory(cat)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${category === cat ? M.color + ' ring-1 ring-primary-500/30' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>
              <Icon size={14} /> {M.label} <span className="badge bg-dark-900/50 text-xs">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={16} />
              <input type="text" placeholder="Search news, symbols..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
            </div>
            <select value={sentiment} onChange={e => setSentiment(e.target.value as Sentiment | 'all')} className="input w-40">
              <option value="all">All Sentiment</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          {filtered.length === 0 && (
            <div className="card p-12 text-center text-dark-500"><Newspaper size={36} className="mx-auto mb-3 opacity-30" /><p>No news matches your filters</p></div>
          )}

          {filtered.map(news => {
            const M = CATEGORY_META[news.category];
            const Icon = M.icon;
            const S = SENTIMENT_META[news.sentiment];
            return (
              <article key={news.id} className="card p-4 sm:p-5 hover:border-primary-500/40 transition-all cursor-pointer" onClick={() => setActiveArticle(news)}>
                <div className="flex items-start gap-4">
                  <div className={`hidden sm:block w-24 h-24 rounded-xl bg-gradient-to-br ${news.imageColor} flex-shrink-0 flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl font-bold text-white/90">{news.sourceLogo}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {news.isBreaking && <span className="badge bg-red-500 text-white text-xs font-bold animate-pulse">BREAKING</span>}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${M.color}`}>
                        <Icon size={10} /> {M.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${S.color}`}>{S.label}</span>
                    </div>
                    <h2 className="font-bold text-dark-50 text-lg leading-snug mb-2">{news.title}</h2>
                    <p className="text-sm text-dark-400 line-clamp-2">{news.summary}</p>
                    <div className="flex items-center justify-between mt-3 text-xs text-dark-500">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-medium text-dark-300">{news.source}</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> {news.timestamp}</span>
                        <span>{news.readTime}</span>
                      </div>
                    </div>
                    {news.symbols.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {news.symbols.map(s => (
                          <span key={s} className="badge bg-dark-800 hover:bg-dark-700 text-dark-300 text-xs cursor-pointer">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleBookmark(news.id); }} className={`p-2 rounded-lg flex-shrink-0 ${bookmarks.has(news.id) ? 'text-accent-400 bg-accent-500/10' : 'text-dark-400 hover:bg-dark-700'}`}>
                    {bookmarks.has(news.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-dark-100 mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-primary-400" /> Trending Symbols</h3>
            <div className="space-y-2">
              {trendingSymbols.map(([symbol, count]) => (
                <div key={symbol} className="flex items-center justify-between p-2 hover:bg-dark-800 rounded cursor-pointer">
                  <span className="font-mono text-sm text-dark-100">{symbol}</span>
                  <span className="badge bg-primary-500/20 text-primary-400 text-xs">{count} mentions</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-dark-100 mb-3 flex items-center gap-2"><Sparkles size={16} className="text-accent-400" /> AI Summary</h3>
            <p className="text-sm text-dark-300 leading-relaxed">
              Today's market sentiment is <span className="text-green-400 font-medium">cautiously bullish</span> with RBI policy support and positive earnings from TCS and HDFC Bank. Auto and metals leading the rally, while FMCG underperforming. Key event risks tomorrow: Q1 results from Infosys, Asian Paints and Bajaj Finance.
            </p>
          </div>

          <div className="card p-4">
            <h3 className="font-semibold text-dark-100 mb-3 flex items-center gap-2"><BookmarkCheck size={16} className="text-yellow-400" /> My Bookmarks</h3>
            {bookmarks.size === 0 ? (
              <p className="text-sm text-dark-500 text-center py-4">No bookmarks yet</p>
            ) : (
              <div className="space-y-2">
                {mockNews.filter(n => bookmarks.has(n.id)).map(n => (
                  <div key={n.id} className="p-2 hover:bg-dark-800 rounded cursor-pointer">
                    <p className="text-xs font-medium text-dark-200 line-clamp-2">{n.title}</p>
                    <p className="text-xs text-dark-500 mt-1">{n.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto" onClick={() => setActiveArticle(null)}>
          <div className="card-elevated max-w-2xl w-full my-8 scale-in" onClick={e => e.stopPropagation()}>
            <div className={`relative h-32 sm:h-40 rounded-t-xl bg-gradient-to-br ${activeArticle.imageColor} flex items-center justify-center`}>
              <span className="text-6xl font-bold text-white/90">{activeArticle.sourceLogo}</span>
              <button onClick={() => setActiveArticle(null)} className="absolute top-3 right-3 p-2 rounded-lg bg-black/40 hover:bg-black/60 text-white">
                <ChevronRight size={20} className="rotate-90" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {activeArticle.isBreaking && <span className="badge bg-red-500 text-white text-xs font-bold animate-pulse">BREAKING</span>}
                <span className="badge bg-primary-500/20 text-primary-400 text-xs">{CATEGORY_META[activeArticle.category].label}</span>
                <span className="badge bg-dark-700 text-dark-300 text-xs">{activeArticle.source}</span>
                <span className="text-xs text-dark-500">{activeArticle.timestamp}</span>
              </div>
              <h2 className="text-2xl font-bold text-dark-50 leading-tight">{activeArticle.title}</h2>
              <p className="text-dark-300 leading-relaxed">{activeArticle.summary}</p>
              <p className="text-dark-400 leading-relaxed">
                Additional context: This development comes amid heightened market activity and is expected to influence trading patterns in the coming sessions. Analysts are watching related stocks and sector indices closely for follow-through momentum.
              </p>
              {activeArticle.symbols.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-dark-300 mb-2">Related Symbols:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeArticle.symbols.map(s => <span key={s} className="badge bg-dark-800 text-dark-200 px-3 py-1">{s}</span>)}
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => { toggleBookmark(activeArticle.id); }} className="btn-secondary gap-2">
                  {bookmarks.has(activeArticle.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} {bookmarks.has(activeArticle.id) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <button onClick={() => toast.success('Article link copied')} className="btn-secondary gap-2"><Share2 size={16} /> Share</button>
                <button className="btn-primary gap-2 flex-1">Open Full Article <ExternalLink size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}