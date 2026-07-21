import {
  Bell, ChevronDown, ChevronUp, Download, RefreshCw, AlertTriangle, TrendingUp, TrendingDown,
  Search, Filter, Eye, EyeOff, CheckCircle, XCircle, Clock, Calendar, FileText, BarChart3,
  Wand2, Sparkles, Share2, BellRing, BellOff, Mail, Smartphone, Webhook, Radio, Volume2,
  Save, History, Github, GitBranch, LayoutDashboard, Wifi, Database, Key, Shield, Terminal,
  Globe, Palette, Trash2, Settings, Moon, Sun, Monitor, TestTube, Info, WifiOff, ToggleLeft,
  ToggleRight, Upload, Cloud, Server, Cpu, HardDrive, Monitor as MonitorIcon, Smartphone as SmartphoneIcon,
  Bell as BellIcon, Mail as MailIcon, Webhook as WebhookIcon, Radio as RadioIcon, Volume2 as VolumeIcon,
  Plus, Edit, Trash2 as TrashIcon, Copy, ArrowRight, ArrowLeft, Minimize2, Maximize2, RotateCcw,
  RotateCw, Flag, FlagOff, Bookmark, BookmarkPlus, Archive, ArchiveRestore,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, MessageSquare, Hash, Phone, MessageCircle,
  ListChecks, Zap as ZapIcon, Layers, Check, X, Zap
} from 'lucide-react';
import { useState, useMemo } from 'react';
import React from 'react';

interface Alert {
  id: string;
  symbol: string;
  pattern: string;
  timeframe: string;
  price: number;
  direction: 'bullish' | 'bearish' | 'neutral';
  strategy?: string;
  timestamp: string;
  confidence: number;
  status: 'new' | 'acknowledged' | 'dismissed' | 'executed' | 'expired';
  channel?: string;
  notes?: string;
  tags?: string[];
}

