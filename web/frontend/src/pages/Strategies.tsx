import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, ChevronDown, ChevronUp, Zap, Target, BarChart2, Copy, AlertTriangle, Trash2,
  Save, X, Edit, Power, PowerOff, CheckCircle, CircleDot, ArrowRight, Wand2,
  Sparkles, TrendingUp, Layers, List, Grid3X3, ToggleLeft, ToggleRight,
  Activity, BarChart3, Eye, EyeOff, ChevronRight, Info, Loader2, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Condition {
  id: string;
  type: 'pattern' | 'indicator';
  pattern?: string;
  indicator?: string;
  operator?: string;
  value?: number;
  tolerance?: number;
}

interface AppliedStrategy {
  strategyId: string;
  symbols: string[];
  timeframes: Record<string, boolean>;
  cooldown: number;
  minConfidence: number;
  maxAlertsPerDay: number;
  notifyOnTrigger: boolean;
  autoExecute: boolean;
  appliedAt: string;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  timeframes: string[];
  enabled: boolean;
  conditions: Condition[];
  custom?: boolean;
}

const PATTERNS = [
  { key: 'hammer', label: 'Hammer' },
  { key: 'inverted_hammer', label: 'Inverted Hammer' },
  { key: 'doji', label: 'Doji' },
  { key: 'shooting_star', label: 'Shooting Star' },
  { key: 'hanging_man', label: 'Hanging Man' },
  { key: 'bullish_engulfing', label: 'Bullish Engulfing' },
  { key: 'bearish_engulfing', label: 'Bearish Engulfing' },
  { key: 'piercing_line', label: 'Piercing Line' },
  { key: 'dark_cloud_cover', label: 'Dark Cloud Cover' },
  { key: 'bullish_harami', label: 'Bullish Harami' },
  { key: 'bearish_harami', label: 'Bearish Harami' },
  { key: 'morning_star', label: 'Morning Star' },
  { key: 'evening_star', label: 'Evening Star' },
  { key: 'three_white_soldiers', label: 'Three White Soldiers' },
  { key: 'three_black_crows', label: 'Three Black Crows' },
  { key: 'marubozu_bullish', label: 'Bullish Marubozu' },
  { key: 'marubozu_bearish', label: 'Bearish Marubozu' },
  { key: 'spinning_top', label: 'Spinning Top' },
];

const indicators = [
  { key: 'rsi', label: 'RSI', operators: ['lt', 'gt', 'eq', 'cross_above', 'cross_below'], unit: '' },
  { key: 'macd', label: 'MACD', operators: ['bullish_cross', 'bearish_cross', 'histogram_gt', 'histogram_lt'], unit: '' },
  { key: 'price_vs_ema20', label: 'Price vs EMA20', operators: ['gt', 'lt', 'near'], unit: '%' },
  { key: 'price_vs_ema50', label: 'Price vs EMA50', operators: ['gt', 'lt', 'near'], unit: '%' },
  { key: 'price_vs_ema200', label: 'Price vs EMA200', operators: ['gt', 'lt', 'near'], unit: '%' },
  { key: 'price_vs_vwap', label: 'Price vs VWAP', operators: ['gt', 'lt', 'cross_above', 'cross_below'], unit: '%' },
  { key: 'price_vs_sma200', label: 'Price vs SMA200', operators: ['gt', 'lt', 'near'], unit: '%' },
  { key: 'volume_spike', label: 'Volume Spike', operators: ['gt'], unit: 'x' },
  { key: 'rvol', label: 'Relative Volume', operators: ['gt', 'lt'], unit: 'x' },
  { key: 'bollinger_position', label: 'Bollinger Position', operators: ['lt', 'gt'], unit: '%' },
  { key: 'bollinger_width', label: 'Bollinger Width', operators: ['lt', 'gt'], unit: '' },
  { key: 'atr', label: 'ATR', operators: ['gt', 'lt'], unit: '' },
  { key: 'adx', label: 'ADX', operators: ['gt', 'lt'], unit: '' },
  { key: 'supertrend', label: 'Supertrend', operators: ['flip_bullish', 'flip_bearish'], unit: '' },
  { key: 'breakout_20d_high', label: '20-Day High Breakout', operators: ['eq'], unit: '' },
  { key: 'breakdown_20d_low', label: '20-Day Low Breakdown', operators: ['eq'], unit: '' },
  { key: 'pcr', label: 'Put-Call Ratio (Options)', operators: ['gt', 'lt'], unit: '' },
  { key: 'india_vix', label: 'India VIX', operators: ['gt', 'lt'], unit: '' },
  { key: 'max_pain', label: 'Distance to Max Pain', operators: ['lt', 'gt'], unit: '%' },
  { key: 'oi_change', label: 'OI Change', operators: ['gt'], unit: '' },
];

