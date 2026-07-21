import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Activity, Globe, Layers, Zap, Target,
  ArrowUpRight, ArrowDownRight, Search, Filter, RefreshCw, Eye, EyeOff,
  Calendar, Clock, Wifi, WifiOff, Database, Server, Cloud, Bell,
  Newspaper, PieChart as PieChartIcon, Gauge, Crosshair, Compass,
  ChevronUp, ChevronDown, Sparkles, Brain, Cpu, Atom, Flame, Trophy,
  ListChecks, DollarSign, Percent, Building2, Briefcase,
  CandlestickChart, BarChart3, Hash, CircleDot, PlayCircle, PauseCircle,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  RadialBarChart, RadialBar, Legend, ComposedChart, Scatter, ScatterChart, ZAxis
} from 'recharts';

type Exchange = 'NSE' | 'BSE';

interface IndexData {
  name: string;
  symbol: string;
  exchange: Exchange;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  prevClose: number;
  volume: number;
  turnover: number;
}

interface StockMover {
  symbol: string;
  name: string;
  exchange: Exchange;
  sector: string;
  price: number;
  changePct: number;
  volume: number;
  marketCap: number;
}

interface SectorData {
  sector: string;
  change: number;
  advancers: number;
  decliners: number;
  total: number;
}

interface OptionData {
  strike: number;
  callOI: number;
  callOIChange: number;
  callIV: number;
  callLTP: number;
  putOI: number;
  putOIChange: number;
  putIV: number;
  putLTP: number;
  pcr: number;
}

const nseIndices: IndexData[] = [
  { name: 'NIFTY 50', symbol: '^NSEI', exchange: 'NSE', price: 24580.30, change: 156.70, changePct: 0.64, open: 24450, high: 24612, low: 24420, prevClose: 24423.60, volume: 285000000, turnover: 45200000000 },
  { name: 'NIFTY BANK', symbol: '^NSEBANK', exchange: 'NSE', price: 52180.30, change: -320.50, changePct: -0.61, open: 52480, high: 52510, low: 52120, prevClose: 52500.80, volume: 95000000, turnover: 18500000000 },
  { name: 'NIFTY FIN SERVICE', symbol: '^NSEFIN', exchange: 'NSE', price: 23450.80, change: 89.40, changePct: 0.38, open: 23380, high: 23480, low: 23360, prevClose: 23361.40, volume: 42000000, turnover: 9800000000 },
  { name: 'NIFTY IT', symbol: '^CNXIT', exchange: 'NSE', price: 41250.60, change: 480.20, changePct: 1.18, open: 40800, high: 41290, low: 40780, prevClose: 40770.40, volume: 28000000, turnover: 6200000000 },
  { name: 'NIFTY AUTO', symbol: '^CNXAUTO', exchange: 'NSE', price: 24820.50, change: 520.30, changePct: 2.14, open: 24320, high: 24850, low: 24300, prevClose: 24300.20, volume: 18000000, turnover: 4100000000 },
  { name: 'NIFTY PHARMA', symbol: '^CNXPHARMA', exchange: 'NSE', price: 18920.40, change: 95.30, changePct: 0.51, open: 18850, high: 18960, low: 18820, prevClose: 18825.10, volume: 22000000, turnover: 3800000000 },
  { name: 'NIFTY FMCG', symbol: '^CNXFMCG', exchange: 'NSE', price: 52680.20, change: -156.40, changePct: -0.30, open: 52840, high: 52900, low: 52620, prevClose: 52836.60, volume: 8500000, turnover: 2100000000 },
  { name: 'NIFTY METAL', symbol: '^CNXMETAL', exchange: 'NSE', price: 9420.80, change: 142.30, changePct: 1.53, open: 9280, high: 9440, low: 9260, prevClose: 9278.50, volume: 32000000, turnover: 2800000000 },
  { name: 'NIFTY REALTY', symbol: '^CNXREALTY', exchange: 'NSE', price: 1080.60, change: -13.20, changePct: -1.21, open: 1095, high: 1098, low: 1078, prevClose: 1093.80, volume: 28000000, turnover: 1800000000 },
  { name: 'NIFTY ENERGY', symbol: '^CNXENERGY', exchange: 'NSE', price: 38250.40, change: 680.20, changePct: 1.81, open: 37600, high: 38280, low: 37580, prevClose: 37570.20, volume: 24000000, turnover: 3200000000 },
  { name: 'INDIA VIX', symbol: '^INDIAVIX', exchange: 'NSE', price: 14.32, change: -0.31, changePct: -2.10, open: 14.63, high: 14.70, low: 14.20, prevClose: 14.63, volume: 0, turnover: 0 },
];

