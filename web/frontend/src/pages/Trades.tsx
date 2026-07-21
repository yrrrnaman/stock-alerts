import { Fragment, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Plus, Search, Filter, Calendar, DollarSign, Percent,
  Target, Award, Activity, BarChart2, X, Edit, Trash2, Download, RefreshCw,
  ChevronDown, ChevronUp, BookOpen, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, Layers, Wallet, Briefcase, Zap, Eye, Copy,
  Tag, ArrowUp, ArrowDown, Wallet as WalletIcon
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';

type TradeStatus = 'open' | 'closed' | 'pending' | 'cancelled';
type TradeDirection = 'long' | 'short';

interface Trade {
  id: string;
  symbol: string;
  exchange: 'NSE' | 'BSE';
  direction: TradeDirection;
  status: TradeStatus;
  entryDate: string;
  exitDate?: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss?: number;
  target?: number;
  strategy?: string;
  notes?: string;
  tags?: string[];
  charges?: number;
}

const mockTrades: Trade[] = [
  { id: 't1', symbol: 'RELIANCE.NS', exchange: 'NSE', direction: 'long', status: 'closed', entryDate: '2026-07-18 09:30', exitDate: '2026-07-18 14:20', entryPrice: 2543.20, exitPrice: 2580.50, quantity: 50, stopLoss: 2520, target: 2600, strategy: 'momentum_breakout', tags: ['intraday', 'momentum'], charges: 75 },
  { id: 't2', symbol: 'TCS.NS', exchange: 'NSE', direction: 'long', status: 'open', entryDate: '2026-07-21 10:15', entryPrice: 3890.50, quantity: 25, stopLoss: 3850, target: 3980, strategy: 'bullish_reversal', tags: ['swing'], charges: 30 },
  { id: 't3', symbol: 'HDFCBANK.NS', exchange: 'NSE', direction: 'short', status: 'closed', entryDate: '2026-07-17 11:00', exitDate: '2026-07-17 15:15', entryPrice: 1645.90, exitPrice: 1640.20, quantity: 60, stopLoss: 1660, target: 1630, strategy: 'bearish_reversal_top', tags: ['intraday', 'reversal'], charges: 60 },
  { id: 't4', symbol: 'INFY.NS', exchange: 'NSE', direction: 'long', status: 'closed', entryDate: '2026-07-15 09:45', exitDate: '2026-07-19 13:30', entryPrice: 1520.75, exitPrice: 1585.40, quantity: 40, stopLoss: 1500, target: 1600, strategy: 'morning_star_reversal', tags: ['swing', 'winner'], charges: 65 },
  { id: 't5', symbol: 'TATAMOTORS.NS', exchange: 'NSE', direction: 'long', status: 'closed', entryDate: '2026-07-14 10:00', exitDate: '2026-07-14 11:45', entryPrice: 945.20, exitPrice: 932.50, quantity: 100, stopLoss: 935, target: 970, strategy: 'momentum_breakout', tags: ['intraday', 'loser'], charges: 95 },
  { id: 't6', symbol: 'SBIN.NS', exchange: 'NSE', direction: 'long', status: 'pending', entryDate: '2026-07-21 14:00', entryPrice: 650.80, quantity: 150, stopLoss: 645, target: 670, strategy: 'trend_following_breakout', tags: ['breakout'] },
  { id: 't7', symbol: 'BHARTIARTL.NS', exchange: 'NSE', direction: 'long', status: 'open', entryDate: '2026-07-21 09:20', entryPrice: 1150.40, quantity: 30, stopLoss: 1135, target: 1180, strategy: 'vwap_reclaim', tags: ['intraday'] },
  { id: 't8', symbol: 'BAJFINANCE.NS', exchange: 'NSE', direction: 'short', status: 'closed', entryDate: '2026-07-16 13:30', exitDate: '2026-07-16 14:55', entryPrice: 7200.00, exitPrice: 7245.80, quantity: 10, stopLoss: 7250, target: 7100, strategy: 'bearish_reversal_top', tags: ['intraday', 'loser'], charges: 110 },
  { id: 't9', symbol: 'MARUTI.NS', exchange: 'NSE', direction: 'long', status: 'closed', entryDate: '2026-07-10 09:30', exitDate: '2026-07-15 12:00', entryPrice: 10500.50, exitPrice: 10980.00, quantity: 5, stopLoss: 10350, target: 11000, strategy: 'momentum_breakout', tags: ['swing', 'winner'], charges: 85 },
  { id: 't10', symbol: 'ICICIBANK.NS', exchange: 'NSE', direction: 'long', status: 'open', entryDate: '2026-07-21 11:45', entryPrice: 1080.45, quantity: 45, stopLoss: 1075, target: 1100, strategy: 'mean_reversion_scalper', tags: ['scalping'] },
];

function calcPnL(trade: Trade) {
  if (trade.status === 'open' || trade.status === 'pending' || trade.exitPrice === undefined) return null;
  const gross = (trade.exitPrice - trade.entryPrice) * trade.quantity * (trade.direction === 'long' ? 1 : -1);
  const charges = trade.charges || 0;
  return { gross, net: gross - charges, pct: (gross / (trade.entryPrice * trade.quantity)) * 100 };
}

const STATUS_BADGE: Record<TradeStatus, string> = {
  open: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-dark-700 text-dark-300',
  pending: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const STATUS_DOT: Record<TradeStatus, string> = {
  open: 'bg-blue-400 animate-pulse',
  closed: 'bg-dark-400',
  pending: 'bg-yellow-400 animate-pulse',
  cancelled: 'bg-red-400',
};

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [newTrade, setNewTrade] = useState<Partial<Trade>>({
    symbol: '', exchange: 'NSE', direction: 'long', status: 'open',
    entryDate: new Date().toISOString().slice(0, 16), entryPrice: 0, quantity: 0,
    stopLoss: 0, target: 0, strategy: '', notes: '', tags: []
  });

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    trades.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [trades]);

  const filteredTrades = useMemo(() => {
    return trades.filter(t => {
      const matchesSearch = t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.strategy?.toLowerCase().includes(search.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesDirection = directionFilter === 'all' || t.direction === directionFilter;
      const matchesTag = tagFilter === 'all' || t.tags?.includes(tagFilter);
      return matchesSearch && matchesStatus && matchesDirection && matchesTag;
    });
  }, [trades, search, statusFilter, directionFilter, tagFilter]);

  const stats = useMemo(() => {
    const closed = trades.filter(t => t.status === 'closed');
    const winners = closed.filter(t => (calcPnL(t)?.net ?? 0) > 0);
    const losers = closed.filter(t => (calcPnL(t)?.net ?? 0) < 0);
    const totalPnL = closed.reduce((acc, t) => acc + (calcPnL(t)?.net ?? 0), 0);
    const totalWins = winners.reduce((acc, t) => acc + (calcPnL(t)?.net ?? 0), 0);
    const totalLosses = Math.abs(losers.reduce((acc, t) => acc + (calcPnL(t)?.net ?? 0), 0));
    const winRate = closed.length > 0 ? (winners.length / closed.length) * 100 : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0;
    const avgWin = winners.length > 0 ? totalWins / winners.length : 0;
    const avgLoss = losers.length > 0 ? totalLosses / losers.length : 0;
    const openPositions = trades.filter(t => t.status === 'open' || t.status === 'pending').length;
    return { closed: closed.length, winners: winners.length, losers: losers.length, totalPnL, winRate, profitFactor, avgWin, avgLoss, openPositions };
  }, [trades]);

  const pnlChartData = useMemo(() => {
    const days: Record<string, number> = {};
    trades.filter(t => t.status === 'closed' && t.exitDate).forEach(t => {
      const day = t.exitDate!.split(' ')[0];
      const pnl = calcPnL(t)?.net ?? 0;
      days[day] = (days[day] || 0) + pnl;
    });
    let cumulative = 0;
    return Object.entries(days).sort().map(([date, pnl]) => {
      cumulative += pnl;
      return { date: date.slice(5), pnl, cumulative };
    });
  }, [trades]);

  const symbolDistribution = useMemo(() => {
    const map: Record<string, { wins: number; losses: number; pnl: number }> = {};
    trades.filter(t => t.status === 'closed').forEach(t => {
      if (!map[t.symbol]) map[t.symbol] = { wins: 0, losses: 0, pnl: 0 };
      const pnl = calcPnL(t)?.net ?? 0;
      map[t.symbol].pnl += pnl;
      if (pnl > 0) map[t.symbol].wins++;
      else map[t.symbol].losses++;
    });
    return Object.entries(map).map(([symbol, data]) => ({ symbol, ...data })).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const handleAddTrade = () => {
    if (!newTrade.symbol || !newTrade.entryPrice || !newTrade.quantity) {
      toast.error('Symbol, entry price, and quantity are required');
      return;
    }
    const trade: Trade = {
      id: `t-${Date.now()}`,
      symbol: (newTrade.symbol as string).toUpperCase(),
      exchange: (newTrade.exchange as Trade['exchange']) || 'NSE',
      direction: (newTrade.direction as TradeDirection) || 'long',
      status: (newTrade.status as TradeStatus) || 'open',
      entryDate: newTrade.entryDate || new Date().toISOString(),
      entryPrice: Number(newTrade.entryPrice),
      quantity: Number(newTrade.quantity),
      stopLoss: newTrade.stopLoss ? Number(newTrade.stopLoss) : undefined,
      target: newTrade.target ? Number(newTrade.target) : undefined,
      strategy: newTrade.strategy,
      notes: newTrade.notes,
    };
    setTrades([trade, ...trades]);
    setShowAddTrade(false);
    toast.success(`Trade added: ${trade.symbol}`);
  };

  const handleCloseTrade = (trade: Trade) => {
    const exitPriceStr = window.prompt(`Enter exit price for ${trade.symbol}:`, trade.entryPrice.toString());
    if (!exitPriceStr) return;
    const exitPrice = parseFloat(exitPriceStr);
    if (isNaN(exitPrice)) { toast.error('Invalid price'); return; }
    setTrades(prev => prev.map(t => t.id === trade.id ? { ...t, status: 'closed', exitDate: new Date().toISOString(), exitPrice } : t));
    toast.success(`${trade.symbol} closed`);
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id));
    toast.success('Trade deleted');
  };

  const renderTable = () => (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-dark-400 border-b border-dark-700">
              <th className="p-3">Symbol</th>
              <th className="p-3">Dir</th>
              <th className="p-3">Status</th>
              <th className="p-3 hidden md:table-cell">Entry</th>
              <th className="p-3 hidden md:table-cell">Exit</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">P&L</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {filteredTrades.map(trade => {
              const pnl = calcPnL(trade);
              const isOpen = trade.status === 'open' || trade.status === 'pending';
              return (
                <Fragment key={trade.id}>
                  <tr className="hover:bg-dark-800/50 cursor-pointer" onClick={() => setExpandedId(expandedId === trade.id ? null : trade.id)}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-dark-100">{trade.symbol.replace('.NS', '')}</span>
                        <span className="badge bg-dark-700 text-dark-400 text-xs">{trade.exchange}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${trade.direction === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trade.direction === 'long' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {trade.direction.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`badge text-xs ${STATUS_BADGE[trade.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOT[trade.status]}`} />
                        {trade.status}
                      </span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <p className="font-mono text-dark-100">₹{trade.entryPrice.toLocaleString()}</p>
                      <p className="text-xs text-dark-500">{trade.entryDate.split(' ')[1]}</p>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {trade.exitPrice !== undefined ? (
                        <>
                          <p className="font-mono text-dark-100">₹{trade.exitPrice.toLocaleString()}</p>
                          <p className="text-xs text-dark-500">{trade.exitDate?.split(' ')[1]}</p>
                        </>
                      ) : <span className="text-dark-500">—</span>}
                    </td>
                    <td className="p-3 text-right font-mono text-dark-300">{trade.quantity}</td>
                    <td className="p-3 text-right">
                      {pnl ? (
                        <div>
                          <p className={`font-mono font-bold ${pnl.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl.net >= 0 ? '+' : ''}₹{Math.round(pnl.net).toLocaleString()}
                          </p>
                          <p className={`text-xs ${pnl.pct >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>{pnl.pct >= 0 ? '+' : ''}{pnl.pct.toFixed(2)}%</p>
                        </div>
                      ) : <span className="text-dark-500 text-sm">{isOpen ? 'running' : '—'}</span>}
                    </td>
                    <td className="p-3">
                      {expandedId === trade.id ? <ChevronUp size={16} className="text-dark-400" /> : <ChevronDown size={16} className="text-dark-400" />}
                    </td>
                  </tr>
                  {expandedId === trade.id && (
                    <tr>
                      <td colSpan={8} className="bg-dark-800/30 p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><p className="text-dark-400 text-xs mb-1">Strategy</p><p className="font-medium text-dark-100">{trade.strategy || '—'}</p></div>
                          <div><p className="text-dark-400 text-xs mb-1">Stop Loss</p><p className="font-mono text-red-400">{trade.stopLoss ? `₹${trade.stopLoss.toLocaleString()}` : '—'}</p></div>
                          <div><p className="text-dark-400 text-xs mb-1">Target</p><p className="font-mono text-green-400">{trade.target ? `₹${trade.target.toLocaleString()}` : '—'}</p></div>
                          <div><p className="text-dark-400 text-xs mb-1">Charges</p><p className="font-mono text-dark-300">{trade.charges ? `₹${trade.charges}` : '—'}</p></div>
                          {trade.tags && trade.tags.length > 0 && (
                            <div className="col-span-2 md:col-span-4">
                              <p className="text-dark-400 text-xs mb-2">Tags</p>
                              <div className="flex flex-wrap gap-1">
                                {trade.tags.map(tag => <span key={tag} className="badge bg-purple-500/20 text-purple-400 text-xs">{tag}</span>)}
                              </div>
                            </div>
                          )}
                          <div className="col-span-2 md:col-span-4 flex flex-wrap gap-2 pt-2">
                            {isOpen && <button onClick={(e) => { e.stopPropagation(); handleCloseTrade(trade); }} className="btn-secondary text-sm gap-1"><CheckCircle size={14} /> Close Trade</button>}
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteTrade(trade.id); }} className="btn-danger text-sm gap-1"><Trash2 size={14} /> Delete</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {filteredTrades.length === 0 && (
              <tr><td colSpan={8} className="p-12 text-center text-dark-500"><BookOpen size={36} className="mx-auto mb-3 opacity-30" /><p>No trades found</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {filteredTrades.map(trade => {
        const pnl = calcPnL(trade);
        const isOpen = trade.status === 'open' || trade.status === 'pending';
        return (
          <div key={trade.id} className="card hover:border-primary-500/50 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono font-bold text-dark-100">{trade.symbol.replace('.NS', '')}</p>
                <p className="text-xs text-dark-400">{trade.exchange} • {trade.direction.toUpperCase()}</p>
              </div>
              <span className={`badge text-xs ${STATUS_BADGE[trade.status]}`}>{trade.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div><p className="text-xs text-dark-500">Entry</p><p className="font-mono">₹{trade.entryPrice.toLocaleString()}</p></div>
              <div><p className="text-xs text-dark-500">{isOpen ? 'Current' : 'Exit'}</p><p className="font-mono">₹{(trade.exitPrice || trade.entryPrice).toLocaleString()}</p></div>
              <div><p className="text-xs text-dark-500">Quantity</p><p className="font-mono">{trade.quantity}</p></div>
              <div><p className="text-xs text-dark-500">Value</p><p className="font-mono">₹{(trade.entryPrice * trade.quantity).toLocaleString()}</p></div>
            </div>
            {pnl && (
              <div className={`p-2 rounded-lg ${pnl.net >= 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <p className={`font-mono font-bold text-lg ${pnl.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pnl.net >= 0 ? '+' : ''}₹{Math.round(pnl.net).toLocaleString()}
                </p>
                <p className={`text-xs ${pnl.pct >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>{pnl.pct >= 0 ? '+' : ''}{pnl.pct.toFixed(2)}%</p>
              </div>
            )}
            {isOpen && <button onClick={() => handleCloseTrade(trade)} className="btn-secondary w-full mt-3 text-sm gap-1"><CheckCircle size={14} /> Close Position</button>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Trades & Journal</div>
              <p className="text-dark-400 text-sm mt-1">Track entries, exits, P&L, and learn from every trade</p>
            </div>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><Layers size={18} /></button>
          <button onClick={() => setViewMode('cards')} className={`p-2 rounded ${viewMode === 'cards' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}><Wallet size={18} /></button>
          <button onClick={() => setShowAddTrade(true)} className="btn-primary gap-2"><Plus size={18} /> New Trade</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-dark-400">Total P&L</span><WalletIcon size={14} className="text-primary-400" /></div>
          <p className={`text-xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}₹{Math.round(stats.totalPnL).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-dark-400">Win Rate</span><Target size={14} className="text-blue-400" /></div>
          <p className="text-xl font-bold text-dark-50">{stats.winRate.toFixed(1)}%</p>
          <p className="text-xs text-dark-500">{stats.winners}W / {stats.losers}L</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-dark-400">Profit Factor</span><BarChart2 size={14} className="text-purple-400" /></div>
          <p className={`text-xl font-bold ${stats.profitFactor >= 1.5 ? 'text-green-400' : stats.profitFactor >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.profitFactor.toFixed(2)}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-dark-400">Avg Win</span><ArrowUp size={14} className="text-green-400" /></div>
          <p className="text-xl font-bold text-green-400">+₹{Math.round(stats.avgWin).toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-dark-400">Avg Loss</span><ArrowDown size={14} className="text-red-400" /></div>
          <p className="text-xl font-bold text-red-400">-₹{Math.round(stats.avgLoss).toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-dark-400">Open</span><Activity size={14} className="text-accent-400" /></div>
          <p className="text-xl font-bold text-dark-50">{stats.openPositions}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2"><Activity size={16} /> Cumulative P&L</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={pnlChartData}>
              <defs>
                <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="cumulative" stroke="#22c55e" strokeWidth={2} fill="url(#pnlGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2"><Briefcase size={16} /> By Symbol</h3>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {symbolDistribution.slice(0, 6).map(s => (
              <div key={s.symbol} className="flex items-center justify-between text-sm">
                <span className="font-mono text-dark-200">{s.symbol.replace('.NS', '')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-dark-500">{s.wins}/{s.wins + s.losses}</span>
                  <span className={`font-mono font-semibold ${s.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{s.pnl >= 0 ? '+' : ''}₹{Math.round(s.pnl).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input type="text" placeholder="Search trades..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-32">
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
          <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)} className="input w-32">
            <option value="all">Both</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} className="input w-36">
            <option value="all">All Tags</option>
            {allTags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {viewMode === 'table' ? renderTable() : renderCards()}

      {showAddTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAddTrade(false)}>
          <div className="card-elevated max-w-2xl w-full max-h-[90vh] overflow-y-auto scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-700 sticky top-0 bg-dark-900 z-10">
              <h3 className="text-xl font-bold text-dark-50 flex items-center gap-2"><Plus size={20} className="text-primary-400" /> New Trade</h3>
              <button onClick={() => setShowAddTrade(false)} className="p-2 rounded hover:bg-dark-700 text-dark-400"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Symbol *</label>
                  <input type="text" placeholder="e.g. RELIANCE" className="input font-mono" value={newTrade.symbol || ''} onChange={e => setNewTrade({...newTrade, symbol: e.target.value})} />
                </div>
                <div>
                  <label className="label">Exchange</label>
                  <select className="input" value={newTrade.exchange} onChange={e => setNewTrade({...newTrade, exchange: e.target.value as Trade['exchange']})}>
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                  </select>
                </div>
                <div>
                  <label className="label">Direction</label>
                  <select className="input" value={newTrade.direction} onChange={e => setNewTrade({...newTrade, direction: e.target.value as TradeDirection})}>
                    <option value="long">Long (Buy)</option>
                    <option value="short">Short (Sell)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={newTrade.status} onChange={e => setNewTrade({...newTrade, status: e.target.value as TradeStatus})}>
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="label">Entry Date</label>
                  <input type="datetime-local" className="input" value={(newTrade.entryDate || '').slice(0, 16)} onChange={e => setNewTrade({...newTrade, entryDate: e.target.value})} />
                </div>
                <div>
                  <label className="label">Strategy</label>
                  <select className="input" value={newTrade.strategy || ''} onChange={e => setNewTrade({...newTrade, strategy: e.target.value})}>
                    <option value="">— None —</option>
                    <option value="momentum_breakout">Momentum Breakout</option>
                    <option value="bullish_reversal">Bullish Reversal</option>
                    <option value="bearish_reversal_top">Bearish Reversal Top</option>
                    <option value="morning_star_reversal">Morning Star Reversal</option>
                    <option value="vwap_reclaim">VWAP Reclaim</option>
                    <option value="trend_following_breakout">Trend Following Breakout</option>
                    <option value="mean_reversion_scalper">Mean Reversion Scalper</option>
                  </select>
                </div>
                <div>
                  <label className="label">Entry Price (₹) *</label>
                  <input type="number" step="0.05" className="input font-mono" value={newTrade.entryPrice || ''} onChange={e => setNewTrade({...newTrade, entryPrice: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="label">Quantity *</label>
                  <input type="number" className="input font-mono" value={newTrade.quantity || ''} onChange={e => setNewTrade({...newTrade, quantity: parseInt(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="label">Stop Loss (₹)</label>
                  <input type="number" step="0.05" className="input font-mono" value={newTrade.stopLoss || ''} onChange={e => setNewTrade({...newTrade, stopLoss: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="label">Target (₹)</label>
                  <input type="number" step="0.05" className="input font-mono" value={newTrade.target || ''} onChange={e => setNewTrade({...newTrade, target: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input h-20" placeholder="Setup rationale, thesis, plan..." value={newTrade.notes || ''} onChange={e => setNewTrade({...newTrade, notes: e.target.value})} />
              </div>
              <div className="p-3 bg-dark-800/50 rounded-lg">
                <p className="text-sm text-dark-300">
                  Position value: <span className="font-mono text-dark-100">₹{((newTrade.entryPrice || 0) * (newTrade.quantity || 0)).toLocaleString()}</span>
                  {' • '}Risk if SL hit: <span className="font-mono text-red-400">₹{newTrade.stopLoss && newTrade.entryPrice ? Math.abs((newTrade.entryPrice - newTrade.stopLoss) * (newTrade.quantity || 0)).toLocaleString() : '0'}</span>
                  {' • '}Reward if target: <span className="font-mono text-green-400">₹{newTrade.target && newTrade.entryPrice ? Math.abs((newTrade.target - newTrade.entryPrice) * (newTrade.quantity || 0)).toLocaleString() : '0'}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 p-6 border-t border-dark-700 sticky bottom-0 bg-dark-900">
              <button onClick={() => setShowAddTrade(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleAddTrade} className="btn-primary flex-1 gap-2"><Plus size={16} /> Add Trade</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}