const CATEGORIES = [
  { id: 'candlestick', label: 'Candlestick', icon: BarChart3, color: 'blue' },
  { id: 'momentum', label: 'Momentum', icon: TrendingUp, color: 'green' },
  { id: 'mean-reversion', label: 'Mean Reversion', icon: Activity, color: 'purple' },
  { id: 'breakout', label: 'Breakout', icon: Zap, color: 'yellow' },
  { id: 'value', label: 'Value', icon: Target, color: 'cyan' },
  { id: 'options', label: 'Options', icon: Layers, color: 'pink' },
  { id: 'custom', label: 'Custom', icon: Sparkles, color: 'accent' },
];

const CATEGORY_META = CATEGORIES.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as Record<string, typeof CATEGORIES[number]>);

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w', '1M'];

const mockStrategies: Strategy[] = [
  { id: 's1', name: 'bullish_reversal', description: 'Hammer + RSI oversold near support', category: 'candlestick', timeframes: ['15m', '1h'], enabled: true, conditions: [{ id: 'c1', type: 'pattern', pattern: 'hammer' }, { id: 'c2', type: 'indicator', indicator: 'rsi', operator: 'lt', value: 35 }, { id: 'c3', type: 'indicator', indicator: 'price_vs_ema20', operator: 'near', value: 0, tolerance: 1.0 }] },
  { id: 's2', name: 'bullish_engulfing_trend', description: 'Bullish engulfing above EMA20', category: 'candlestick', timeframes: ['15m', '1h', '1d'], enabled: true, conditions: [{ id: 'c4', type: 'pattern', pattern: 'bullish_engulfing' }, { id: 'c5', type: 'indicator', indicator: 'price_vs_ema20', operator: 'gt', value: 0 }] },
  { id: 's3', name: 'morning_star_reversal', description: 'Morning star pattern with volume confirmation', category: 'candlestick', timeframes: ['1h', '1d'], enabled: true, conditions: [{ id: 'c6', type: 'pattern', pattern: 'morning_star' }, { id: 'c7', type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.5 }] },
  { id: 's4', name: 'bearish_reversal_top', description: 'Shooting star / evening star at resistance', category: 'candlestick', timeframes: ['15m', '1h', '1d'], enabled: true, conditions: [{ id: 'c8', type: 'pattern', pattern: 'shooting_star' }, { id: 'c9', type: 'indicator', indicator: 'rsi', operator: 'gt', value: 65 }] },
  { id: 's5', name: 'breakout_volume', description: 'Price breaks above 20-day high with volume spike', category: 'breakout', timeframes: ['1h', '1d'], enabled: false, conditions: [{ id: 'c10', type: 'indicator', indicator: 'breakout_20d_high', operator: 'eq', value: 1 }, { id: 'c11', type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 2.0 }] },
  { id: 's6', name: 'momentum_breakout', description: 'Momentum: RSI > 60 + MACD bullish cross + above 50 EMA', category: 'momentum', timeframes: ['15m', '1h', '1d'], enabled: true, conditions: [{ id: 'c12', type: 'indicator', indicator: 'rsi', operator: 'gt', value: 60 }, { id: 'c13', type: 'indicator', indicator: 'macd', operator: 'bullish_cross' }, { id: 'c14', type: 'indicator', indicator: 'price_vs_ema50', operator: 'gt', value: 0 }, { id: 'c15', type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.3 }] },
  { id: 's7', name: 'supertrend_follower', description: 'Trend-following via Supertrend flip + ADX confirmation', category: 'momentum', timeframes: ['1h', '1d'], enabled: true, conditions: [{ id: 'c16', type: 'indicator', indicator: 'supertrend', operator: 'flip_bullish' }, { id: 'c17', type: 'indicator', indicator: 'adx', operator: 'gt', value: 25 }] },
  { id: 's8', name: 'vwap_reclaim', description: 'Intraday: Price reclaims VWAP with volume surge', category: 'momentum', timeframes: ['5m', '15m'], enabled: true, conditions: [{ id: 'c18', type: 'indicator', indicator: 'price_vs_vwap', operator: 'cross_above' }, { id: 'c19', type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.5 }] },
  { id: 's9', name: 'mean_reversion_scalper', description: 'RSI < 25 oversold bounce with Bollinger touch', category: 'mean-reversion', timeframes: ['5m', '15m'], enabled: false, conditions: [{ id: 'c20', type: 'indicator', indicator: 'rsi', operator: 'lt', value: 25 }, { id: 'c21', type: 'indicator', indicator: 'bollinger_position', operator: 'lt', value: 5 }, { id: 'c22', type: 'pattern', pattern: 'hammer' }] },
  { id: 's10', name: 'bollinger_squeeze_breakout', description: 'Volatility contraction → expansion breakout', category: 'mean-reversion', timeframes: ['1h', '1d'], enabled: false, conditions: [{ id: 'c23', type: 'indicator', indicator: 'bollinger_width', operator: 'lt', value: 2 }, { id: 'c24', type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 2.0 }, { id: 'c25', type: 'pattern', pattern: 'bullish_engulfing' }] },
  { id: 's11', name: 'value_dividend_payout', description: 'High dividend yield + low P/E + healthy payout', category: 'value', timeframes: ['1d', '1w'], enabled: false, conditions: [{ id: 'c26', type: 'indicator', indicator: 'dividend_yield', operator: 'gt', value: 3.5 }, { id: 'c27', type: 'indicator', indicator: 'pe_ratio', operator: 'lt', value: 20 }, { id: 'c28', type: 'indicator', indicator: 'payout_ratio', operator: 'lt', value: 60 }] },
  { id: 's12', name: 'value_buy_dip', description: 'P/B < 1.5 + price near 200 SMA + hammer reversal', category: 'value', timeframes: ['1d', '1w'], enabled: false, conditions: [{ id: 'c29', type: 'indicator', indicator: 'pb_ratio', operator: 'lt', value: 1.5 }, { id: 'c30', type: 'indicator', indicator: 'price_vs_sma200', operator: 'near', value: 0, tolerance: 3 }, { id: 'c31', type: 'pattern', pattern: 'hammer' }] },
  { id: 's13', name: 'options_oi_buildup', description: 'Long buildup: Call OI up + price up + volume up', category: 'options', timeframes: ['15m', '1h'], enabled: true, conditions: [{ id: 'c32', type: 'indicator', indicator: 'oi_change', operator: 'gt', value: 10000 }, { id: 'c33', type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.5 }] },
  { id: 's14', name: 'options_pcr_extreme', description: 'PCR > 1.3 suggests put writing (bullish)', category: 'options', timeframes: ['15m', '1h'], enabled: false, conditions: [{ id: 'c34', type: 'indicator', indicator: 'pcr', operator: 'gt', value: 1.3 }, { id: 'c35', type: 'indicator', indicator: 'india_vix', operator: 'lt', value: 16 }] },
  { id: 's15', name: 'options_max_pain', description: 'Price gravitating towards max pain on expiry day', category: 'options', timeframes: ['15m', '1h'], enabled: false, conditions: [{ id: 'c36', type: 'indicator', indicator: 'max_pain', operator: 'lt', value: 0.5 }] },
];