const mockAlerts: Alert[] = [
  { id: '1', symbol: 'RELIANCE.NS', pattern: 'Bullish Engulfing', timeframe: '15m', price: 2543.20, direction: 'bullish', strategy: 'bullish_engulfing_trend', timestamp: '2024-01-15 10:30:15', confidence: 87, status: 'new', channel: 'Telegram', tags: ['high-confidence', 'trend-following'] },
  { id: '2', symbol: 'TCS.NS', pattern: 'Hammer', timeframe: '1h', price: 3890.50, direction: 'bullish', strategy: 'bullish_reversal', timestamp: '2024-01-15 10:15:42', confidence: 72, status: 'acknowledged', channel: 'Telegram', tags: ['reversal'] },
  { id: '3', symbol: '^NSEBANK', pattern: 'Bearish Engulfing', timeframe: '1h', price: 52180.30, direction: 'bearish', strategy: 'bearish_reversal_top', timestamp: '2024-01-15 10:02:18', confidence: 81, status: 'new', channel: 'Email', tags: ['high-confidence', 'mean-reversion'] },
  { id: '4', symbol: 'INFY.NS', pattern: 'Morning Star', timeframe: '1d', price: 1520.75, direction: 'bullish', strategy: 'morning_star_reversal', timestamp: '2024-01-15 08:45:00', confidence: 69, status: 'executed', channel: 'Push Notification', tags: ['swing-trade'] },
  { id: '5', symbol: 'HDFCBANK.NS', pattern: 'Shooting Star', timeframe: '15m', price: 1645.90, direction: 'bearish', timestamp: '2024-01-15 08:30:22', confidence: 58, status: 'dismissed', channel: 'Telegram', tags: [] },
  { id: '6', symbol: 'ICICIBANK.NS', pattern: 'Three White Soldiers', timeframe: '1h', price: 1080.45, direction: 'bullish', strategy: 'bullish_momentum', timestamp: '2024-01-15 07:55:10', confidence: 78, status: 'new', channel: 'Telegram', tags: ['momentum'] },
  { id: '7', symbol: 'BAJFINANCE.NS', pattern: 'Evening Star', timeframe: '1d', price: 7200.00, direction: 'bearish', timestamp: '2024-01-15 07:30:00', confidence: 65, status: 'acknowledged', channel: 'Webhook', tags: ['reversal'] },
  { id: '8', symbol: 'MARUTI.NS', pattern: 'Piercing Line', timeframe: '15m', price: 10500.50, direction: 'bullish', timestamp: '2024-01-15 07:15:33', confidence: 61, status: 'new', channel: 'Telegram', tags: ['reversal'] },
  { id: '9', symbol: 'ASIANPAINT.NS', pattern: 'Dark Cloud Cover', timeframe: '1h', price: 2980.25, direction: 'bearish', strategy: 'bearish_reversal_top', timestamp: '2024-01-15 06:45:00', confidence: 73, status: 'expired', channel: 'Telegram', tags: ['reversal'] },
  { id: '10', symbol: 'LT.NS', pattern: 'Morning Star', timeframe: '1d', price: 3200.00, direction: 'bullish', strategy: 'morning_star_reversal', timestamp: '2024-01-15 06:30:00', confidence: 82, status: 'new', channel: 'Email', tags: ['swing-trade', 'high-confidence'] },
  { id: '11', symbol: 'TATAMOTORS.NS', pattern: 'Supertrend Buy', timeframe: '1h', price: 945.20, direction: 'bullish', strategy: 'supertrend_follower', timestamp: '2024-01-15 09:45:00', confidence: 75, status: 'executed', channel: 'Push Notification', tags: ['trend-following'] },
  { id: '12', symbol: 'WIPRO.NS', pattern: 'RSI Oversold', timeframe: '5m', price: 450.30, direction: 'bullish', strategy: 'mean_reversion_scalper', timestamp: '2024-01-15 09:30:00', confidence: 68, status: 'new', channel: 'Telegram', tags: ['scalping'] },
  { id: '13', symbol: 'SBIN.NS', pattern: 'MACD Bullish Cross', timeframe: '1h', price: 650.80, direction: 'bullish', strategy: 'trend_following_breakout', timestamp: '2024-01-15 09:15:00', confidence: 71, status: 'acknowledged', channel: 'Telegram', tags: ['trend-following'] },
  { id: '14', symbol: 'BHARTIARTL.NS', pattern: 'VWAP Reclaim', timeframe: '15m', price: 1150.40, direction: 'bullish', strategy: 'vwap_reclaim', timestamp: '2024-01-15 09:20:00', confidence: 63, status: 'new', channel: 'Discord', tags: ['intraday'] },
  { id: '15', symbol: 'NESTLEIND.NS', pattern: 'Bearish Harami', timeframe: '1d', price: 2200.50, direction: 'bearish', timestamp: '2024-01-15 06:00:00', confidence: 55, status: 'dismissed', channel: 'Email', tags: ['reversal'] },
];

const timeframes = ['All', '1m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w', '1M'];
const directions = ['All', 'Bullish', 'Bearish', 'Neutral'];
const statuses = ['All', 'New', 'Acknowledged', 'Dismissed', 'Executed', 'Expired'];
const channels = ['All', 'Telegram', 'Email', 'Push Notification', 'Webhook', 'Discord', 'Slack', 'WhatsApp', 'SMS'];

