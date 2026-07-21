import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Zap, ArrowLeft, Target, Plus, X, CheckCircle, Filter, Search, Edit,
  BarChart2, Clock, Activity, ChevronRight, Settings, Sparkles, Save,
  CheckSquare, Square, Layers, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Symbol {
  id: string;
  symbol: string;
  name: string;
  exchange: 'NSE' | 'BSE';
  sector: string;
  price: number;
}

interface Condition { type: 'pattern' | 'indicator'; pattern?: string; indicator?: string; operator?: string; value?: number; tolerance?: number; }

interface Strategy {
  id: string;
  name: string;
  description: string;
  timeframes: string[];
  enabled: boolean;
  conditions: Condition[];
}

const allSymbols: Symbol[] = [
  { id: '1', symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', sector: 'Energy', price: 2543.20 },
  { id: '2', symbol: 'TCS.NS', name: 'Tata Consultancy', exchange: 'NSE', sector: 'IT', price: 3890.50 },
  { id: '3', symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', sector: 'IT', price: 1520.75 },
  { id: '4', symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE', sector: 'Banking', price: 1645.90 },
  { id: '5', symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE', sector: 'Banking', price: 1080.45 },
  { id: '6', symbol: '^NSEI', name: 'NIFTY 50', exchange: 'NSE', sector: 'Index', price: 24580.30 },
  { id: '7', symbol: '^NSEBANK', name: 'NIFTY Bank', exchange: 'NSE', sector: 'Index', price: 52180.30 },
  { id: '8', symbol: 'TATAMOTORS.NS', name: 'Tata Motors', exchange: 'NSE', sector: 'Auto', price: 945.20 },
  { id: '9', symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', exchange: 'NSE', sector: 'Telecom', price: 1150.40 },
  { id: '10', symbol: 'ASIANPAINT.NS', name: 'Asian Paints', exchange: 'NSE', sector: 'Consumer', price: 2980.25 },
  { id: '11', symbol: 'MARUTI.NS', name: 'Maruti Suzuki', exchange: 'NSE', sector: 'Auto', price: 10500.50 },
  { id: '12', symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', exchange: 'NSE', sector: 'Financial', price: 7200.00 },
  { id: '13', symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Banking', price: 650.80 },
  { id: '14', symbol: 'WIPRO.NS', name: 'Wipro', exchange: 'NSE', sector: 'IT', price: 450.30 },
  { id: '15', symbol: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE', sector: 'Construction', price: 3200.00 },
];

const mockStrategies: Strategy[] = [
  { id: '1', name: 'bullish_reversal', description: 'Hammer + RSI oversold near support', timeframes: ['15m', '1h'], enabled: true, conditions: [] },
  { id: '2', name: 'momentum_breakout', description: 'Momentum breakout with volume confirmation', timeframes: ['15m', '1h', '1d'], enabled: true, conditions: [] },
  { id: '3', name: 'vwap_reclaim', description: 'Intraday VWAP reclaim with strength', timeframes: ['5m', '15m'], enabled: true, conditions: [] },
  { id: '6', name: 'morning_star_reversal', description: 'Morning star pattern with volume', timeframes: ['1h', '1d'], enabled: true, conditions: [] },
  { id: '17', name: 'supertrend_follower', description: 'Supertrend flip + ADX confirmation', timeframes: ['1h', '1d'], enabled: true, conditions: [] },
];

const sectors = ['All', 'IT', 'Banking', 'Auto', 'Energy', 'Financial', 'Telecom', 'Consumer', 'Construction', 'Index'];

export default function StrategyApply() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const strategy = useMemo(() => mockStrategies.find(s => s.id === id) || mockStrategies[0], [id]);
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set(['2', '3', '4']));
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [exchangeFilter, setExchangeFilter] = useState<'all' | 'NSE' | 'BSE'>('all');
  const [timeframes, setTimeframes] = useState<string[]>(strategy.timeframes);
  const [cooldown, setCooldown] = useState(15);
  const [minConfidence, setMinConfidence] = useState(70);
  const [maxAlertsPerDay, setMaxAlertsPerDay] = useState(10);
  const [notifyOnTrigger, setNotifyOnTrigger] = useState(true);
  const [autoExecute, setAutoExecute] = useState(false);
  const [appliedTimeframes, setAppliedTimeframes] = useState<Record<string, boolean>>({
    '15m': true, '1h': true, '1d': true, '5m': false, '4h': false,
  });

  const filteredSymbols = useMemo(() => {
    return allSymbols.filter(s => {
      const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase());
      const matchesSector = sectorFilter === 'All' || s.sector === sectorFilter;
      const matchesExchange = exchangeFilter === 'all' || s.exchange === exchangeFilter;
      return matchesSearch && matchesSector && matchesExchange;
    });
  }, [search, sectorFilter, exchangeFilter]);

  const toggleSymbol = (symId: string) => {
    setSelectedSymbols(prev => {
      const next = new Set(prev);
      if (next.has(symId)) next.delete(symId);
      else next.add(symId);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedSymbols.size === filteredSymbols.length) setSelectedSymbols(new Set());
    else setSelectedSymbols(new Set(filteredSymbols.map(s => s.id)));
  };

  const applyStrategy = () => {
    if (selectedSymbols.size === 0) {
      toast.error('Select at least one symbol');
      return;
    }
    const syms = Array.from(selectedSymbols).map(id => allSymbols.find(s => s.id === id)?.symbol);
    toast.success(`Applied "${strategy.name}" to ${syms.length} symbols (${syms.slice(0, 3).join(', ')}${syms.length > 3 ? ` +${syms.length - 3} more` : ''})`, { duration: 5000 });
    setTimeout(() => navigate('/strategies'), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/strategies')} className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-yellow-400" />
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Apply Strategy</h1>
          </div>
          <p className="text-dark-400 text-sm">"{strategy.name}" — {strategy.description}</p>
        </div>
      </div>

      <div className="card p-5 border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/20">
              <Target size={24} className="text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-dark-50">{selectedSymbols.size} symbols selected</h2>
              <p className="text-xs text-dark-400">Timeframes: {appliedTimeframes && Object.entries(appliedTimeframes).filter(([_, v]) => v).map(([k]) => k).join(', ') || '—'}</p>
            </div>
          </div>
          <button onClick={applyStrategy} disabled={selectedSymbols.size === 0} className="btn-primary gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <Zap size={18} /> Apply Strategy to {selectedSymbols.size}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-sm font-semibold text-dark-300 mb-3 flex items-center gap-2"><Settings size={16} /> Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Cooldown (minutes)</label>
            <input type="number" min="1" max="1440" className="input font-mono" value={cooldown} onChange={e => setCooldown(parseInt(e.target.value) || 15)} />
            <p className="text-xs text-dark-500 mt-1">Min time between alerts on same symbol</p>
          </div>
          <div>
            <label className="label">Min Confidence (%)</label>
            <input type="number" min="0" max="100" className="input font-mono" value={minConfidence} onChange={e => setMinConfidence(parseInt(e.target.value) || 70)} />
            <p className="text-xs text-dark-500 mt-1">Only alert if confidence ≥ this</p>
          </div>
          <div>
            <label className="label">Max Alerts / Day</label>
            <input type="number" min="1" max="100" className="input font-mono" value={maxAlertsPerDay} onChange={e => setMaxAlertsPerDay(parseInt(e.target.value) || 10)} />
            <p className="text-xs text-dark-500 mt-1">Per-symbol daily cap</p>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Active Timeframes</label>
          <div className="flex flex-wrap gap-2">
            {['1m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'].map(tf => (
              <label key={tf} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${appliedTimeframes[tf] ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400' : 'bg-dark-800 border border-dark-700 text-dark-400 hover:bg-dark-700'}`}>
                <input
                  type="checkbox"
                  checked={!!appliedTimeframes[tf]}
                  onChange={e => setAppliedTimeframes(prev => ({ ...prev, [tf]: e.target.checked }))}
                  className="sr-only"
                />
                {appliedTimeframes[tf] ? <CheckSquare size={12} /> : <Square size={12} />}
                <span className="text-xs font-medium">{tf}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={notifyOnTrigger} onChange={e => setNotifyOnTrigger(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-primary-500" />
            <div><p className="text-sm font-medium text-dark-100">Send Telegram notification on trigger</p><p className="text-xs text-dark-400">Alert delivered to configured channels</p></div>
          </label>
          <label className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer">
            <input type="checkbox" checked={autoExecute} onChange={e => setAutoExecute(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-primary-500" />
            <div><p className="text-sm font-medium text-dark-100">Auto-execute trade on broker (advanced)</p><p className="text-xs text-dark-400">⚠️ Requires broker API connection and risk settings</p></div>
          </label>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input type="text" placeholder="Search symbols..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} className="input w-40">
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={exchangeFilter} onChange={e => setExchangeFilter(e.target.value as 'all' | 'NSE' | 'BSE')} className="input w-28">
            <option value="all">All</option>
            <option value="NSE">NSE</option>
            <option value="BSE">BSE</option>
          </select>
          <button onClick={toggleAll} className="btn-secondary text-sm whitespace-nowrap">
            {selectedSymbols.size === filteredSymbols.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSymbols.map(sym => {
          const isSelected = selectedSymbols.has(sym.id);
          return (
            <button
              key={sym.id}
              onClick={() => toggleSymbol(sym.id)}
              className={`card p-4 text-left transition-all hover:scale-[1.01] ${
                isSelected ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10' : 'hover:border-dark-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-dark-100">{sym.symbol.replace('.NS', '')}</span>
                  <span className="badge bg-dark-700 text-dark-400 text-xs">{sym.exchange}</span>
                </div>
                <div className={`w-6 h-6 rounded flex items-center justify-center ${isSelected ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-500'}`}>
                  {isSelected ? <CheckCircle size={14} /> : <Plus size={14} />}
                </div>
              </div>
              <p className="text-xs text-dark-400 mb-2">{sym.name}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="badge bg-dark-700 text-dark-300">{sym.sector}</span>
                <span className="font-mono text-dark-200">₹{sym.price.toLocaleString()}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}