import { useState, useMemo } from 'react';
import {
  Search, Settings, Sparkles, Zap, Target, BarChart2, Shield, Globe,
  Database, Bell, Mail, Webhook, MessageSquare, Hash, Code2,
  Layers, List, Bot, Brain, LineChart, Activity, Compass, GitBranch,
  TrendingUp, AlertOctagon, Crosshair, Layers as LayersIcon, GitFork,
  Cpu, Workflow, Boxes, Network, Radio, Send, Inbox, Rss, Satellite,
  Cloud, CloudRain, Server, HardDrive, Monitor, Smartphone, BellRing,
  Webhook as WebhookIcon, Phone, MessageCircle, Newspaper, Trophy,
  Flame, Gauge, Microscope, FlaskConical, TestTube, Atom, Beaker
} from 'lucide-react';

type IconType = React.ComponentType<any>;

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  comingSoon?: boolean;
  icon: IconType;
}

const categories = [
  { id: 'scanner', name: 'Scanner', color: 'text-blue-400', bgColor: 'blue-500', icon: Search },
  { id: 'strategy', name: 'Strategy', color: 'text-purple-400', bgColor: 'purple-500', icon: Zap },
  { id: 'backtest', name: 'Backtest', color: 'text-green-400', bgColor: 'green-500', icon: BarChart2 },
  { id: 'risk', name: 'Risk', color: 'text-red-400', bgColor: 'red-500', icon: Shield },
  { id: 'alert', name: 'Alert', color: 'text-orange-400', bgColor: 'orange-500', icon: Bell },
  { id: 'data', name: 'Data', color: 'text-cyan-400', bgColor: 'cyan-500', icon: Database },
  { id: 'integration', name: 'Integration', color: 'text-pink-400', bgColor: 'pink-500', icon: Globe },
  { id: 'ai', name: 'AI', color: 'text-violet-400', bgColor: 'violet-500', icon: Brain },
];

