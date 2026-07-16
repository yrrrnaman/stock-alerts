import { TrendingUp, TrendingDown, AlertTriangle, Zap, ArrowUpRight, BarChart2, AreaChart as AreaChartIcon, RefreshCw, Target, Bell, Plus } from 'lucide-react';
import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

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
}

interface MarketIndex {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

const chartData = [
  { time: '09:15', nifty: 24400, banknifty: 51800 },
  { time: '09:30', nifty: 24420, banknifty: 51850 },
  { time: '09:45', nifty: 24450, banknifty: 51900 },
  { time: '10:00', nifty: 24480, banknifty: 51950 },
  { time: '10:15', nifty: 24500, banknifty: 52000 },
  { time: '10:30', nifty: 24520, banknifty: 52050 },
  { time: '10:45', nifty: 24540, banknifty: 52100 },
  { time: '11:00', nifty: 24560, banknifty: 52150 },
  { time: '11:15', nifty: 24580, banknifty: 52180 },
];

export default function Dashboard() {
  const [stats] = useState<StatCard[]>([
    { label: 'Active Symbols', value: 47, icon: <BarChart2 size={24} />, color: 'text-blue-400' },
    { label: 'Alerts Today', value: 23, change: '+5', changeType: 'positive', icon: <AlertTriangle size={24} />, color: 'text-orange-400' },
    { label: 'Win Rate', value: '68.5%', change: '+2.3%', changeType: 'positive', icon: <TrendingUp size={24} />, color: 'text-green-400' },
    { label: 'Active Strategies', value: 5, icon: <Zap size={24} />, color: 'text-purple-400' },
  ]);

  const [marketIndices] = useState<MarketIndex[]>([
    { name: 'NIFTY 50', symbol: '^NSEI', price: 24580.30, change: 156.70, changePct: 0.64 },
    { name: 'BANK NIFTY', symbol: '^NSEBANK', price: 52180.30, change: -320.50, changePct: -0.61 },
    { name: 'INDIA VIX', symbol: '^INDIAVIX', price: 14.32, change: -0.31, changePct: -2.10 },
  ]);

  const [recentAlerts] = useState<Alert[]>([
    { id: '1', symbol: 'RELIANCE.NS', pattern: 'Bullish Engulfing', timeframe: '15m', price: 2543.20, direction: 'bullish', strategy: 'bullish_engulfing_trend', timestamp: '2024-01-15 10:30:15', confidence: 87 },
    { id: '2', symbol: 'TCS.NS', pattern: 'Hammer', timeframe: '1h', price: 3890.50, direction: 'bullish', strategy: 'bullish_reversal', timestamp: '2024-01-15 10:15:42', confidence: 72 },
    { id: '3', symbol: '^NSEBANK', pattern: 'Bearish Engulfing', timeframe: '1h', price: 52180.30, direction: 'bearish', strategy: 'bearish_reversal_top', timestamp: '2024-01-15 10:02:18', confidence: 81 },
    { id: '4', symbol: 'INFY.NS', pattern: 'Morning Star', timeframe: '1d', price: 1520.75, direction: 'bullish', strategy: 'morning_star_reversal', timestamp: '2024-01-15 08:45:00', confidence: 69 },
    { id: '5', symbol: 'HDFCBANK.NS', pattern: 'Shooting Star', timeframe: '15m', price: 1645.90, direction: 'bearish', timestamp: '2024-01-15 08:30:22', confidence: 58 },
  ]);

  const [topGainers] = useState([
    { symbol: 'TATAMOTORS', price: 945.20, changePct: 3.2 },
    { symbol: 'BAJFINANCE', price: 7200.00, changePct: 2.8 },
    { symbol: 'M&M', price: 2100.50, changePct: 2.4 },
  ]);

  const [topLosers] = useState([
    { symbol: 'HDFCLIFE', price: 580.30, changePct: -2.1 },
    { symbol: 'BRITANNIA', price: 4800.00, changePct: -1.8 },
    { symbol: 'NESTLEIND', price: 2200.50, changePct: -1.5 },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Dashboard</h1>
          <p className="text-dark-400 mt-1">Real-time Indian stock market pattern alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary gap-2">
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="btn-primary gap-2">
            <Plus size={18} />
            Scan Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400 mb-1">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-dark-50">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-400' : stat.changeType === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {stat.change} vs last period
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color.replace('text-', '')}/10`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
              <AreaChartIcon size={20} className="text-primary-400" />
              Market Overview
            </h3>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                NIFTY 50
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                BANK NIFTY
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNifty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBankNifty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 10000 ? `${(val/1000).toFixed(0)}k` : val} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value: number) => [value.toLocaleString(), '']}
                />
                <Area type="monotone" dataKey="nifty" stroke="#22c55e" fillOpacity={1} fill="url(#colorNifty)" strokeWidth={2} />
                <Area type="monotone" dataKey="banknifty" stroke="#facc15" fillOpacity={1} fill="url(#colorBankNifty)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-green-400" />
              Top Gainers
            </h3>
            <div className="space-y-3">
              {topGainers.map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div>
                    <p className="font-mono font-medium text-dark-100">{stock.symbol}</p>
                    <p className="text-sm text-dark-400">₹{stock.price.toLocaleString()}</p>
                  </div>
                  <span className="text-green-400 font-semibold">+{stock.changePct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <TrendingDown size={20} className="text-red-400" />
              Top Losers
            </h3>
            <div className="space-y-3">
              {topLosers.map((stock, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div>
                    <p className="font-mono font-medium text-dark-100">{stock.symbol}</p>
                    <p className="text-sm text-dark-400">₹{stock.price.toLocaleString()}</p>
                  </div>
                  <span className="text-red-400 font-semibold">{stock.changePct}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
              <Target size={20} className="text-purple-400" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-dark-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-400">1,234</p>
                <p className="text-xs text-dark-400">Total Scans Today</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">847</p>
                <p className="text-xs text-dark-400">Patterns Found</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-400">387</p>
                <p className="text-xs text-dark-400">Strategies Matched</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-400">12</p>
                <p className="text-xs text-dark-400">Active Alerts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
              <Bell size={20} className="text-orange-400" />
              Recent Alerts
            </h3>
            <button className="btn-ghost text-sm gap-1">
              <ArrowUpRight size={14} />
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-4 p-3 bg-dark-800/50 rounded-lg hover:bg-dark-800 transition-colors">
                <div className={`w-2 h-2 rounded-full ${alert.direction === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-medium text-dark-100 truncate">{alert.symbol}</p>
                  <p className="text-xs text-dark-400">{alert.pattern} • {alert.timeframe} • {alert.confidence}% confidence</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-dark-50">₹{alert.price.toLocaleString()}</p>
                  <p className={`text-xs ${alert.direction === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                    {alert.direction === 'bullish' ? '▲' : '▼'} {alert.direction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <BarChart2 size={20} className="text-primary-400" />
            Market Indices
          </h3>
          <div className="space-y-3">
            {marketIndices.map((index) => (
              <div key={index.symbol} className="p-3 bg-dark-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-dark-100">{index.name}</span>
                  <span className={`font-semibold ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {index.change >= 0 ? '+' : ''}{index.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xl text-dark-50">₹{index.price.toLocaleString()}</span>
                  <span className={`text-sm ${index.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {index.change >= 0 ? '▲' : '▼'} {Math.abs(index.change).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}