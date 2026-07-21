import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, Play, Pause, RefreshCw, Zap, Activity, Target, Volume2,
  TrendingUp, TrendingDown, Eye, Plus, X, ChevronDown, Settings, Sparkles,
  Brain, BarChart2, Crosshair, Gauge, Flame, Radio, Layers, SlidersHorizontal
} from 'lucide-react';
import {
  LineChart, Line, ResponsiveContainer, Tooltip
} from 'recharts';
import toast from 'react-hot-toast';

interface ScanResult {
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  price: number;
  change: number;
  changePct: number;
  volume: number;
  relativeVolume: number;
  pattern: string;
  signalStrength: number;
  rsi: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  sparkline: number[];
  marketCap: number;
  timestamp: string;
}

const SPARK_DATA = Array.from({ length: 20 }, () => Math.random() * 100);

const initialResults: ScanResult[] = [
  { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', price: 945.20, change: 29.40, changePct: 3.2, volume: 12500000, relativeVolume: 2.8, pattern: 'Bullish Engulfing', signalStrength: 92, rsi: 68, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 325000, timestamp: '14:32' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', exchange: 'NSE', price: 7200.00, change: 196.80, changePct: 2.8, volume: 8500000, relativeVolume: 2.1, pattern: 'Breakout + Volume', signalStrength: 88, rsi: 71, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 442000, timestamp: '14:31' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', exchange: 'NSE', price: 2100.50, change: 49.30, changePct: 2.4, volume: 5200000, relativeVolume: 1.9, pattern: 'Three White Soldiers', signalStrength: 85, rsi: 66, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 264000, timestamp: '14:30' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', exchange: 'NSE', price: 890.30, change: 16.60, changePct: 1.9, volume: 9800000, relativeVolume: 2.4, pattern: 'Hammer + Support', signalStrength: 79, rsi: 58, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 215000, timestamp: '14:28' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', price: 1645.90, change: 13.00, changePct: 0.8, volume: 9800000, relativeVolume: 1.4, pattern: 'Golden Cross', signalStrength: 74, rsi: 62, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 1250000, timestamp: '14:25' },
  { symbol: 'CIPLA', name: 'Cipla', exchange: 'NSE', price: 1480.20, change: -13.40, changePct: -0.9, volume: 4500000, relativeVolume: 1.5, pattern: 'Bearish Harami', signalStrength: 71, rsi: 38, trend: 'bearish', sparkline: SPARK_DATA, marketCap: 119000, timestamp: '14:22' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', exchange: 'NSE', price: 4800.00, change: -87.80, changePct: -1.8, volume: 1200000, relativeVolume: 1.7, pattern: 'Evening Star', signalStrength: 82, rsi: 28, trend: 'bearish', sparkline: SPARK_DATA, marketCap: 115000, timestamp: '14:20' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', exchange: 'NSE', price: 145.80, change: 3.00, changePct: 2.1, volume: 28000000, relativeVolume: 3.1, pattern: 'Volume Breakout', signalStrength: 87, rsi: 65, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 174000, timestamp: '14:18' },
  { symbol: 'COALINDIA', name: 'Coal India', exchange: 'NSE', price: 425.60, change: 7.50, changePct: 1.8, volume: 15200000, relativeVolume: 1.8, pattern: 'Marubozu', signalStrength: 73, rsi: 60, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 262000, timestamp: '14:15' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', exchange: 'NSE', price: 2980.25, change: -33.30, changePct: -1.1, volume: 1800000, relativeVolume: 1.3, pattern: 'Dark Cloud Cover', signalStrength: 68, rsi: 42, trend: 'bearish', sparkline: SPARK_DATA, marketCap: 286000, timestamp: '14:12' },
  { symbol: 'TITAN', name: 'Titan Company', exchange: 'NSE', price: 3620.50, change: 47.20, changePct: 1.3, volume: 2100000, relativeVolume: 1.6, pattern: 'Cup & Handle', signalStrength: 77, rsi: 64, trend: 'bullish', sparkline: SPARK_DATA, marketCap: 321000, timestamp: '14:10' },
  { symbol: 'WIPRO', name: 'Wipro', exchange: 'NSE', price: 450.30, change: -5.50, changePct: -1.2, volume: 6800000, relativeVolume: 1.4, pattern: 'Shooting Star', signalStrength: 71, rsi: 41, trend: 'bearish', sparkline: SPARK_DATA, marketCap: 234000, timestamp: '14:08' },
];

const PRESET_SCANS = [
  { id: 'momentum', name: 'Momentum Breakout', icon: TrendingUp, color: 'green', desc: 'Stocks breaking out with volume', count: 24 },
  { id: 'oversold', name: 'Oversold Bounce', icon: Activity, color: 'blue', desc: 'RSI < 30 reversal candidates', count: 12 },
  { id: 'volume', name: 'Volume Spike', icon: Volume2, color: 'purple', desc: '2x+ avg volume today', count: 38 },
  { id: '52w-high', name: '52-Week High', icon: Target, color: 'accent', desc: 'Stocks at new 52-week highs', count: 8 },
  { id: 'ma-cross', name: 'Golden Cross', icon: Zap, color: 'yellow', desc: '50 SMA crosses 200 SMA up', count: 15 },
  { id: 'vwap', name: 'VWAP Reclaim', icon: BarChart2, color: 'cyan', desc: 'Reclaimed VWAP with strength', count: 19 },
  { id: 'oi-buildup', name: 'Long Buildup (Options)', icon: Layers, color: 'pink', desc: 'Call OI up + price up', count: 22 },
  { id: 'rsi-extreme', name: 'RSI Extreme', icon: Gauge, color: 'red', desc: 'RSI > 70 or < 30', count: 41 },
];

const colorMap: Record<string, string> = {
  green: 'text-green-400 bg-green-500/10 border-green-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  accent: 'text-accent-400 bg-accent-500/10 border-accent-500/30',
  yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  pink: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
  red: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function Scanner() {
  const [results, setResults] = useState<ScanResult[]>(initialResults);
  const [scanning, setScanning] = useState(true);
  const [scanInterval, setScanInterval] = useState(60);
  const [search, setSearch] = useState('');
  const [trendFilter, setTrendFilter] = useState<string>('all');
  const [minStrength, setMinStrength] = useState(60);
  const [watchedSymbols, setWatchedSymbols] = useState<Set<string>>(new Set());
  const [lastScan, setLastScan] = useState(new Date());

  useEffect(() => {
    if (!scanning) return;
    const timer = setInterval(() => {
      setLastScan(new Date());
    }, scanInterval * 1000);
    return () => clearInterval(timer);
  }, [scanning, scanInterval]);

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchesSearch = r.symbol.toLowerCase().includes(search.toLowerCase()) ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.pattern.toLowerCase().includes(search.toLowerCase());
      const matchesTrend = trendFilter === 'all' || r.trend === trendFilter;
      const matchesStrength = r.signalStrength >= minStrength;
      return matchesSearch && matchesTrend && matchesStrength;
    }).sort((a, b) => b.signalStrength - a.signalStrength);
  }, [results, search, trendFilter, minStrength]);

  const summary = useMemo(() => {
    return {
      bullish: results.filter(r => r.trend === 'bullish').length,
      bearish: results.filter(r => r.trend === 'bearish').length,
      avgStrength: results.length > 0 ? results.reduce((a, r) => a + r.signalStrength, 0) / results.length : 0,
      highVolume: results.filter(r => r.relativeVolume >= 2).length,
    };
  }, [results]);

  const toggleWatch = (symbol: string) => {
    setWatchedSymbols(prev => {
      const next = new Set(prev);
      if (next.has(symbol)) next.delete(symbol);
      else next.add(symbol);
      return next;
    });
    if (!watchedSymbols.has(symbol)) toast.success(`${symbol} added to watchlist`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className={`p-2 rounded-xl ${scanning ? 'bg-primary-500/20' : 'bg-dark-700'}`}>
              <Radio size={24} className={scanning ? 'text-primary-400 animate-pulse' : 'text-dark-400'} />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Live Scanner</div>
              <p className="text-dark-400 text-sm mt-1">
                {scanning ? <>Scanning every <span className="text-primary-400 font-mono">{scanInterval}s</span> • Last: <span className="font-mono">{lastScan.toLocaleTimeString()}</span></> : 'Paused'}
              </p>
            </div>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={scanInterval} onChange={e => setScanInterval(parseInt(e.target.value))} className="input w-28">
            <option value="30">30s</option>
            <option value="60">1m</option>
            <option value="300">5m</option>
            <option value="900">15m</option>
          </select>
          <button onClick={() => setScanning(s => !s)} className={`btn-${scanning ? 'danger' : 'primary'} gap-2`}>
            {scanning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
          </button>
          <button onClick={() => { setResults(prev => prev.map(r => ({ ...r, price: parseFloat((r.price * (0.998 + Math.random() * 0.004)).toFixed(2)), change: parseFloat((r.change + (Math.random() - 0.5) * 2).toFixed(2)), timestamp: new Date().toLocaleTimeString().slice(0, 5) }))); setLastScan(new Date()); toast.success('Scan refreshed — prices updated'); }} className="btn-secondary gap-2">
            <RefreshCw size={18} /> Scan Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Bullish</span><TrendingUp size={14} className="text-green-400" /></div><p className="text-2xl font-bold text-green-400 mt-1">{summary.bullish}</p></div>
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Bearish</span><TrendingDown size={14} className="text-red-400" /></div><p className="text-2xl font-bold text-red-400 mt-1">{summary.bearish}</p></div>
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">High Volume</span><Volume2 size={14} className="text-purple-400" /></div><p className="text-2xl font-bold text-purple-400 mt-1">{summary.highVolume}</p></div>
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Avg Strength</span><Flame size={14} className="text-accent-400" /></div><p className="text-2xl font-bold text-accent-400 mt-1">{summary.avgStrength.toFixed(0)}</p></div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2"><Sparkles size={16} /> Preset Scans</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {PRESET_SCANS.map(scan => {
            const Icon = scan.icon;
            return (
              <button key={scan.id} onClick={() => toast.success(`Running ${scan.name}...`)} className={`card text-left p-3 hover:border-${scan.color}-500/50 transition-all group`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg border ${colorMap[scan.color]}`}>
                    <Icon size={16} />
                  </div>
                  <span className="badge bg-dark-700 text-dark-300 text-xs">{scan.count}</span>
                </div>
                <p className="font-medium text-dark-100 text-sm">{scan.name}</p>
                <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{scan.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input type="text" placeholder="Search symbol, pattern..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={trendFilter} onChange={e => setTrendFilter(e.target.value)} className="input w-32">
            <option value="all">All Trends</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
          </select>
          <div className="flex items-center gap-2 px-3 bg-dark-800/50 rounded-lg border border-dark-600 w-full sm:w-64">
            <SlidersHorizontal size={14} className="text-dark-400 flex-shrink-0" />
            <span className="text-xs text-dark-400 whitespace-nowrap">Min strength:</span>
            <input type="range" min="0" max="100" value={minStrength} onChange={e => setMinStrength(parseInt(e.target.value))} className="flex-1" />
            <span className="text-xs font-mono text-primary-400 w-8">{minStrength}</span>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-dark-400 border-b border-dark-700 text-xs uppercase">
                <th className="p-3">Symbol</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-right">Change</th>
                <th className="p-3 hidden md:table-cell">Pattern</th>
                <th className="p-3 hidden md:table-cell text-right">Volume</th>
                <th className="p-3 hidden md:table-cell text-right">RSI</th>
                <th className="p-3">Trend</th>
                <th className="p-3 text-center">Signal</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredResults.map(r => (
                <tr key={r.symbol + r.timestamp} className="hover:bg-dark-800/50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-dark-100">{r.symbol}</span>
                      <span className="badge bg-dark-700 text-dark-400 text-xs">{r.exchange}</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-0.5">{r.name}</p>
                  </td>
                  <td className="p-3 text-right font-mono text-dark-100">₹{r.price.toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <div className={`font-mono font-semibold ${r.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{r.changePct >= 0 ? '+' : ''}{r.changePct.toFixed(2)}%</div>
                    <div className="text-xs text-dark-500">{r.change >= 0 ? '+' : ''}₹{r.change.toFixed(2)}</div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <span className="badge bg-primary-500/20 text-primary-400 text-xs">{r.pattern}</span>
                  </td>
                  <td className="p-3 hidden md:table-cell text-right">
                    <div className="font-mono text-dark-200">{(r.volume / 1000000).toFixed(2)}M</div>
                    <div className={`text-xs ${r.relativeVolume >= 2 ? 'text-purple-400' : 'text-dark-500'}`}>{r.relativeVolume.toFixed(1)}x avg</div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-right">
                    <span className={`font-mono font-semibold ${r.rsi >= 70 ? 'text-red-400' : r.rsi <= 30 ? 'text-green-400' : 'text-dark-200'}`}>{r.rsi}</span>
                  </td>
                  <td className="p-3">
                    <div className="w-20 h-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={r.sparkline.map((v, i) => ({ x: i, y: v }))}>
                          <Line type="monotone" dataKey="y" stroke={r.trend === 'bullish' ? '#22c55e' : r.trend === 'bearish' ? '#ef4444' : '#94a3b8'} strokeWidth={1.5} dot={false} />
                          <Tooltip contentStyle={{ display: 'none' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <div className="w-12 h-2 bg-dark-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${r.signalStrength >= 80 ? 'bg-green-500' : r.signalStrength >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.signalStrength}%` }} />
                      </div>
                      <span className="text-xs font-mono text-dark-300">{r.signalStrength}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleWatch(r.symbol)} className={`p-1.5 rounded ${watchedSymbols.has(r.symbol) ? 'text-primary-400 bg-primary-500/10' : 'text-dark-400 hover:bg-dark-700'}`} title={watchedSymbols.has(r.symbol) ? 'Watching' : 'Add to watchlist'}>
                      <Eye size={14} fill={watchedSymbols.has(r.symbol) ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr><td colSpan={9} className="p-12 text-center text-dark-500"><Crosshair size={36} className="mx-auto mb-3 opacity-30" /><p>No matches. Try adjusting the filter.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}