export default function AlertsPage() {
  const [alerts] = useState(mockAlerts);
  const [search, setSearch] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [selectedDirection, setSelectedDirection] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Alert; direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'timeline'>('table');
  const [groupBy, setGroupBy] = useState<'none' | 'symbol' | 'strategy' | 'status' | 'channel' | 'date'>('none');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showOnlyHighConfidence, setShowOnlyHighConfidence] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        const matchesSearch = alert.symbol.toLowerCase().includes(search.toLowerCase()) ||
          alert.pattern.toLowerCase().includes(search.toLowerCase()) ||
          alert.strategy?.toLowerCase().includes(search.toLowerCase()) ||
          alert.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
        const matchesTimeframe = selectedTimeframe === 'All' || alert.timeframe === selectedTimeframe;
        const matchesDirection = selectedDirection === 'All' ||
          (selectedDirection === 'Bullish' && alert.direction === 'bullish') ||
          (selectedDirection === 'Bearish' && alert.direction === 'bearish') ||
          (selectedDirection === 'Neutral' && alert.direction === 'neutral');
        const matchesStatus = selectedStatus === 'All' || alert.status === selectedStatus.toLowerCase();
        const matchesChannel = selectedChannel === 'All' || alert.channel === selectedChannel;
        const matchesConfidence = !showOnlyHighConfidence || alert.confidence >= 75;
        return matchesSearch && matchesTimeframe && matchesDirection && matchesStatus && matchesChannel && matchesConfidence;
      })
      .sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [alerts, search, selectedTimeframe, selectedDirection, selectedStatus, selectedChannel, sortConfig, showOnlyHighConfidence]);

  const handleSort = (key: keyof Alert) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="text-green-400" size={16} />;
      case 'bearish': return <TrendingDown className="text-red-400" size={16} />;
      default: return <span className="text-gray-400">−</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-blue-500/20 text-blue-400',
      acknowledged: 'bg-yellow-500/20 text-yellow-400',
      dismissed: 'bg-gray-500/20 text-gray-400',
      executed: 'bg-green-500/20 text-green-400',
      expired: 'bg-red-500/20 text-red-400',
    };
    return <span className={`badge ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>{status}</span>;
  };

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-dark-400 border-b border-dark-700">
            <th className="p-3 w-10"><input type="checkbox" className="w-4 h-4 rounded border-dark-600 text-primary-500" /></th>
            <th className="p-3 cursor-pointer hover:text-primary-400" onClick={() => handleSort('symbol')}>Symbol <TrendingUpIcon size={12} className="inline ml-1" /></th>
            <th className="p-3 cursor-pointer hover:text-primary-400" onClick={() => handleSort('pattern')}>Pattern <TrendingUpIcon size={12} className="inline ml-1" /></th>
            <th className="p-3">Timeframe</th>
            <th className="p-3 cursor-pointer hover:text-primary-400" onClick={() => handleSort('price')}>Price <TrendingUpIcon size={12} className="inline ml-1" /></th>
            <th className="p-3">Direction</th>
            <th className="p-3 cursor-pointer hover:text-primary-400" onClick={() => handleSort('confidence')}>Confidence <TrendingUpIcon size={12} className="inline ml-1" /></th>
            <th className="p-3">Status</th>
            <th className="p-3 cursor-pointer hover:text-primary-400" onClick={() => handleSort('timestamp')}>Time <TrendingUpIcon size={12} className="inline ml-1" /></th>
            <th className="p-3">Channel</th>
            <th className="p-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {filteredAlerts.map(alert => (
            <tr key={alert.id} className="border-b border-dark-700 hover:bg-dark-800/50 transition-colors">
              <td className="p-3"><input type="checkbox" checked={selectedAlerts.has(alert.id)} onChange={() => toggleSelect(alert.id)} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" /></td>
              <td className="p-3 font-medium text-dark-100">{alert.symbol}</td>
              <td className="p-3 text-dark-300">{alert.pattern}</td>
              <td className="p-3"><span className="badge bg-blue-500/20 text-blue-400 text-xs">{alert.timeframe}</span></td>
              <td className="p-3 text-dark-300 font-mono">{alert.price.toLocaleString()}</td>
              <td className="p-3">{getDirectionIcon(alert.direction)}</td>
              <td className="p-3 font-medium text-yellow-400">{alert.confidence}%</td>
              <td className="p-3">{getStatusBadge(alert.status)}</td>
              <td className="p-3 text-dark-400 text-sm font-mono">{alert.timestamp}</td>
              <td className="p-3">
                <span className="badge bg-purple-500/20 text-purple-400 text-xs">
                  {alert.channel?.charAt(0)}...
                </span>
              </td>
              <td className="p-3">
                <button onClick={() => toggleExpand(alert.id)} className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors">
                  {expandedId === alert.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </td>
            </tr>
          ))}
          {filteredAlerts.length === 0 && (
            <tr>
              <td colSpan={11} className="p-12 text-center text-dark-500">
                <BellOff size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No alerts found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredAlerts.map(alert => (
        <div key={alert.id} className="card border border-dark-700">
          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-dark-100">{alert.symbol}</h3>
                <span className="badge bg-blue-500/20 text-blue-400 text-xs">{alert.timeframe}</span>
                <span className="badge bg-purple-500/20 text-purple-400 text-xs">{alert.pattern}</span>
              </div>
              {getStatusBadge(alert.status)}
            </div>
            <p className="text-dark-400 text-sm mb-4">{alert.strategy || 'No strategy'}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-yellow-400">{getDirectionIcon(alert.direction)} <span className="font-bold">{alert.confidence}%</span></span>
                <span className="text-dark-400 font-mono">{alert.price.toLocaleString()}</span>
                <span className="badge bg-purple-500/20 text-purple-400 text-xs">{alert.channel?.charAt(0)}...</span>
              </div>
              <span className="text-dark-500 text-xs">{alert.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
      {filteredAlerts.length === 0 && (
        <div className="col-span-full p-12 text-center text-dark-500">
          <BellOff size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No alerts found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      {filteredAlerts.map((alert, index) => (
        <div key={alert.id} className="card flex items-center gap-4">
          <div className="flex flex-col items-center w-12 border-r border-dark-700 py-4 relative">
            <div className="w-3 h-3 rounded-full bg-primary-500 z-10" />
            {index < filteredAlerts.length - 1 && <div className="absolute top-8 bottom-0 left-5.5 w-0.5 bg-dark-700" />}
            <span className="text-xs text-dark-500 -mt-4">{alert.timestamp.split(' ')[1]}</span>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-dark-100">{alert.symbol}</h3>
              <span className="badge bg-blue-500/20 text-blue-400 text-xs">{alert.timeframe}</span>
              <span className="badge bg-purple-500/20 text-purple-400 text-xs">{alert.pattern}</span>
              {getStatusBadge(alert.status)}
              {getDirectionIcon(alert.direction)}
              <span className="font-bold text-yellow-400 ml-auto">{alert.confidence}%</span>
            </div>
            <p className="text-dark-400 text-sm mb-2">{alert.strategy || 'No strategy'}</p>
            <div className="flex items-center gap-4 text-sm text-dark-500">
              <span className="font-mono">{alert.price.toLocaleString()}</span>
              <span className="badge bg-purple-500/20 text-purple-400 text-xs">{alert.channel}</span>
              <span>{alert.timestamp}</span>
            </div>
          </div>
        </div>
      ))}
      {filteredAlerts.length === 0 && (
        <div className="p-12 text-center text-dark-500">
          <BellOff size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">No alerts found</p>
          <p className="text-sm">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-50">Alerts</h2>
          <p className="text-dark-400">Manage and monitor your trading alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><LayoutDashboard size={20} /></button>
          <button onClick={() => setViewMode('cards')} className={`p-2 rounded ${viewMode === 'cards' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><Layers size={20} /></button>
          <button onClick={() => setViewMode('timeline')} className={`p-2 rounded ${viewMode === 'timeline' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><GitBranch size={20} /></button>
        </div>
      </div>

      <div className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={20} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select value={selectedTimeframe} onChange={e => setSelectedTimeframe(e.target.value)} className="input w-36">
            {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
          <select value={selectedDirection} onChange={e => setSelectedDirection(e.target.value)} className="input w-36">
            {directions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="input w-36">
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={selectedChannel} onChange={e => setSelectedChannel(e.target.value)} className="input w-36">
            {channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showOnlyHighConfidence} onChange={e => setShowOnlyHighConfidence(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
            <span className="text-sm text-dark-300">High confidence only</span>
          </label>
        </div>
      </div>

      {viewMode === 'table' && renderTable()}
      {viewMode === 'cards' && renderCards()}
      {viewMode === 'timeline' && renderTimeline()}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
        <p className="text-sm text-dark-400">
          Showing {filteredAlerts.length} of {alerts.length} alerts
        </p>
        <div className="flex gap-2">
          <button className="btn-ghost px-3 py-1.5 text-sm" disabled>Previous</button>
          <button className="btn-ghost px-3 py-1.5 text-sm" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}