const COLOR_BG: Record<string, string> = { blue: 'bg-blue-500/20 text-blue-400', green: 'bg-green-500/20 text-green-400', purple: 'bg-purple-500/20 text-purple-400', yellow: 'bg-yellow-500/20 text-yellow-400', cyan: 'bg-cyan-500/20 text-cyan-400', pink: 'bg-pink-500/20 text-pink-400', accent: 'bg-accent-500/20 text-accent-400' };

function loadApplied(): AppliedStrategy[] {
  try { const raw = localStorage.getItem('stockalert:applied_strategies'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function loadCustomStrategies(): Strategy[] {
  try { const raw = localStorage.getItem('stockalert:custom_strategies'); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export default function StrategiesPage() {
  const [allStrategies, setAllStrategies] = useState<Strategy[]>(mockStrategies);
  const [applied, setApplied] = useState<AppliedStrategy[]>(() => loadApplied());
  const [search, setSearch] = useState('');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [showOnlyApplied, setShowOnlyApplied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);

  useEffect(() => { localStorage.setItem('stockalert:applied_strategies', JSON.stringify(applied)); }, [applied]);

  useEffect(() => {
    const custom = loadCustomStrategies();
    setAllStrategies(prev => [...custom, ...prev]);
  }, []);

  const persistCustomStrategies = (strategies: Strategy[]) => {
    const customOnly = strategies.filter(s => s.custom);
    localStorage.setItem('stockalert:custom_strategies', JSON.stringify(customOnly));
  };

  const isApplied = (strategyId: string) => applied.some(a => a.strategyId === strategyId);

  const filtered = useMemo(() => {
    return allStrategies.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase());
      const matchesEnabled = !showOnlyEnabled || s.enabled;
      const matchesApplied = !showOnlyApplied || isApplied(s.id);
      return matchesSearch && matchesEnabled && matchesApplied;
    });
  }, [allStrategies, search, showOnlyEnabled, showOnlyApplied, applied]);

  const toggleEnabled = (id: string) => {
    setAllStrategies(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    const target = allStrategies.find(s => s.id === id);
    if (target) toast.success(`${target.name} ${target.enabled ? 'paused' : 'enabled'}`);
    persistCustomStrategies(allStrategies.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const duplicateStrategy = (s: Strategy) => {
    const newStrategy: Strategy = { ...s, id: `custom-${Date.now()}`, name: `${s.name}_copy`, enabled: false, custom: true };
    setAllStrategies(prev => [newStrategy, ...prev]);
    persistCustomStrategies([newStrategy, ...allStrategies]);
    toast.success(`Duplicated as "${newStrategy.name}"`);
  };

  const deleteStrategy = (id: string) => {
    const target = allStrategies.find(s => s.id === id);
    if (!target) return;
    if (!target.custom) {
      if (!confirm('Delete this built-in strategy? You can re-add it from templates.')) return;
    }
    setAllStrategies(prev => prev.filter(s => s.id !== id));
    setApplied(prev => prev.filter(a => a.strategyId !== id));
    persistCustomStrategies(allStrategies.filter(s => s.id !== id));
    toast.success(`Deleted "${target.name}"`);
  };

  const openCreate = () => { setEditing({ id: `custom-${Date.now()}`, name: '', description: '', category: 'custom', timeframes: ['15m', '1h'], enabled: true, conditions: [{ id: `c-${Date.now()}`, type: 'pattern' }], custom: true }); setShowCreate(true); };

  const openEdit = (s: Strategy) => { setEditing({ ...s, conditions: s.conditions.length > 0 ? s.conditions : [{ id: `c-${Date.now()}`, type: 'pattern' }] }); setShowCreate(true); };

  const saveStrategy = () => {
    if (!editing) return;
    if (!editing.name.trim()) { toast.error('Strategy name is required'); return; }
    if (editing.conditions.length === 0) { toast.error('Add at least one condition'); return; }
    setAllStrategies(prev => {
      const exists = prev.find(s => s.id === editing.id);
      if (exists) return prev.map(s => s.id === editing.id ? editing : s);
      return [editing, ...prev];
    });
    persistCustomStrategies(allStrategies.find(s => s.id === editing.id) ? allStrategies.map(s => s.id === editing.id ? editing : s) : [editing, ...allStrategies]);
    setShowCreate(false);
    setEditing(null);
    toast.success(`Strategy "${editing.name}" saved`);
  };

  const addCondition = () => { if (editing) setEditing({ ...editing, conditions: [...editing.conditions, { id: `c-${Date.now()}-${Math.random()}`, type: 'pattern' }] }); };
  const removeCondition = (cid: string) => { if (editing) setEditing({ ...editing, conditions: editing.conditions.filter(c => c.id !== cid) }); };
  const updateCondition = (cid: string, updates: Partial<Condition>) => {
    if (!editing) return;
    setEditing({ ...editing, conditions: editing.conditions.map(c => c.id === cid ? { ...c, ...updates } : c) });
  };

  const getConditionLabel = (c: Condition) => {
    if (c.type === 'pattern') { return `Pattern: ${PATTERNS.find(p => p.key === c.pattern)?.label || c.pattern?.replace(/_/g, ' ')}`; }
    const ind = indicators.find(i => i.key === c.indicator);
    const operatorLabel = (ind?.operators || []).includes(c.operator || '') ? c.operator : c.operator;
    return `${ind?.label || c.indicator} ${operatorLabel} ${c.value}${ind?.unit || ''}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Strategies</h1>
          <p className="text-dark-400 mt-1">Combine patterns and indicators for custom signals • {applied.length} applied • {allStrategies.filter(s => s.enabled).length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')} className="btn-ghost p-2" title={viewMode === 'list' ? 'Switch to grid' : 'Switch to list'}>
            {viewMode === 'list' ? <Grid3X3 size={18} /> : <List size={18} />}
          </button>
          <button onClick={openCreate} className="btn-primary gap-2"><Plus size={18} /> Create Strategy</button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Total</span><Layers size={14} className="text-primary-400" /></div><p className="text-2xl font-bold text-dark-50 mt-1">{allStrategies.length}</p></div>
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Active</span><Power size={14} className="text-green-400" /></div><p className="text-2xl font-bold text-green-400 mt-1">{allStrategies.filter(s => s.enabled).length}</p></div>
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Applied</span><CheckCircle size={14} className="text-blue-400" /></div><p className="text-2xl font-bold text-blue-400 mt-1">{applied.length}</p></div>
        <div className="card p-3"><div className="flex items-center justify-between"><span className="text-xs text-dark-400">Custom</span><Sparkles size={14} className="text-accent-400" /></div><p className="text-2xl font-bold text-accent-400 mt-1">{allStrategies.filter(s => s.custom).length}</p></div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input type="text" placeholder="Search strategies by name or description..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer self-center px-3 py-1.5 bg-dark-800/50 rounded-lg"><input type="checkbox" checked={showOnlyEnabled} onChange={e => setShowOnlyEnabled(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-primary-500" /><span className="text-sm text-dark-300">Enabled</span></label>
          <label className="flex items-center gap-2 cursor-pointer self-center px-3 py-1.5 bg-dark-800/50 rounded-lg"><input type="checkbox" checked={showOnlyApplied} onChange={e => setShowOnlyApplied(e.target.checked)} className="w-4 h-4 rounded border-dark-600 text-primary-500" /><span className="text-sm text-dark-300">Applied</span></label>
        </div>
      </div>

      <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'}>
        {filtered.map(strategy => {
          const cat = CATEGORY_META[strategy.category];
          const appliedConfig = applied.find(a => a.strategyId === strategy.id);
          const expanded = expandedId === strategy.id;
          return (
            <div key={strategy.id} className={`card ${strategy.custom ? 'border-accent-500/30' : ''} hover:border-primary-500/40 transition-all`}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Zap size={18} className={`flex-shrink-0 ${strategy.enabled ? 'text-primary-400' : 'text-dark-500'}`} />
                    <h3 className="text-base font-semibold text-dark-50">{strategy.name.replace(/_/g, ' ')}</h3>
                    <span className={`badge text-xs ${COLOR_BG[cat?.color || 'blue']}`}>{cat?.label}</span>
                    {strategy.custom && <span className="badge bg-accent-500/20 text-accent-400 text-xs">Custom</span>}
                  </div>
                </div>
                <p className="text-sm text-dark-400 mb-3">{strategy.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {strategy.timeframes.map(tf => <span key={tf} className="badge bg-blue-500/20 text-blue-400 text-xs">{tf}</span>)}
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${strategy.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {strategy.enabled ? <><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5 inline-block" /> Active</> : <>Inactive</>}
                    </span>
                    {appliedConfig && <span className="badge bg-blue-500/20 text-blue-400 text-xs"><CheckCircle size={10} className="inline mr-1" /> {appliedConfig.symbols.length} symbols</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => toggleEnabled(strategy.id)} className={`p-2 rounded transition-colors ${strategy.enabled ? 'text-green-400 hover:bg-green-500/10' : 'text-dark-400 hover:bg-dark-700'}`} title={strategy.enabled ? 'Pause' : 'Enable'}>
                      {strategy.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <Link to={`/strategies/${strategy.id}/apply`} className={`p-2 rounded transition-colors flex items-center gap-1 ${appliedConfig ? 'text-blue-400 bg-blue-500/10' : 'text-dark-400 hover:bg-dark-700'}`} title={appliedConfig ? 'Edit application' : 'Apply strategy'}>
                      <Target size={16} /> <span className="text-xs hidden md:inline">{appliedConfig ? 'Edit' : 'Apply'}</span>
                    </Link>
                    <button onClick={() => toggleExpand(strategy.id)} className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Conditions">
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button onClick={() => openEdit(strategy)} className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Edit"><Edit size={16} /></button>
                    <button onClick={() => duplicateStrategy(strategy)} className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Duplicate"><Copy size={16} /></button>
                    <button onClick={() => deleteStrategy(strategy.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400 transition-colors" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
              {expanded && (
                <div className="border-t border-dark-700 bg-dark-800/30 p-4">
                  <h4 className="text-sm font-medium text-dark-300 mb-3 flex items-center gap-2"><Info size={14} /> Conditions</h4>
                  <div className="space-y-2 mb-3">
                    {strategy.conditions.map((c, idx) => (
                      <div key={c.id || idx} className="flex items-center gap-3 p-2.5 bg-dark-900/50 rounded-lg border border-dark-700">
                        <span className="text-xs text-dark-500 font-mono w-6">#{idx + 1}</span>
                        <span className={`badge text-xs ${c.type === 'pattern' ? 'bg-primary-500/20 text-primary-400' : 'bg-purple-500/20 text-purple-400'}`}>{c.type}</span>
                        <span className="text-dark-300 flex-1 text-sm font-mono">{getConditionLabel(c)}</span>
                        {c.tolerance !== undefined && <span className="badge bg-purple-500/20 text-purple-400 text-xs">±{c.tolerance}%</span>}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-dark-500 flex items-center gap-4 pt-2 border-t border-dark-700">
                    <span className="flex items-center gap-1"><Target size={12} className="text-green-400" /> Match all conditions</span>
                    <span className="flex items-center gap-1"><AlertTriangle size={12} className="text-yellow-400" /> Cooldown: 15 min</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center text-dark-500 card"><Zap size={48} className="mx-auto mb-4 opacity-30" /><p className="text-lg">No strategies match your filters</p></div>
        )}
      </div>

      {showCreate && editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto" onClick={() => { setShowCreate(false); setEditing(null); }}>
          <div className="card-elevated max-w-3xl w-full my-8 scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-dark-700 sticky top-0 bg-dark-900 z-10">
              <div>
                <h3 className="text-xl font-bold text-dark-50 flex items-center gap-2"><Wand2 size={20} className="text-accent-400" /> {editing.id.startsWith('custom-') && !allStrategies.find(s => s.id === editing.id) ? 'New Custom Strategy' : 'Edit Strategy'}</h3>
                <p className="text-xs text-dark-500 mt-0.5">Combine patterns + indicators with AND logic</p>
              </div>
              <button onClick={() => { setShowCreate(false); setEditing(null); }} className="p-2 rounded hover:bg-dark-700 text-dark-400"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input type="text" placeholder="e.g. my_breakout_setup" className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value.replace(/\s+/g, '_').toLowerCase() })} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input h-20" placeholder="What this strategy detects (e.g. 'Bullish engulfing in uptrend')" value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Timeframes</label>
                <div className="flex flex-wrap gap-2">
                  {TIMEFRAMES.map(tf => (
                    <button key={tf} type="button" onClick={() => setEditing({ ...editing, timeframes: editing.timeframes.includes(tf) ? editing.timeframes.filter(t => t !== tf) : [...editing.timeframes, tf] })} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${editing.timeframes.includes(tf) ? 'bg-primary-500/20 border border-primary-500/30 text-primary-400' : 'bg-dark-800 border border-dark-700 text-dark-400 hover:bg-dark-700'}`}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label !mb-0">Conditions ({editing.conditions.length})</label>
                  <button onClick={addCondition} className="btn-secondary text-xs gap-1"><Plus size={14} /> Add Condition</button>
                </div>
                <div className="space-y-3">
                  {editing.conditions.map((c, idx) => (
                    <div key={c.id} className="p-3 bg-dark-800/50 rounded-lg border border-dark-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-dark-500 font-mono">Condition #{idx + 1}</span>
                        <button onClick={() => removeCondition(c.id)} className="p-1 rounded hover:bg-red-500/10 text-red-400 transition-colors"><X size={14} /></button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <select value={c.type} onChange={e => updateCondition(c.id, { type: e.target.value as 'pattern' | 'indicator' })} className="input text-sm">
                          <option value="pattern">Pattern</option>
                          <option value="indicator">Indicator</option>
                        </select>
                        {c.type === 'pattern' ? (
                          <select value={c.pattern || ''} onChange={e => updateCondition(c.id, { pattern: e.target.value })} className="input text-sm sm:col-span-3">
                            <option value="">Select a pattern...</option>
                            {PATTERNS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                          </select>
                        ) : (
                          <>
                            <select value={c.indicator || ''} onChange={e => { const ind = indicators.find(i => i.key === e.target.value); updateCondition(c.id, { indicator: e.target.value, operator: ind?.operators[0] }); }} className="input text-sm">
                              <option value="">Select indicator...</option>
                              {indicators.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
                            </select>
                            <select value={c.operator || ''} onChange={e => updateCondition(c.id, { operator: e.target.value })} className="input text-sm">
                              <option value="">Operator</option>
                              {(indicators.find(i => i.key === c.indicator)?.operators || []).map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <input type="number" step="0.01" placeholder="Value" className="input text-sm font-mono" value={c.value ?? ''} onChange={e => updateCondition(c.id, { value: parseFloat(e.target.value) || 0 })} />
                          </>
                        )}
                      </div>
                      {c.operator === 'near' && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-dark-400">Tolerance:</label>
                          <input type="number" step="0.1" className="input text-xs w-24 font-mono" value={c.tolerance ?? 1} onChange={e => updateCondition(c.id, { tolerance: parseFloat(e.target.value) || 1 })} />
                          <span className="text-xs text-dark-500">%</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {editing.conditions.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-dark-700 rounded-lg text-center text-dark-500 text-sm">
                      No conditions yet. <button onClick={addCondition} className="text-primary-400 hover:underline">Add your first condition</button>
                    </div>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={editing.enabled} onChange={e => setEditing({ ...editing, enabled: e.target.checked })} className="w-4 h-4 rounded border-dark-600 text-primary-500" />
                <div><p className="text-sm font-medium text-dark-100">Enable immediately</p><p className="text-xs text-dark-400">Strategy will start scanning as soon as it's saved</p></div>
              </label>
            </div>
            <div className="flex gap-2 p-6 border-t border-dark-700 sticky bottom-0 bg-dark-900">
              <button onClick={() => { setShowCreate(false); setEditing(null); }} className="btn-ghost flex-1">Cancel</button>
              <button onClick={saveStrategy} className="btn-primary flex-1 gap-2"><Save size={16} /> Save Strategy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}