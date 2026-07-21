import { Plus, Search, ChevronDown, ChevronUp, Zap, Target, BarChart2, Copy, AlertTriangle, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Condition {
  type: 'pattern' | 'indicator';
  pattern?: string;
  indicator?: string;
  operator?: string;
  value?: number;
  tolerance?: number;
}

interface Strategy {
  id: string;
  name: string;
  description: string;
  timeframes: string[];
  enabled: boolean;
  conditions: Condition[];
}

const indicators = [
  { key: 'rsi', label: 'RSI', operators: ['lt', 'gt', 'eq'], unit: '' },
  { key: 'macd', label: 'MACD', operators: ['bullish_cross', 'bearish_cross'], unit: '' },
  { key: 'price_vs_ema20', label: 'Price vs EMA20', operators: ['gt', 'lt', 'near'], unit: '%' },
  { key: 'volume_spike', label: 'Volume Spike', operators: ['gt'], unit: 'x' },
  { key: 'bollinger_position', label: 'Bollinger Position', operators: ['lt', 'gt'], unit: '%' },
  { key: 'atr', label: 'ATR', operators: ['gt', 'lt'], unit: '' },
];

const mockStrategies: Strategy[] = [
  // Candlestick patterns
  {
    id: '1',
    name: 'bullish_reversal',
    description: 'Hammer + RSI oversold near support',
    timeframes: ['15m', '1h'],
    enabled: true,
    conditions: [
      { type: 'pattern', pattern: 'hammer' },
      { type: 'indicator', indicator: 'rsi', operator: 'lt', value: 35 },
      { type: 'indicator', indicator: 'price_vs_ema20', operator: 'near', value: 0, tolerance: 1.0 },
    ],
  },
  {
    id: '2',
    name: 'bullish_engulfing_trend',
    description: 'Bullish engulfing above EMA20',
    timeframes: ['15m', '1h', '1d'],
    enabled: true,
    conditions: [
      { type: 'pattern', pattern: 'bullish_engulfing' },
      { type: 'indicator', indicator: 'price_vs_ema20', operator: 'gt', value: 0 },
    ],
  },
  {
    id: '3',
    name: 'morning_star_reversal',
    description: 'Morning star pattern with volume confirmation',
    timeframes: ['1h', '1d'],
    enabled: true,
    conditions: [
      { type: 'pattern', pattern: 'morning_star' },
      { type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.5 },
    ],
  },
  {
    id: '4',
    name: 'bearish_reversal_top',
    description: 'Shooting star / evening star at resistance',
    timeframes: ['15m', '1h', '1d'],
    enabled: true,
    conditions: [
      { type: 'pattern', pattern: 'shooting_star' },
      { type: 'indicator', indicator: 'rsi', operator: 'gt', value: 65 },
    ],
  },
  {
    id: '5',
    name: 'breakout_volume',
    description: 'Price breaks above 20-day high with volume spike',
    timeframes: ['1h', '1d'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'breakout_20d_high', operator: 'eq', value: 1 },
      { type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 2.0 },
    ],
  },

  // Momentum strategies
  {
    id: '6',
    name: 'momentum_breakout',
    description: 'Momentum: RSI > 60 + MACD bullish cross + above 50 EMA',
    timeframes: ['15m', '1h', '1d'],
    enabled: true,
    conditions: [
      { type: 'indicator', indicator: 'rsi', operator: 'gt', value: 60 },
      { type: 'indicator', indicator: 'macd', operator: 'bullish_cross' },
      { type: 'indicator', indicator: 'price_vs_ema50', operator: 'gt', value: 0 },
      { type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.3 },
    ],
  },
  {
    id: '7',
    name: 'supertrend_follower',
    description: 'Trend-following via Supertrend flip + ADX confirmation',
    timeframes: ['1h', '1d'],
    enabled: true,
    conditions: [
      { type: 'indicator', indicator: 'supertrend', operator: 'flip_bullish' },
      { type: 'indicator', indicator: 'adx', operator: 'gt', value: 25 },
    ],
  },
  {
    id: '8',
    name: 'vwap_reclaim',
    description: 'Intraday: Price reclaims VWAP with volume surge',
    timeframes: ['5m', '15m'],
    enabled: true,
    conditions: [
      { type: 'indicator', indicator: 'price_vs_vwap', operator: 'cross_above' },
      { type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.5 },
    ],
  },

  // Mean reversion strategies
  {
    id: '9',
    name: 'mean_reversion_scalper',
    description: 'RSI < 25 oversold bounce with Bollinger touch',
    timeframes: ['5m', '15m'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'rsi', operator: 'lt', value: 25 },
      { type: 'indicator', indicator: 'bollinger_position', operator: 'lt', value: 5 },
      { type: 'pattern', pattern: 'hammer' },
    ],
  },
  {
    id: '10',
    name: 'bollinger_squeeze_breakout',
    description: 'Volatility contraction → expansion breakout',
    timeframes: ['1h', '1d'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'bollinger_width', operator: 'lt', value: 2 },
      { type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 2.0 },
      { type: 'pattern', pattern: 'bullish_engulfing' },
    ],
  },

  // Value / Dividend / Growth
  {
    id: '11',
    name: 'value_dividend_payout',
    description: 'High dividend yield + low P/E + healthy payout',
    timeframes: ['1d', '1w'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'dividend_yield', operator: 'gt', value: 3.5 },
      { type: 'indicator', indicator: 'pe_ratio', operator: 'lt', value: 20 },
      { type: 'indicator', indicator: 'payout_ratio', operator: 'lt', value: 60 },
    ],
  },
  {
    id: '12',
    name: 'growth_momentum',
    description: 'Revenue + earnings growth above 20% YoY',
    timeframes: ['1d'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'revenue_growth_yoy', operator: 'gt', value: 20 },
      { type: 'indicator', indicator: 'earnings_growth_yoy', operator: 'gt', value: 20 },
      { type: 'indicator', indicator: 'rsi', operator: 'gt', value: 55 },
    ],
  },
  {
    id: '13',
    name: 'value_buy_dip',
    description: 'P/B < 1.5 + price near 200 SMA + hammer reversal',
    timeframes: ['1d', '1w'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'pb_ratio', operator: 'lt', value: 1.5 },
      { type: 'indicator', indicator: 'price_vs_sma200', operator: 'near', value: 0, tolerance: 3 },
      { type: 'pattern', pattern: 'hammer' },
    ],
  },

  // Options strategies
  {
    id: '14',
    name: 'options_oi_buildup',
    description: 'Long buildup: Call OI up + price up + volume up',
    timeframes: ['15m', '1h'],
    enabled: true,
    conditions: [
      { type: 'indicator', indicator: 'call_oi_change', operator: 'gt', value: 10000 },
      { type: 'indicator', indicator: 'price_change', operator: 'gt', value: 0.5 },
      { type: 'indicator', indicator: 'volume_spike', operator: 'gt', value: 1.5 },
    ],
  },
  {
    id: '15',
    name: 'options_pcr_extreme',
    description: 'PCR > 1.3 suggests put writing (bullish)',
    timeframes: ['15m', '1h'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'pcr', operator: 'gt', value: 1.3 },
      { type: 'indicator', indicator: 'india_vix', operator: 'lt', value: 16 },
    ],
  },
  {
    id: '16',
    name: 'options_max_pain',
    description: 'Price gravitating towards max pain on expiry day',
    timeframes: ['15m', '1h'],
    enabled: false,
    conditions: [
      { type: 'indicator', indicator: 'distance_from_max_pain', operator: 'lt', value: 0.5 },
      { type: 'indicator', indicator: 'days_to_expiry', operator: 'lt', value: 1 },
    ],
  },
];

