import { Plus, ChevronDown, ChevronUp, Edit, Trash2, Check, X, Download, RefreshCw, Search } from 'lucide-react';
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
}

const mockSymbols: Symbol[] = [
  { id: '1', symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 60 },
  { id: '2', symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h'], alertTypes: ['pattern'], minConfidence: 65 },
  { id: '3', symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', enabled: true, timeframes: ['1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 70 },
  { id: '4', symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 60 },
  { id: '5', symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h'], alertTypes: ['strategy'], minConfidence: 75 },
  { id: '6', symbol: '^NSEI', name: 'NIFTY 50 Index', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 70 },
  { id: '7', symbol: '^NSEBANK', name: 'NIFTY Bank Index', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 70 },
  { id: '8', symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy'], minConfidence: 65 },
  { id: '9', symbol: 'MARUTI.NS', name: 'Maruti Suzuki', exchange: 'NSE', enabled: true, timeframes: ['1h', '1d'], alertTypes: ['pattern'], minConfidence: 70 },
  { id: '10', symbol: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE', enabled: true, timeframes: ['15m', '1h', '1d'], alertTypes: ['pattern', 'strategy', 'breakout'], minConfidence: 75 },
];

export default function SymbolsPage() {
  const [symbols] = useState(mockSymbols);
  const [search, setSearch] = useState('');
  const [showOnlyEnabled, setShowOnlyEnabled] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Symbol; direction: 'asc' | 'desc' }>({ key: 'symbol', direction: 'asc' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredSymbols = useMemo(() => {
    return symbols
      .filter(s => {
        const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
        const matchesEnabled = !showOnlyEnabled || s.enabled;
        return matchesSearch && matchesEnabled;
      })
      .sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [symbols, search, showOnlyEnabled, sortConfig]);

  const handleSort = (key: keyof Symbol) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const startEdit = (symbol: Symbol) => {
    setEditingId(symbol.id);
  };

  const saveEdit = () => {
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleEnabled = (_id: string) => {
    // In real app, call API
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Symbols</h1>
          <p className="text-dark-400 mt-1">Manage watched symbols and their settings</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-primary gap-2">
            <Plus size={18} />
            Add Symbol
          </button>
          <button className="btn-secondary gap-2">
            <Download size={18} />
            Export
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
              placeholder="Search symbols, names..."
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 text-left text-sm font-medium text-dark-400">
                <th className="p-3 w-12"></th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('symbol')}>
                  Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('name')}>
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('exchange')}>
                  Exchange {sortConfig.key === 'exchange' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3">Status</th>
                <th className="p-3">Timeframes</th>
                <th className="p-3">Alert Types</th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('minConfidence')}>
                  Min Confidence {sortConfig.key === 'minConfidence' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredSymbols.map((symbol) => (
                <tr key={symbol.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={symbol.enabled}
                      onChange={() => toggleEnabled(symbol.id)}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="p-3 font-mono font-medium text-dark-100">{symbol.symbol}</td>
                  <td className="p-3 text-dark-300">{symbol.name}</td>
                  <td className="p-3">
                    <span className="badge bg-blue-500/20 text-blue-400">{symbol.exchange}</span>
                  </td>
                  <td className="p-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={symbol.enabled}
                        onChange={() => toggleEnabled(symbol.id)}
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
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {editingId === symbol.id ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 rounded hover:bg-green-500/10 text-green-400" title="Save"><Check size={14} /></button>
                          <button onClick={cancelEdit} className="p-1.5 rounded hover:bg-red-500/10 text-red-400" title="Cancel"><X size={14} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(symbol)} className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100" title="Edit"><Edit size={14} /></button>
                          <button className="p-1.5 rounded hover:bg-red-500/10 text-red-400" title="Delete"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSymbols.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-dark-500">
                    <Search size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No symbols found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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