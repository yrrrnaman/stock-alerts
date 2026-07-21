import { Plus, Search, ChevronDown, ChevronUp, Edit, Trash2, Check, X, Download, RefreshCw, Eye, EyeOff, Target, Copy, AlertTriangle, TrendingUp, TrendingDown, Zap, BarChart2, Filter, Calendar, Clock, Share2, Bell, Mail, Smartphone, Webhook, Radio, Volume2, Save, FolderPlus, Layers, History, GitBranch, Github, LayoutDashboard, Wifi, Database, Key, Shield, Terminal, Globe, Palette, Trash2 as TrashIcon, Settings as SettingsIcon, Moon, Sun, Monitor, TestTube, Info, WifiOff, ToggleLeft, ToggleRight, CheckCircle, XCircle, Upload, Cloud, Server, Cpu, HardDrive, Monitor as MonitorIcon, Smartphone as SmartphoneIcon, Bell as BellIcon, Mail as MailIcon, Webhook as WebhookIcon, Radio as RadioIcon, Volume2 as VolumeIcon, BookOpen, Code2, Braces, FunctionSquare, Link2, Unlink2, RotateCcw, RotateCw, Share2 as ShareIcon, Flag, FlagOff, Bookmark, BookmarkPlus, Archive, ArchiveRestore } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Symbol {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  enabled: boolean;
  timeframes: string[];
  alertTypes: string[];
  minConfidence: number;
  sector?: string;
  marketCap?: string;
  lastPrice?: number;
  changePct?: number;
}