const allTools: Tool[] = [
  // Scanner
  { id: 'symbol-scanner', name: 'Symbol Scanner', description: 'Scan symbols for patterns and signals across multiple timeframes', category: 'scanner', enabled: true, icon: Search },
  { id: 'pattern-detector', name: 'Pattern Detector', description: 'Automatically detect candlestick and chart patterns', category: 'scanner', enabled: true, icon: Activity },
  { id: 'volume-scanner', name: 'Volume Scanner', description: 'Detect unusual volume spikes across watchlist', category: 'scanner', enabled: true, icon: Gauge },
  { id: 'breakout-scanner', name: 'Breakout Scanner', description: 'Find stocks breaking out of consolidation', category: 'scanner', enabled: false, icon: Crosshair },

  // Strategy
  { id: 'strategy-builder', name: 'Strategy Builder', description: 'Visual strategy builder with drag-and-drop conditions', category: 'strategy', enabled: true, icon: Target },
  { id: 'momentum-strategy', name: 'Momentum Strategy', description: 'Ride strong trends with momentum-based entries', category: 'strategy', enabled: true, icon: TrendingUp },
  { id: 'mean-reversion', name: 'Mean Reversion', description: 'Fade extremes back to the mean', category: 'strategy', enabled: true, icon: Compass },
  { id: 'vwap-strategy', name: 'VWAP Reclaim', description: 'Intraday reclaim of VWAP as bullish signal', category: 'strategy', enabled: false, icon: LineChart },
  { id: 'supertrend', name: 'Supertrend Follower', description: 'Trend-following using Supertrend indicator', category: 'strategy', enabled: false, icon: GitBranch },

  // Backtest
  { id: 'backtest-engine', name: 'Backtest Engine', description: 'Run historical backtests on strategies with detailed metrics', category: 'backtest', enabled: true, icon: BarChart2 },
  { id: 'walk-forward', name: 'Walk-Forward Analysis', description: 'Robust backtest with out-of-sample testing', category: 'backtest', enabled: false, icon: GitFork },
  { id: 'monte-carlo', name: 'Monte Carlo Simulator', description: 'Probability distributions of strategy outcomes', category: 'backtest', enabled: false, icon: FlaskConical },

  // Risk
  { id: 'risk-manager', name: 'Risk Manager', description: 'Position sizing, stop-loss, and portfolio risk management', category: 'risk', enabled: true, icon: Shield },
  { id: 'position-sizer', name: 'Position Sizer', description: 'Kelly criterion and fixed-fractional sizing', category: 'risk', enabled: true, icon: Boxes },
  { id: 'correlation-matrix', name: 'Correlation Matrix', description: 'Visualize portfolio correlation heatmap', category: 'risk', enabled: false, icon: Network },

  // Alert
  { id: 'alert-engine', name: 'Alert Engine', description: 'Real-time alerts via multiple channels', category: 'alert', enabled: true, icon: Bell },
  { id: 'alert-prioritizer', name: 'Alert Prioritizer', description: 'ML-ranked alerts by historical win-rate', category: 'alert', enabled: false, icon: AlertOctagon },
  { id: 'cooldown-manager', name: 'Cooldown Manager', description: 'Smart deduplication to prevent alert fatigue', category: 'alert', enabled: true, icon: BellRing },

  // Data
  { id: 'data-feeder', name: 'Data Feeder', description: 'Multi-source market data aggregation and normalization', category: 'data', enabled: true, icon: Database },
  { id: 'nse-bse-analyzer', name: 'NSE/BSE Analyzer', description: 'Dedicated analysis views for Indian exchanges', category: 'data', enabled: true, icon: Server },
  { id: 'fundamental-data', name: 'Fundamental Data', description: 'P/E, P/B, ROE, debt ratios from screener.in', category: 'data', enabled: false, icon: Newspaper },
  { id: 'options-chain', name: 'Options Chain', description: 'Live NIFTY/BANKNIFTY options data with OI', category: 'data', enabled: false, icon: Workflow },

  // Integration
  { id: 'telegram-bot', name: 'Telegram Bot', description: 'Send alerts and receive commands via Telegram', category: 'integration', enabled: true, icon: MessageSquare },
  { id: 'discord-webhook', name: 'Discord Webhook', description: 'Post signals to Discord channels', category: 'integration', enabled: false, icon: Hash },
  { id: 'slack-integration', name: 'Slack Integration', description: 'Send signals to Slack workspaces', category: 'integration', enabled: false, icon: Send },
  { id: 'email-alerts', name: 'Email Alerts', description: 'Email notifications for signals and system events', category: 'integration', enabled: false, icon: Mail },
  { id: 'webhook-sender', name: 'Webhook Sender', description: 'Custom webhooks for external integrations', category: 'integration', enabled: false, icon: Webhook },
  { id: 'tradingview-webhook', name: 'TradingView Webhook', description: 'Receive alerts from TradingView', category: 'integration', enabled: false, comingSoon: true, icon: Code2 },
  { id: 'whatsapp-business', name: 'WhatsApp Business', description: 'Send alerts via WhatsApp Business API', category: 'integration', enabled: false, icon: Phone },
  { id: 'google-sheets', name: 'Google Sheets Sync', description: 'Auto-sync signals to spreadsheets', category: 'integration', enabled: false, icon: Inbox },
  { id: 'notion-journal', name: 'Notion Journal', description: 'Log trades and journal in Notion', category: 'integration', enabled: false, icon: Newspaper },

  // AI
  { id: 'codex-analyzer', name: 'Codex Analyzer', description: 'GPT-powered deep analysis of market conditions', category: 'ai', enabled: true, icon: Brain },
  { id: 'sentiment-analyzer', name: 'Sentiment Analyzer', description: 'News and social media sentiment scoring', category: 'ai', enabled: false, icon: Microscope },
  { id: 'pattern-recognition', name: 'AI Pattern Recognition', description: 'ML-based chart pattern detection beyond TA-Lib', category: 'ai', enabled: false, icon: Atom },
  { id: 'predictive-signals', name: 'Predictive Signals', description: 'LSTM-based price direction predictions', category: 'ai', enabled: false, icon: Cpu },
];