const bseIndices: IndexData[] = [
  { name: 'SENSEX', symbol: '^BSESN', exchange: 'BSE', price: 80765.40, change: 482.30, changePct: 0.60, open: 80320, high: 80810, low: 80280, prevClose: 80283.10, volume: 0, turnover: 0 },
  { name: 'BSE 500', symbol: '^BSE500', exchange: 'BSE', price: 32850.20, change: 195.80, changePct: 0.60, open: 32680, high: 32900, low: 32650, prevClose: 32654.40, volume: 0, turnover: 0 },
  { name: 'BSE MIDCAP', symbol: '^BSEMID', exchange: 'BSE', price: 45620.80, change: 380.40, changePct: 0.84, open: 45280, high: 45680, low: 45240, prevClose: 45240.40, volume: 0, turnover: 0 },
  { name: 'BSE SMALLCAP', symbol: '^BSESML', exchange: 'BSE', price: 51280.60, change: -185.20, changePct: -0.36, open: 51480, high: 51520, low: 51240, prevClose: 51465.80, volume: 0, turnover: 0 },
  { name: 'BSE BANKEX', symbol: '^BSEBANK', exchange: 'BSE', price: 58920.30, change: -360.50, changePct: -0.61, open: 59280, high: 59320, low: 58880, prevClose: 59280.80, volume: 0, turnover: 0 },
  { name: 'BSE IT', symbol: '^BSEIT', exchange: 'BSE', price: 36820.40, change: 432.20, changePct: 1.19, open: 36420, high: 36850, low: 36400, prevClose: 36388.20, volume: 0, turnover: 0 },
];

const topGainers: StockMover[] = [
  { symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', sector: 'Auto', price: 945.20, changePct: 3.2, volume: 12500000, marketCap: 325000 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', exchange: 'NSE', sector: 'Financial', price: 7200.00, changePct: 2.8, volume: 8500000, marketCap: 442000 },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', exchange: 'NSE', sector: 'Auto', price: 2100.50, changePct: 2.4, volume: 5200000, marketCap: 264000 },
  { symbol: 'TATASTEEL', name: 'Tata Steel', exchange: 'NSE', sector: 'Metal', price: 145.80, changePct: 2.1, volume: 28000000, marketCap: 174000 },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', exchange: 'NSE', sector: 'Metal', price: 890.30, changePct: 1.9, volume: 9800000, marketCap: 215000 },
  { symbol: 'COALINDIA', name: 'Coal India', exchange: 'NSE', sector: 'Energy', price: 425.60, changePct: 1.8, volume: 15200000, marketCap: 262000 },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp', exchange: 'NSE', sector: 'Energy', price: 268.40, changePct: 1.6, volume: 18500000, marketCap: 338000 },
  { symbol: 'BPCL', name: 'Bharat Petroleum', exchange: 'NSE', sector: 'Energy', price: 632.80, changePct: 1.5, volume: 8500000, marketCap: 137000 },
];