const mockSymbols: Symbol[] = [
  { id: '1', symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 60, sector: 'Energy', marketCap: 'Large', lastPrice: 2543.20, changePct: 0.64 },
  { id: '2', symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h'], alertTypes: ['pattern'], minConfidence: 65, sector: 'IT', marketCap: 'Large', lastPrice: 3890.50, changePct: 1.2 },
  { id: '3', symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', enabled: true, timeframes: ['1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 70, sector: 'IT', marketCap: 'Large', lastPrice: 1520.75, changePct: -0.5 },
  { id: '4', symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 60, sector: 'Banking', marketCap: 'Large', lastPrice: 1645.90, changePct: 0.8 },
  { id: '5', symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h'], alertTypes: ['strategy'], minConfidence: 75, sector: 'Banking', marketCap: 'Large', lastPrice: 1080.45, changePct: -0.3 },
  { id: '6', symbol: '^NSEI', name: 'NIFTY 50 Index', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 70, sector: 'Index', marketCap: 'Index', lastPrice: 24580.30, changePct: 0.64 },
  { id: '7', symbol: '^NSEBANK', name: 'NIFTY Bank Index', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 70, sector: 'Index', marketCap: 'Index', lastPrice: 52180.30, changePct: -0.61 },
  { id: '8', symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 65, sector: 'Financial', marketCap: 'Large', lastPrice: 7200.00, changePct: 2.8 },
  { id: '9', symbol: 'MARUTI.NS', name: 'Maruti Suzuki', exchange: 'NSE', enabled: true, timeframes: ['1h', '1d'], alertTypes: ['pattern'], minConfidence: 70, sector: 'Auto', marketCap: 'Large', lastPrice: 10500.50, changePct: 2.4 },
  { id: '10', symbol: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 75, sector: 'Construction', marketCap: 'Large', lastPrice: 3200.00, changePct: 1.5 },
  { id: '11', symbol: 'TATAMOTORS.NS', name: 'Tata Motors', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 60, sector: 'Auto', marketCap: 'Large', lastPrice: 945.20, changePct: 3.2 },
  { id: '12', symbol: 'WIPRO.NS', name: 'Wipro', exchange: 'NSE', enabled: false, timeframes: ['1h', '1d'], alertTypes: ['pattern'], minConfidence: 70, sector: 'IT', marketCap: 'Large', lastPrice: 450.30, changePct: -1.2 },
  { id: '13', symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 65, sector: 'Banking', marketCap: 'Large', lastPrice: 650.80, changePct: 1.8 },
  { id: '14', symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', exchange: 'NSE', enabled: true, timeframes: ['1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 70, sector: 'Telecom', marketCap: 'Large', lastPrice: 1150.40, changePct: 0.9 },
  { id: '15', symbol: 'ASIANPAINT.NS', name: 'Asian Paints', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 60, sector: 'FMCG', marketCap: 'Large', lastPrice: 2980.25, changePct: -1.1 },
];

const sectors = ['All', 'IT', 'Banking', 'Auto', 'Energy', 'Financial', 'Construction', 'Telecom', 'FMCG', 'Pharma', 'Metal', 'Index'];
const exchanges = ['All', 'NSE', 'BSE'];
const marketCaps = ['All', 'Large', 'Mid', 'Small', 'Index'];

export default function SymbolsPage() {
  const [symbols] = useState(mockSymbols);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedExchange, setSelectedExchange] = useState('All');
  const [selectedMarketCap, setSelectedMarketCap] = useState('All');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Symbol; direction: 'asc' | 'desc' }>({ key: 'symbol', direction: 'asc' });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSymbols, setSelectedSymbols] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState({ symbol: '', name: '', exchange: 'NSE', sector: 'IT', marketCap: 'Large' });

  const filteredSymbols = useMemo(() => {
    return symbols
      .filter(s => {
        const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
        const matchesSector = selectedSector === 'All' || s.sector === selectedSector;
        const matchesExchange = selectedExchange === 'All' || s.exchange === selectedExchange;
        const matchesMarketCap = selectedMarketCap === 'All' || s.marketCap === selectedMarketCap;
        const matchesEnabled = !showOnlyEnabled || s.enabled;
        return matchesSearch && matchesSector && matchesExchange && matchesMarketCap && matchesEnabled;
      })
      .sort((a, b) => {
        const aVal = a[sortConfig.key] ?? '';
        const bVal = b[sortConfig.key] ?? '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [symbols, search, selectedSector, selectedExchange, selectedMarketCap, showOnlyEnabled, sortConfig]);

  const handleSort = (key: keyof Symbol) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedSymbols(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedSymbols.size === filteredSymbols.length) {
      setSelectedSymbols(new Set());
    } else {
      setSelectedSymbols(new Set(filteredSymbols.map(a => a.id)));
    }
  };

  const bulkAction = (action: 'enable' | 'disable' | 'delete') => {
    // In real app, call API
    console.log(`Bulk ${action}:`, Array.from(selectedSymbols));
  };

  const handleAddSymbol = () => {
    // In real app, call API
    console.log('Add symbol:', newSymbol);
    setShowAddModal(false);
    setNewSymbol({ symbol: '', name: '', exchange: 'NSE', sector: 'IT', marketCap: 'Large' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/10">
              <BarChart2 size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-dark-50">Symbols Manager</div>
              <div className="text-dark-400 text-sm">Manage watched symbols, sectors, and alert configurations</div>
            </div>
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-dark-800/50 border border-dark-700 rounded-lg px-3 py-2">
            <span className="text-sm text-dark-300">{selectedSymbols.size} selected</span>
            {selectedSymbols.size > 0 && (
              <>
                <button className="btn-secondary text-xs gap-1" onClick={() => bulkAction('enable')}>
                  <Check size={12} />
                  Enable
                </button>
                <button className="btn-danger text-xs gap-1" onClick={() => bulkAction('disable')}>
                  <X size={12} />
                  Disable
                </button>
                <button className="btn-danger text-xs gap-1" onClick={() => bulkAction('delete')}>
                  <TrashIcon size={12} />
                  Delete
                </button>
              </>
            )}
          </div>
          <button className="btn-primary gap-2" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            Add Symbol
          </button>
          <button className="btn-secondary gap-2">
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-secondary gap-2">
            <Upload size={18} />
            Import
          </button>
          <button className="btn-secondary gap-2">
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500 size-5" />
            <input
              type="text"
              placeholder="Search symbols, names, sectors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="input py-2 px-3 min-w-[140px]"
            >
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={selectedExchange}
              onChange={e => setSelectedExchange(e.target.value)}
              className="input py-2 px-3 min-w-[140px]"
            >
              {exchanges.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select
              value={selectedMarketCap}
              onChange={e => setSelectedMarketCap(e.target.value)}
              className="input py-2 px-3 min-w-[140px]"
            >
              {marketCaps.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer self-center">
              <input
                type="checkbox"
                checked={showOnlyEnabled}
                onChange={e => setShowOnlyEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm text-dark-300">Enabled only</span>
            </label>
            <div className="flex items-center gap-2 self-center">
              <span className="text-sm text-dark-400">View:</span>
              <button onClick={() => setViewMode('table')} className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'}`}>
                <LayoutDashboard size={16} />
              </button>
              <button onClick={() => setViewMode('cards')} className={`p-2 rounded ${viewMode === 'cards' ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-700 text-dark-400 hover:bg-dark-600'}`}>
                <Layers size={16} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700 text-left text-sm font-medium text-dark-400">
                  <th className="p-3 w-12">
                    <input
                      type="checkbox"
                      checked={selectedSymbols.size === filteredSymbols.length && filteredSymbols.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                  </th>
                  <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('symbol')}>
                    Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('sector')}>
                    Sector {sortConfig.key === 'sector' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('marketCap')}>
                    Market Cap {sortConfig.key === 'marketCap' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Timeframes</th>
                  <th className="p-3">Alert Types</th>
                  <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('minConfidence')}>
                    Min Conf {sortConfig.key === 'minConfidence' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Change</th>
                  <th className="p-3 w-48">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700">
                {filteredSymbols.map((symbol) => (
                  <tr key={symbol.id} className={`hover:bg-dark-800/50 transition-colors ${selectedSymbols.has(symbol.id) ? 'bg-primary-500/5' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedSymbols.has(symbol.id)}
                        onChange={() => toggleSelect(symbol.id)}
                        className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                    <td className="p-3 font-mono font-medium text-dark-100">{symbol.symbol}</td>
                    <td className="p-3 text-dark-300">{symbol.name}</td>
                    <td className="p-3">
                      <span className="badge bg-blue-500/20 text-blue-400 text-xs">{symbol.sector}</span>
                    </td>
                    <td className="p-3">
                      <span className="badge bg-purple-500/20 text-purple-400 text-xs">{symbol.marketCap}</span>
                    </td>
                    <td className="p-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={symbol.enabled}
                          onChange={() => { /* toggle API */ }}
                          className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                        />
                        <span className={`font-medium ${symbol.enabled ? 'text-green-400' : 'text-dark-400'}`}>
                          {symbol.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {symbol.timeframes.map(tf => (
                          <span key={tf} className="badge bg-dark-700 text-dark-300 text-xs">{tf}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {symbol.alertTypes.map(type => (
                          <span key={type} className="badge bg-purple-500/20 text-purple-400 text-xs">{type}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-dark-50">{symbol.minConfidence}%</td>
                    <td className="p-3 font-mono text-dark-50">₹{symbol.lastPrice?.toLocaleString() || '-'}</td>
                    <td className="p-3">
                      <span className={`font-medium ${symbol.changePct && symbol.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {symbol.changePct && symbol.changePct >= 0 ? '+' : ''}{symbol.changePct?.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100" title="Edit"><Edit size={14} /></button>
                        <button className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100" title="Duplicate"><Copy size={14} /></button>
                        <button className="p-1.5 rounded hover:bg-red-500/10 text-red-400" title="Delete"><Trash2 size={14} /></button>
                        <button className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100" title="History"><History size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSymbols.length === 0 && (
                  <tr>
                    <td colSpan={14} className="p-12 text-center text-dark-500">
                      <Search size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-lg">No symbols found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSymbols.map((symbol) => (
              <div key={symbol.id} className={`card relative ${selectedSymbols.has(symbol.id) ? 'ring-2 ring-primary-500/50' : ''}`}>
                <div className="absolute top-3 right-3">
                  <input
                    type="checkbox"
                    checked={selectedSymbols.has(symbol.id)}
                    onChange={() => toggleSelect(symbol.id)}
                    className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-start justify-between mb-3">
                  <span className={`badge ${symbol.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {symbol.enabled ? 'Active' : 'Inactive'}
                  </span>
                  <span className="badge bg-blue-500/20 text-blue-400 text-xs">{symbol.exchange}</span>
                </div>
                <p className="font-mono font-medium text-dark-100 text-lg">{symbol.symbol}</p>
                <p className="text-dark-400 text-sm mb-3">{symbol.name}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge bg-purple-500/20 text-purple-400 text-xs">{symbol.sector}</span>
                  <span className="badge bg-amber-500/20 text-amber-400 text-xs">{symbol.marketCap}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {symbol.timeframes.map(tf => (
                    <span key={tf} className="badge bg-dark-700 text-dark-300 text-xs">{tf}</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {symbol.alertTypes.map(type => (
                    <span key={type} className="badge bg-primary-500/20 text-primary-400 text-xs">{type}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                  <span className="text-sm text-dark-400">Min Confidence: <span className="font-mono text-dark-50">{symbol.minConfidence}%</span></span>
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100" title="Edit"><Edit size={12} /></button>
                    <button className="p-1.5 rounded hover:bg-red-500/10 text-red-400" title="Delete"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
          <p className="text-sm text-dark-400">
            Showing {filteredSymbols.length} of {symbols.length} symbols
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost px-3 py-1.5 text-sm" disabled>Previous</button>
            <button className="btn-ghost px-3 py-1.5 text-sm" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}