export function Tools() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);

  const toggleTool = (id: string) => {
    const tool = allTools.find(t => t.id === id);
    if (tool) tool.enabled = !tool.enabled;
  };

  const filteredTools = useMemo(() => {
    return allTools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter;
      const matchesEnabled = !showOnlyEnabled || tool.enabled;
      return matchesSearch && matchesCategory && matchesEnabled;
    });
  }, [searchQuery, categoryFilter, showOnlyEnabled]);

  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTools.map(tool => {
        const cat = categories.find(c => c.id === tool.category);
        const Icon = tool.icon;
        return (
          <div key={tool.id} className={`card group hover:border-primary-500/40 transition-all ${tool.enabled ? '' : 'opacity-60'}`}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${cat?.bgColor}/10 group-hover:bg-${cat?.bgColor}/20 transition-colors`}>
                  <Icon size={24} className={cat?.color} />
                </div>
                <span className="badge bg-dark-700 text-dark-300 text-xs capitalize">{cat?.name}</span>
              </div>
              <h3 className="font-semibold text-dark-50 mb-2 group-hover:text-primary-400 transition-colors">{tool.name}</h3>
              <p className="text-dark-400 text-sm mb-4 line-clamp-2">{tool.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                <span className={`badge ${tool.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                  {tool.enabled ? 'Enabled' : 'Disabled'}
                </span>
                {tool.comingSoon && <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">Coming Soon</span>}
                <button className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Configure"><Settings size={16} /></button>
              </div>
            </div>
          </div>
        );
      })}
      {filteredTools.length === 0 && (
        <div className="col-span-full p-12 text-center text-dark-500">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No tools found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderList = () => (
    <div className="space-y-2">
      {filteredTools.map(tool => {
        const cat = categories.find(c => c.id === tool.category);
        const Icon = tool.icon;
        return (
          <div key={tool.id} className={`card flex items-center gap-4 hover:border-primary-500/40 transition-all ${tool.enabled ? '' : 'opacity-60'}`}>
            <div className={`p-3 rounded-xl bg-${cat?.bgColor}/10 flex-shrink-0`}>
              <Icon size={22} className={cat?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-dark-100">{tool.name}</h3>
                <span className="badge bg-dark-700 text-dark-300 text-xs capitalize">{cat?.name}</span>
                {tool.comingSoon && <span className="badge bg-yellow-500/20 text-yellow-400 text-xs">Coming Soon</span>}
              </div>
              <p className="text-dark-400 text-sm truncate">{tool.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`badge ${tool.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {tool.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tool.enabled} onChange={() => toggleTool(tool.id)} className="w-5 h-5 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-dark-300">Toggle</span>
              </label>
              <button className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Configure"><Settings size={18} /></button>
            </div>
          </div>
        );
      })}
      {filteredTools.length === 0 && (
        <div className="p-12 text-center text-dark-500">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No tools found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderMarketplace = () => (
    <div className="mt-6 pt-6 border-t border-dark-700">
      <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-purple-400" />
        Tool Marketplace
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'TradingView Webhook', desc: 'Receive alerts from TradingView', cat: 'Integration', icon: Code2, color: 'pink' },
          { name: 'Discord Bot Pro', desc: 'Advanced Discord bot with slash commands', cat: 'Integration', icon: Hash, color: 'pink' },
          { name: 'Slack Pro', desc: 'Send rich signals to Slack workspaces', cat: 'Integration', icon: Send, color: 'pink' },
          { name: 'Google Sheets Sync', desc: 'Auto-sync signals to spreadsheets', cat: 'Data', icon: Inbox, color: 'cyan' },
          { name: 'Notion Database', desc: 'Log trades and journal in Notion', cat: 'Data', icon: Newspaper, color: 'cyan' },
          { name: 'Telegram Bot Builder', desc: 'Create custom Telegram bots', cat: 'Integration', icon: Bot, color: 'pink' },
          { name: 'GPT Strategy Coach', desc: 'AI coach that reviews your strategies', cat: 'AI', icon: Brain, color: 'violet' },
          { name: 'Onchain Whale Alerts', desc: 'Track smart money on-chain moves', cat: 'Data', icon: Satellite, color: 'cyan' },
          { name: 'Options Flow', desc: 'Unusual options activity detector', cat: 'Scanner', icon: Activity, color: 'blue' },
        ].map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} className="card text-left hover:border-primary-500/50 transition-all group cursor-pointer" onClick={() => alert(`Install ${t.name} - Coming Soon`)}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`p-2 rounded-lg bg-${t.color}-500/10 text-${t.color}-400 group-hover:bg-${t.color}-500/20 transition-colors`}>
                  <Icon size={20} />
                </span>
                <span className={`badge bg-${t.color}-500/20 text-${t.color}-400 text-xs`}>{t.cat}</span>
              </div>
              <h4 className="font-semibold text-dark-100 mb-1">{t.name}</h4>
              <p className="text-dark-400 text-sm mb-3">{t.desc}</p>
              <button className="btn-secondary text-sm w-full">Install</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const stats = {
    total: allTools.length,
    enabled: allTools.filter(t => t.enabled).length,
    byCategory: categories.map(c => ({
      ...c,
      count: allTools.filter(t => t.category === c.id).length,
    })),
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/10">
              <Sparkles size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-dark-50">Tools & Scanners</div>
              <p className="text-dark-400 text-sm mt-1">Manage your scanning, analysis, and automation tools</p>
            </div>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><Layers size={20} /></button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><List size={20} /></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <button onClick={() => setCategoryFilter('all')} className={`card p-3 text-center transition-all ${categoryFilter === 'all' ? 'ring-2 ring-primary-500/50' : ''}`}>
          <p className="text-2xl font-bold text-dark-50">{stats.total}</p>
          <p className="text-xs text-dark-400">All Tools</p>
        </button>
        {stats.byCategory.map(c => {
          const Icon = c.icon;
          return (
            <button key={c.id} onClick={() => setCategoryFilter(c.id)} className={`card p-3 text-center transition-all ${categoryFilter === c.id ? 'ring-2 ring-primary-500/50' : ''}`}>
              <Icon size={18} className={`mx-auto mb-1 ${c.color}`} />
              <p className="text-lg font-bold text-dark-50">{c.count}</p>
              <p className="text-xs text-dark-400">{c.name}</p>
            </button>
          );
        })}
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input w-48">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer self-center">
            <input type="checkbox" checked={showOnlyEnabled} onChange={e => setShowOnlyEnabled(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-dark-300">Enabled only</span>
          </label>
        </div>
      </div>

      {viewMode === 'grid' ? renderGrid() : renderList()}
      {renderMarketplace()}
    </div>
  );
}