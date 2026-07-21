import {
  TrendingUp, TrendingDown, AlertTriangle, Zap, ArrowUpRight, BarChart2, AreaChart as LucideAreaChart,
  RefreshCw, Target, Bell, Plus, Search, Filter, ChevronDown, ChevronUp, Settings, Clock, Calendar,
  FileText, BarChart3, Wand2, Sparkles, Share2, BellRing, BellOff, DollarSign,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Zap as ZapIcon,
  Target as TargetIcon, Shield, CheckCircle, XCircle, History, Github, GitBranch,
  LayoutDashboard, AlertCircle, Mail, Smartphone, Webhook, Radio, Volume2, Globe,
  Server, Database, Key, Cpu, HardDrive, Monitor, Smartphone as SmartphoneIcon,
  Tablet, Laptop, Cloud, Link2, Unlink2, Share2 as ShareIcon, Flag, FlagOff,
  Bookmark, BookmarkPlus, Archive, ArchiveRestore, Calculator, Percent, Ruler,
  Scissors, MousePointer, Move, ZoomIn, ZoomOut, Hand, Eraser, Pen, Highlighter,
  Type, Image, Video, Music, Film, Mic, MicOff, Speaker, VolumeX, Volume1,
  Volume2 as Volume2Icon, Headphones, Monitor as MonitorIcon2, Smartphone as SmartphoneIcon2,
  Server as ServerIcon, Database as DatabaseIcon, HardDrive as HardDriveIcon,
  Cpu as CpuIcon, MemoryStick, Usb, Wifi, Bluetooth, Radio as RadioIcon,
  Antenna, Satellite, Globe as GlobeIcon, MapPin, Navigation, Compass, Anchor,
  Ship, Plane, Car, Truck, Bike, Bus, Train, CableCar, Star, StarHalf,
  Award, Trophy, Medal, Ribbon, Crown, Gem, Diamond, Heart, HeartHandshake,
  Handshake, Users, User, UserPlus, UserMinus, UserCheck, UserX, UserCog,
  Shield as ShieldIcon, ShieldCheck, ShieldX, ShieldAlert, ShieldOff,
  Lock, LockOpen, Key as KeyIcon, KeyRound, Fingerprint, Eye as EyeIcon,
  EyeOff as EyeOffIcon, ScanEye, ScanFace, ScanLine, ScanSearch, ScanText,
  Barcode, QrCode, Ticket, TicketCheck, TicketMinus, TicketPlus, TicketX,
  TicketPercent, Receipt, Clipboard, ClipboardCheck, ClipboardCopy,
  ClipboardList, ClipboardMinus, ClipboardPlus, ClipboardX, ClipboardType,
  File, FileCheck, FileCog, FileDown, FileInput, FileMinus, FileOutput,
  FilePlus, FileSearch, FileText as FileTextIcon, FileUp, FileX,
  FileQuestion, FileWarning, FileKey, FileLock, FilePen, FileCode,
  FileJson, Files, FileSpreadsheet, FileAudio, FileVideo, FileImage,
  FileArchive, FileSymlink, FileBadge, FileTerminal, FileStack,
  Folder, FolderCheck, FolderClock, FolderClosed, FolderCode, FolderCog,
  FolderDot, FolderDown, FolderGit, FolderHeart, FolderInput, FolderKanban,
  FolderLock, FolderMinus, FolderOpen, FolderOutput, FolderPen,
  FolderPlus as FolderPlusIcon, FolderRoot, FolderSearch, FolderSync,
  FolderTree, FolderUp, FolderX, FolderKanban as FolderKanbanIcon,
  Mail as MailIcon, MailCheck, MailMinus, MailOpen, MailPlus, MailQuestion,
  MailSearch, MailWarning, MailX, MessageSquare, MessageSquareCode,
  MessageSquareDiff, MessageSquareDot, MessageSquareHeart, MessageSquareMore,
  MessageSquareOff, MessageSquarePlus, MessageSquareQuote, MessageSquareReply,
  MessageSquareShare, MessageSquareText, MessageSquareWarning, MessageSquareX
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ListChecks, ListChecks as ListChecksIcon } from 'lucide-react';
import { Legend, BarChart as RechartsBarChart } from 'recharts';
import {
  LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart as RechartsAreaChart, Area,
  Bar, Cell, PieChart, Pie, RadialBarChart, RadialBar, ComposedChart
} from 'recharts';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
  trend?: number[];
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