const topLosers: StockMover[] = [
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', exchange: 'NSE', sector: 'Insurance', price: 580.30, changePct: -2.1, volume: 9800000, marketCap: 125000 },
  { symbol: 'BRITANNIA', name: 'Britannia Industries', exchange: 'NSE', sector: 'FMCG', price: 4800.00, changePct: -1.8, volume: 1200000, marketCap: 115000 },
  { symbol: 'NESTLEIND', name: 'Nestle India', exchange: 'NSE', sector: 'FMCG', price: 2200.50, changePct: -1.5, volume: 850000, marketCap: 212000 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', exchange: 'NSE', sector: 'FMCG', price: 2450.00, changePct: -1.3, volume: 2100000, marketCap: 551000 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', exchange: 'NSE', sector: 'Consumer', price: 2980.25, changePct: -1.1, volume: 1800000, marketCap: 286000 },
  { symbol: 'DIVISLAB', name: "Divi's Laboratories", exchange: 'NSE', sector: 'Pharma', price: 5680.40, changePct: -1.0, volume: 1200000, marketCap: 151000 },
  { symbol: 'CIPLA', name: 'Cipla', exchange: 'NSE', sector: 'Pharma', price: 1480.20, changePct: -0.9, volume: 4500000, marketCap: 119000 },
  { symbol: 'DRREDDY', name: "Dr Reddy's Laboratories", exchange: 'NSE', sector: 'Pharma', price: 5820.50, changePct: -0.8, volume: 980000, marketCap: 97000 },
];

const sectors: SectorData[] = [
  { sector: 'IT', change: 1.18, advancers: 32, decliners: 8, total: 40 },
  { sector: 'Banking', change: -0.42, advancers: 18, decliners: 22, total: 40 },
  { sector: 'Auto', change: 2.14, advancers: 28, decliners: 6, total: 34 },
  { sector: 'Pharma', change: 0.51, advancers: 22, decliners: 16, total: 38 },
  { sector: 'FMCG', change: -0.30, advancers: 12, decliners: 24, total: 36 },
  { sector: 'Energy', change: 1.81, advancers: 26, decliners: 8, total: 34 },
  { sector: 'Metal', change: 1.53, advancers: 20, decliners: 10, total: 30 },
  { sector: 'Realty', change: -1.21, advancers: 8, decliners: 26, total: 34 },
  { sector: 'Consumer', change: -0.85, advancers: 10, decliners: 22, total: 32 },
  { sector: 'Insurance', change: -1.42, advancers: 4, decliners: 14, total: 18 },
];

const indexTimeseries = [
  { time: '09:15', nifty: 24450, banknifty: 52400, sensex: 80350 },
  { time: '09:30', nifty: 24480, banknifty: 52320, sensex: 80420 },
  { time: '09:45', nifty: 24520, banknifty: 52250, sensex: 80510 },
  { time: '10:00', nifty: 24490, banknifty: 52280, sensex: 80480 },
  { time: '10:15', nifty: 24510, banknifty: 52350, sensex: 80520 },
  { time: '10:30', nifty: 24540, banknifty: 52200, sensex: 80580 },
  { time: '10:45', nifty: 24560, banknifty: 52180, sensex: 80620 },
  { time: '11:00', nifty: 24580, banknifty: 52210, sensex: 80680 },
  { time: '11:15', nifty: 24590, banknifty: 52160, sensex: 80720 },
  { time: '11:30', nifty: 24585, banknifty: 52150, sensex: 80740 },
  { time: '11:45', nifty: 24580, banknifty: 52180, sensex: 80765 },
];

const optionChain: OptionData[] = [
  { strike: 24400, callOI: 125000, callOIChange: 8500, callIV: 14.2, callLTP: 195.50, putOI: 98000, putOIChange: -3200, putIV: 14.5, putLTP: 18.20, pcr: 0.78 },
  { strike: 24500, callOI: 285000, callOIChange: 15600, callIV: 14.5, callLTP: 142.80, putOI: 165000, putOIChange: -5800, putIV: 14.8, putLTP: 65.40, pcr: 0.58 },
  { strike: 24550, callOI: 425000, callOIChange: 28000, callIV: 14.8, callLTP: 108.20, putOI: 220000, putOIChange: -12000, putIV: 15.2, putLTP: 92.80, pcr: 0.52 },
  { strike: 24600, callOI: 685000, callOIChange: 45200, callIV: 15.1, callLTP: 78.40, putOI: 385000, putOIChange: -18500, putIV: 15.5, putLTP: 138.20, pcr: 0.56 },
  { strike: 24650, callOI: 525000, callOIChange: 32100, callIV: 15.5, callLTP: 52.80, putOI: 285000, putOIChange: -9800, putIV: 15.9, putLTP: 188.60, pcr: 0.54 },
  { strike: 24700, callOI: 385000, callOIChange: 18900, callIV: 15.9, callLTP: 32.40, putOI: 195000, putOIChange: -4500, putIV: 16.3, putLTP: 248.20, pcr: 0.51 },
];

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];