export default function StrategiesPage() {
  const [strategies] = useState(mockStrategies);
  const [search, setSearch] = useState('');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredStrategies = useMemo(() => {
    return strategies
      .filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.description.toLowerCase().includes(search.toLowerCase());
        const matchesEnabled = !showOnlyEnabled || s.enabled;
        return matchesSearch && matchesEnabled;
      });
  }, [strategies, search, showOnlyEnabled]);

  const getConditionLabel = (c: Condition) => {
    if (c.type === 'pattern') {
      return `Pattern: ${c.pattern?.replace(/_/g, ' ')}`;
    }
    const ind = indicators.find(i => i.key === c.indicator);
    return `${ind?.label || c.indicator} ${c.operator} ${c.value}${ind?.unit || ''}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Strategies</h1>
          <p className="text-dark-400 mt-1">Combine patterns and indicators for custom signals</p>
        </div>
        <button className="btn-primary gap-2">
          <Plus size={18} />
          Create Strategy
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 size-5" />
            <input
              type="text"
              placeholder="Search strategies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer self-center">
            <input
              type="checkbox"
              checked={showOnlyEnabled}
              onChange={e => setShowOnlyEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-dark-300">Enabled only</span>
          </label>
        </div>

        <div className="space-y-3">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="card border border-dark-700">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
                        <Zap size={20} className="text-yellow-400" />
                        {strategy.name.replace(/_/g, ' ')}
                      </h3>
                      <span className={`badge ${strategy.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {strategy.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-dark-400 text-sm mb-3">{strategy.description}</p>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {strategy.timeframes.map(tf => (
                        <span key={tf} className="badge bg-blue-500/20 text-blue-400">{tf}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpand(strategy.id)}
                      className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors"
                    >
                      {expandedId === strategy.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Duplicate">
                      <Copy size={18} />
                    </button>
                    <button className="p-2 rounded hover:bg-red-500/10 text-red-400" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === strategy.id && (
                <div className="border-t border-dark-700 bg-dark-800/30 p-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-dark-300">Conditions</h4>
                    <div className="space-y-2">
                      {strategy.conditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-dark-900/50 rounded-lg border border-dark-700">
                          <span className="badge bg-primary-500/20 text-primary-400 text-xs min-w-[80px] text-center">
                            {condition.type === 'pattern' ? 'Pattern' : 'Indicator'}
                          </span>
                          <span className="text-dark-300 flex-1">{getConditionLabel(condition)}</span>
                          {condition.tolerance !== undefined && (
                            <span className="badge bg-purple-500/20 text-purple-400 text-xs">±{condition.tolerance}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-dark-700 flex items-center gap-4 text-sm text-dark-400">
                      <span className="flex items-center gap-1">
                        <Target size={14} className="text-green-400" />
                        <span>Buy signals when all conditions match</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={14} className="text-yellow-400" />
                        <span>Cooldown: 15 min between alerts</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredStrategies.length === 0 && (
            <div className="p-12 text-center text-dark-500">
              <Zap size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">No strategies found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2">
            <BarChart2 size={20} className="text-primary-400" />
            Quick Stats
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-dark-800/50 rounded-xl">
            <p className="text-3xl font-bold text-dark-50">{strategies.length}</p>
            <p className="text-sm text-dark-400">Total Strategies</p>
          </div>
          <div className="text-center p-4 bg-dark-800/50 rounded-xl">
            <p className="text-3xl font-bold text-green-400">{strategies.filter(s => s.enabled).length}</p>
            <p className="text-sm text-dark-400">Active</p>
          </div>
          <div className="text-center p-4 bg-dark-800/50 rounded-xl">
            <p className="text-3xl font-bold text-yellow-400">{strategies.filter(s => !s.enabled).length}</p>
            <p className="text-sm text-dark-400">Inactive</p>
          </div>
          <div className="text-center p-4 bg-dark-800/50 rounded-xl">
            <p className="text-3xl font-bold text-blue-400">{strategies.reduce((acc, s) => acc + s.conditions.length, 0)}</p>
            <p className="text-sm text-dark-400">Total Conditions</p>
          </div>
        </div>
      </div>
    </div>
  );
}