const performanceData = [
  { name: 'Mon', win: 12, loss: 3 },
  { name: 'Tue', win: 19, loss: 2 },
  { name: 'Wed', win: 8, loss: 5 },
  { name: 'Thu', win: 15, loss: 4 },
  { name: 'Fri', win: 22, loss: 1 },
  { name: 'Sat', win: 0, loss: 0 },
  { name: 'Sun', win: 0, loss: 0 },
];

const sectorPerformance = [
  { sector: 'IT', change: 1.2, color: 'bg-green-500' },
  { sector: 'Banking', change: -0.8, color: 'bg-red-500' },
  { sector: 'Auto', change: 2.1, color: 'bg-green-500' },
  { sector: 'Pharma', change: 0.5, color: 'bg-green-500' },
  { sector: 'FMCG', change: -0.3, color: 'bg-red-500' },
  { sector: 'Energy', change: 1.8, color: 'bg-green-500' },
  { sector: 'Metal', change: 1.5, color: 'bg-green-500' },
  { sector: 'Realty', change: -1.2, color: 'bg-red-500' },
];

export default function Dashboard() {
  const [stats] = useState<StatCard[]>([
    { label: 'Active Symbols', value: 47, change: '+3', changeType: 'positive', icon: <BarChart2 size={24} />, color: 'text-blue-400', trend: [12, 15, 18, 22, 25, 30, 35, 40, 47] },
    { label: 'Alerts Today', value: 23, change: '+5', changeType: 'positive', icon: <AlertTriangle size={24} />, color: 'text-orange-400', trend: [2, 5, 8, 12, 15, 18, 20, 23] },
    { label: 'Win Rate', value: '68.5%', change: '+2.3%', changeType: 'positive', icon: <TrendingUp size={24} />, color: 'text-green-400', trend: [55, 58, 61, 63, 65, 67, 68.5] },
    { label: 'Active Strategies', value: 5, change: '+1', changeType: 'positive', icon: <Zap size={24} />, color: 'text-purple-400', trend: [2, 2, 3, 3, 4, 4, 5] },
  ]);

  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([
    { name: 'NIFTY 50', symbol: '^NSEI', price: 24580.30, change: 156.70, changePct: 0.64 },
    { name: 'BANK NIFTY', symbol: '^NSEBANK', price: 52180.30, change: -320.50, changePct: -0.61 },
    { name: 'INDIA VIX', symbol: '^INDIAVIX', price: 14.32, change: -0.31, changePct: -2.10 },
    { name: 'FINNIFTY', symbol: '^NSEFIN', price: 23450.80, change: 89.40, changePct: 0.38 },
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
    { symbol: 'TATASTEEL', price: 145.80, changePct: 2.1 },
    { symbol: 'JSWSTEEL', price: 890.30, changePct: 1.9 },
  ]);

  const [topLosers] = useState([
    { symbol: 'HDFCLIFE', price: 580.30, changePct: -2.1 },
    { symbol: 'BRITANNIA', price: 4800.00, changePct: -1.8 },
    { symbol: 'NESTLEIND', price: 2200.50, changePct: -1.5 },
    { symbol: 'HINDUNILVR', price: 2450.00, changePct: -1.3 },
    { symbol: 'ASIANPAINT', price: 2980.25, changePct: -1.1 },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-dark-50">StockAlert Pro</div>
              <div className="text-dark-400 text-sm">Real-time Indian market pattern alerts & analytics</div>
            </div>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm text-dark-300">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live</span>
          </div>
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
          <div key={i} className="card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-dark-400 mb-1">{stat.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-dark-50">{stat.value}</p>
                {stat.change && (
                  <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-400' : stat.changeType === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                    <span className="flex items-center gap-1">
                      {stat.changeType === 'positive' && <TrendingUpIcon size={12} />}
                      {stat.changeType === 'negative' && <TrendingDownIcon size={12} />}
                      {stat.change} vs yesterday
                    </span>
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color.replace('text-', '')}/10 group-hover:bg-${stat.color.replace('text-', '')}/20 transition-colors`}>
                <span className={stat.color}>{stat.icon}</span>
              </div>
            </div>
            {stat.trend && (
              <div className="relative mt-4 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart data={stat.trend.map((v) => ({ value: v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`trend${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={stat.color.replace('text-', '')} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={stat.color.replace('text-', '')} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke={stat.color.replace('text-', '')} fillOpacity={1} fill={`url(#trend${i})`} strokeWidth={2} />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <LucideAreaChart size={20} className="text-primary-400" />
              </div>
              Market Overview
            </h3>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Live
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Line type="monotone" dataKey="nifty" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="banknifty" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUpIcon size={20} className="text-green-400" />
            </div>
            Top Gainers
          </h3>
          <div className="space-y-3">
            {topGainers.map((g, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-medium text-dark-100">{g.symbol}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-dark-300">₹{g.price}</span>
                  <span className="text-green-400 font-medium">+{g.changePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <TrendingDownIcon size={20} className="text-red-400" />
            </div>
            Top Losers
          </h3>
          <div className="space-y-3">
            {topLosers.map((l, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-medium text-dark-100">{l.symbol}</span>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-dark-300">₹{l.price}</span>
                  <span className="text-red-400 font-medium">{l.changePct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <ZapIcon size={20} className="text-purple-400" />
            </div>
            Sector Performance
          </h3>
          <div className="space-y-3">
            {sectorPerformance.map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-medium text-dark-300">{s.sector}</span>
                <div className="flex items-center gap-3">
                  <span className={`badge ${s.color} text-xs`}>
                    {s.change > 0 ? '+' : ''}{s.change}%
                  </span>
                  <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.change > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(Math.abs(s.change) * 20, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <AlertTriangle size={20} className="text-orange-400" />
            </div>
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {recentAlerts.map(alert => (
              <div key={alert.id} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg hover:bg-dark-700/50 transition-colors">
                <span className={`badge ${alert.direction === 'bullish' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {alert.direction === 'bullish' ? <TrendingUpIcon size={12} /> : <TrendingDownIcon size={12} />}
                  {alert.pattern}
                </span>
                <span className="font-semibold text-dark-100 min-w-[120px]">{alert.symbol}</span>
                <span className="text-sm text-dark-400">{alert.timeframe}</span>
                <span className="font-medium text-blue-400">₹{alert.price.toLocaleString()}</span>
                <span className={`badge ${alert.confidence >= 75 ? 'bg-green-500/20 text-green-400' : alert.confidence >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {alert.confidence}%
                </span>
                <span className="text-sm text-dark-500 ml-auto">{alert.timestamp.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <BarChart2 size={20} className="text-blue-400" />
            </div>
            Performance This Week
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsBarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="win" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-50 mb-4 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <ListChecks size={20} className="text-cyan-400" />
          </div>
          Market Indices
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {marketIndices.map((idx, i) => (
            <div key={i} className="p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-dark-300">{idx.name}</span>
                <span className="badge bg-dark-700 text-dark-300 text-xs">{idx.symbol}</span>
              </div>
              <div className="text-2xl font-bold text-dark-50">₹{idx.price.toLocaleString()}</div>
              <div className={`flex items-center gap-2 mt-2 ${idx.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <span className="font-semibold">{idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}</span>
                <span className="text-sm text-dark-400">({idx.changePct >= 0 ? '+' : ''}{idx.changePct.toFixed(2)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}