export default function Analysis() {
  const [activeExchange, setActiveExchange] = useState<Exchange>('NSE');
  const [activeIndex, setActiveIndex] = useState<IndexData>(nseIndices[0]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [view, setView] = useState<'table' | 'heatmap'>('table');
  const [lastUpdate] = useState(new Date());

  const indices = activeExchange === 'NSE' ? nseIndices : bseIndices;

  useEffect(() => {
    setActiveIndex(indices[0]);
  }, [activeExchange]);

  const filteredGainers = useMemo(() => {
    return topGainers.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredLosers = useMemo(() => {
    return topLosers.filter(s =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalAdvancers = sectors.reduce((acc, s) => acc + s.advancers, 0);
  const totalDecliners = sectors.reduce((acc, s) => acc + s.decliners, 0);
  const breadthRatio = totalAdvancers / Math.max(totalDecliners, 1);

  const marketBreadthData = sectors.map(s => ({
    name: s.sector,
    change: s.change,
    advancers: s.advancers,
    decliners: s.decliners,
    total: s.total,
  }));

  const formatCr = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}K Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Cr`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(2)}K`;
    return `₹${val}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30">
              <LineChartIcon size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Market Analysis</div>
              <p className="text-dark-400 text-sm">Real-time NSE & BSE market intelligence</p>
            </div>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm">
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-dark-300">{autoRefresh ? 'Live' : 'Paused'}</span>
          </div>
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`btn-${autoRefresh ? 'secondary' : 'ghost'} gap-2`}>
            {autoRefresh ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
            {autoRefresh ? 'Pause' : 'Resume'}
          </button>
          <button className="btn-secondary gap-2">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card p-1 inline-flex">
        <div className="flex gap-1">
          {(['NSE', 'BSE'] as Exchange[]).map(ex => (
            <button
              key={ex}
              onClick={() => setActiveExchange(ex)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeExchange === ex
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/50'
              }`}
            >
              <Building2 size={16} className="inline mr-2" />
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-primary-500/10 to-primary-500/5 border-primary-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Market Status</span>
            <span className="badge bg-green-500/20 text-green-400 text-xs">Open</span>
          </div>
          <p className="text-2xl font-bold text-dark-50">NSE / BSE</p>
          <p className="text-sm text-dark-400 mt-1">Last update: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Advancers</span>
            <TrendingUp size={16} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{totalAdvancers}</p>
          <p className="text-xs text-dark-400 mt-1">Across {sectors.length} sectors</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Decliners</span>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{totalDecliners}</p>
          <p className="text-xs text-dark-400 mt-1">Across {sectors.length} sectors</p>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dark-400">Breadth Ratio</span>
            <Activity size={16} className="text-primary-400" />
          </div>
          <p className={`text-2xl font-bold ${breadthRatio > 1 ? 'text-green-400' : 'text-red-400'}`}>
            {breadthRatio.toFixed(2)}
          </p>
          <p className="text-xs text-dark-400 mt-1">{breadthRatio > 1 ? 'Bullish' : 'Bearish'} bias</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary-400" />
            {activeExchange} Indices
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-dark-400 border-b border-dark-700">
                <th className="p-3">Index</th>
                <th className="p-3 text-right">LTP</th>
                <th className="p-3 text-right">Change</th>
                <th className="p-3 text-right">% Chg</th>
                <th className="p-3 text-right">Open</th>
                <th className="p-3 text-right">High</th>
                <th className="p-3 text-right">Low</th>
                <th className="p-3 text-right">Prev Close</th>
                {activeExchange === 'NSE' && <>
                  <th className="p-3 text-right">Volume</th>
                  <th className="p-3 text-right">Turnover</th>
                </>}
              </tr>
            </thead>
            <tbody>
              {indices.map((idx) => (
                <tr
                  key={idx.symbol}
                  onClick={() => setActiveIndex(idx)}
                  className={`border-b border-dark-700/50 hover:bg-dark-800/50 cursor-pointer transition-colors ${
                    activeIndex.symbol === idx.symbol ? 'bg-primary-500/5' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${idx.change >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium text-dark-100">{idx.name}</span>
                      <span className="badge bg-dark-700 text-dark-400 text-xs">{idx.symbol}</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-dark-50">{idx.price.toLocaleString()}</td>
                  <td className={`p-3 text-right font-mono font-medium ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`badge ${idx.changePct >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {idx.changePct >= 0 ? '+' : ''}{idx.changePct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono text-dark-400">{idx.open.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-green-400">{idx.high.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-red-400">{idx.low.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-dark-400">{idx.prevClose.toLocaleString()}</td>
                  {activeExchange === 'NSE' && <>
                    <td className="p-3 text-right font-mono text-dark-300">{(idx.volume / 1000000).toFixed(2)}M</td>
                    <td className="p-3 text-right font-mono text-dark-300">{formatCr(idx.turnover)}</td>
                  </>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <LineChartIcon size={20} className="text-primary-400" />
          {activeIndex.name} Intraday — {new Date().toLocaleDateString()}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={indexTimeseries}>
            <defs>
              <linearGradient id="niftyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey="nifty" stroke="#22c55e" strokeWidth={2} fill="url(#niftyGrad)" />
            <Line type="monotone" dataKey="banknifty" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-400" />
            Top Gainers — {activeExchange}
          </h3>
          <div className="space-y-2">
            {filteredGainers.map((s, i) => (
              <div key={s.symbol} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="badge bg-green-500/20 text-green-400 text-xs w-6 justify-center">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-dark-100">{s.symbol}</span>
                      <span className="badge bg-dark-700 text-dark-400 text-xs">{s.exchange}</span>
                    </div>
                    <p className="text-xs text-dark-400 truncate">{s.name} • {s.sector}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-mono font-medium text-dark-100">₹{s.price.toLocaleString()}</p>
                  <p className="text-sm font-semibold text-green-400">+{s.changePct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <TrendingDown size={20} className="text-red-400" />
            Top Losers — {activeExchange}
          </h3>
          <div className="space-y-2">
            {filteredLosers.map((s, i) => (
              <div key={s.symbol} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg hover:bg-dark-700/50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="badge bg-red-500/20 text-red-400 text-xs w-6 justify-center">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-dark-100">{s.symbol}</span>
                      <span className="badge bg-dark-700 text-dark-400 text-xs">{s.exchange}</span>
                    </div>
                    <p className="text-xs text-dark-400 truncate">{s.name} • {s.sector}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-mono font-medium text-dark-100">₹{s.price.toLocaleString()}</p>
                  <p className="text-sm font-semibold text-red-400">{s.changePct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <Layers size={20} className="text-primary-400" />
          Sector Performance & Market Breadth
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketBreadthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="advancers" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="decliners" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {sectors.map((s) => (
              <div key={s.sector} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800/50 transition-colors">
                <span className="font-medium text-dark-300 w-24">{s.sector}</span>
                <div className="flex-1 flex items-center gap-1 h-6">
                  <div className="flex-1 flex justify-end">
                    <div className="bg-green-500/30 h-full rounded-l flex items-center justify-end px-2 text-xs font-medium text-green-400"
                      style={{ width: `${(s.advancers / s.total) * 50}%` }}>
                      {s.advancers}
                    </div>
                  </div>
                  <div className="w-px h-4 bg-dark-700" />
                  <div className="flex-1">
                    <div className="bg-red-500/30 h-full rounded-r flex items-center px-2 text-xs font-medium text-red-400"
                      style={{ width: `${(s.decliners / s.total) * 50}%` }}>
                      {s.decliners}
                    </div>
                  </div>
                </div>
                <span className={`badge ${s.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} w-20 justify-center`}>
                  {s.change >= 0 ? '+' : ''}{s.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <Briefcase size={20} className="text-accent-400" />
          NIFTY Options Chain — Live OI
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-center text-dark-400 border-b border-dark-700">
                <th className="p-2" colSpan={4}>CALLS</th>
                <th className="p-2 border-x border-dark-700">Strike</th>
                <th className="p-2" colSpan={4}>PUTS</th>
              </tr>
              <tr className="text-left text-xs text-dark-400 border-b border-dark-700">
                <th className="p-2 text-right">OI</th>
                <th className="p-2 text-right">Chg OI</th>
                <th className="p-2 text-right">IV</th>
                <th className="p-2 text-right">LTP</th>
                <th className="p-2 text-center border-x border-dark-700">Price</th>
                <th className="p-2 text-left">LTP</th>
                <th className="p-2 text-left">IV</th>
                <th className="p-2 text-left">Chg OI</th>
                <th className="p-2 text-left">OI</th>
              </tr>
            </thead>
            <tbody>
              {optionChain.map((row) => (
                <tr key={row.strike} className="border-b border-dark-700/50 hover:bg-dark-800/30">
                  <td className="p-2 text-right font-mono text-dark-300">{(row.callOI / 1000).toFixed(0)}K</td>
                  <td className="p-2 text-right font-mono text-green-400">+{(row.callOIChange / 1000).toFixed(0)}K</td>
                  <td className="p-2 text-right font-mono text-dark-400">{row.callIV.toFixed(2)}</td>
                  <td className="p-2 text-right font-mono text-dark-100 font-medium">{row.callLTP.toFixed(2)}</td>
                  <td className="p-2 text-center font-mono font-bold text-primary-400 border-x border-dark-700 bg-dark-800/30">
                    {row.strike}
                  </td>
                  <td className="p-2 text-left font-mono text-dark-100 font-medium">{row.putLTP.toFixed(2)}</td>
                  <td className="p-2 text-left font-mono text-dark-400">{row.putIV.toFixed(2)}</td>
                  <td className="p-2 text-left font-mono text-red-400">{(row.putOIChange / 1000).toFixed(0)}K</td>
                  <td className="p-2 text-left font-mono text-dark-300">{(row.putOI / 1000).toFixed(0)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
          <div className="text-sm text-dark-400">
            PCR (Put-Call Ratio): <span className="font-mono text-primary-400 font-semibold">
              {(optionChain.reduce((acc, r) => acc + r.putOI, 0) / optionChain.reduce((acc, r) => acc + r.callOI, 0)).toFixed(2)}
            </span>
          </div>
          <div className="text-xs text-dark-500">Expiry: 25 Jul 2024 • Live data</div>
        </div>
      </div>

      <div className="card bg-gradient-to-br from-primary-500/5 to-accent-500/5 border-primary-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20">
            <Brain size={20} className="text-primary-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-dark-50 mb-1">AI Market Insight</h4>
            <p className="text-sm text-dark-300">
              <span className="text-green-400 font-medium">Bullish bias</span> detected across {totalAdvancers} advancing stocks. 
              Banking sector showing weakness (-0.42%) while Auto and Energy sectors leading (+2.14%, +1.81%). 
              Options PCR at <span className="text-primary-400 font-mono">{(optionChain.reduce((acc, r) => acc + r.putOI, 0) / optionChain.reduce((acc, r) => acc + r.callOI, 0)).toFixed(2)}</span> suggests 
              {optionChain.reduce((acc, r) => acc + r.putOI, 0) > optionChain.reduce((acc, r) => acc + r.callOI, 0) ? ' cautious ' : ' bullish '} positioning. 
              Watch for support at <span className="text-green-400 font-mono">24,420</span> and resistance at <span className="text-red-400 font-mono">24,612</span> on NIFTY 50.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}