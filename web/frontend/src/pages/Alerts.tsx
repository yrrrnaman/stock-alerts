import { Bell, ChevronDown, ChevronUp, Download, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import React from 'react';

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
  status: 'new' | 'acknowledged' | 'dismissed';
}

const mockAlerts: Alert[] = [
  { id: '1', symbol: 'RELIANCE.NS', pattern: 'Bullish Engulfing', timeframe: '15m', price: 2543.20, direction: 'bullish', strategy: 'bullish_engulfing_trend', timestamp: '2024-01-15 10:30:15', confidence: 87, status: 'new' },
  { id: '2', symbol: 'TCS.NS', pattern: 'Hammer', timeframe: '1h', price: 3890.50, direction: 'bullish', strategy: 'bullish_reversal', timestamp: '2024-01-15 10:15:42', confidence: 72, status: 'new' },
  { id: '3', symbol: '^NSEBANK', pattern: 'Bearish Engulfing', timeframe: '1h', price: 52180.30, direction: 'bearish', strategy: 'bearish_reversal_top', timestamp: '2024-01-15 10:02:18', confidence: 81, status: 'acknowledged' },
  { id: '4', symbol: 'INFY.NS', pattern: 'Morning Star', timeframe: '1d', price: 1520.75, direction: 'bullish', strategy: 'morning_star_reversal', timestamp: '2024-01-15 08:45:00', confidence: 69, status: 'new' },
  { id: '5', symbol: 'HDFCBANK.NS', pattern: 'Shooting Star', timeframe: '15m', price: 1645.90, direction: 'bearish', timestamp: '2024-01-15 08:30:22', confidence: 58, status: 'dismissed' },
  { id: '6', symbol: 'ICICIBANK.NS', pattern: 'Three White Soldiers', timeframe: '1h', price: 1080.45, direction: 'bullish', strategy: 'bullish_momentum', timestamp: '2024-01-15 07:55:10', confidence: 78, status: 'new' },
  { id: '7', symbol: 'BAJFINANCE.NS', pattern: 'Evening Star', timeframe: '1d', price: 7200.00, direction: 'bearish', timestamp: '2024-01-15 07:30:00', confidence: 65, status: 'acknowledged' },
  { id: '8', symbol: 'MARUTI.NS', pattern: 'Piercing Line', timeframe: '15m', price: 10500.50, direction: 'bullish', timestamp: '2024-01-15 07:15:33', confidence: 61, status: 'new' },
  { id: '9', symbol: 'ASIANPAINT.NS', pattern: 'Dark Cloud Cover', timeframe: '1h', price: 2980.25, direction: 'bearish', strategy: 'bearish_reversal_top', timestamp: '2024-01-15 06:45:00', confidence: 73, status: 'dismissed' },
  { id: '10', symbol: 'LT.NS', pattern: 'Morning Star', timeframe: '1d', price: 3200.00, direction: 'bullish', strategy: 'morning_star_reversal', timestamp: '2024-01-15 06:30:00', confidence: 82, status: 'new' },
];

const timeframes = ['All', '1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
const directions = ['All', 'Bullish', 'Bearish', 'Neutral'];
const statuses = ['All', 'New', 'Acknowledged', 'Dismissed'];

export default function AlertsPage() {
  const [alerts] = useState(mockAlerts);
  const [search, setSearch] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('All');
  const [selectedDirection, setSelectedDirection] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Alert; direction: 'asc' | 'desc' }>({ key: 'timestamp', direction: 'desc' });
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        const matchesSearch = alert.symbol.toLowerCase().includes(search.toLowerCase()) ||
          alert.pattern.toLowerCase().includes(search.toLowerCase());
        const matchesTimeframe = selectedTimeframe === 'All' || alert.timeframe === selectedTimeframe;
        const matchesDirection = selectedDirection === 'All' ||
          (selectedDirection === 'Bullish' && alert.direction === 'bullish') ||
          (selectedDirection === 'Bearish' && alert.direction === 'bearish') ||
          (selectedDirection === 'Neutral' && alert.direction === 'neutral');
        const matchesStatus = selectedStatus === 'All' || alert.status === selectedStatus.toLowerCase();
        return matchesSearch && matchesTimeframe && matchesDirection && matchesStatus;
      })
      .sort((a, b) => {
        const aVal = a[sortConfig.key] as string | number;
        const bVal = b[sortConfig.key] as string | number;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
  }, [alerts, search, selectedTimeframe, selectedDirection, selectedStatus, sortConfig]);

  const handleSort = (key: keyof Alert) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
    }
  };

  const getStatusBadge = (status: Alert['status']) => {
    switch (status) {
      case 'new':
        return <span className="badge bg-blue-500/20 text-blue-400">New</span>;
      case 'acknowledged':
        return <span className="badge bg-green-500/20 text-green-400">Acknowledged</span>;
      case 'dismissed':
        return <span className="badge bg-gray-500/20 text-gray-400">Dismissed</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">Alerts</h1>
          <p className="text-dark-400 mt-1">Manage and review pattern detection alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary gap-2">
            <Download size={18} />
            Export CSV
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
              placeholder="Search symbols, patterns..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value)}
              className="input py-2 px-3 min-w-[140px]"
            >
              {timeframes.map(tf => <option key={tf} value={tf}>{tf}</option>)}
            </select>
            <select
              value={selectedDirection}
              onChange={e => setSelectedDirection(e.target.value)}
              className="input py-2 px-3 min-w-[140px]"
            >
              {directions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="input py-2 px-3 min-w-[140px]"
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700 text-left text-sm font-medium text-dark-400">
                <th className="p-3 w-12">
                  <input
                    type="checkbox"
                    checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('symbol')}>
                  Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('pattern')}>
                  Pattern {sortConfig.key === 'pattern' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('timeframe')}>
                  Timeframe {sortConfig.key === 'timeframe' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('price')}>
                  Price {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('direction')}>
                  Direction {sortConfig.key === 'direction' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('confidence')}>
                  Confidence {sortConfig.key === 'confidence' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3">Status</th>
                <th className="p-3 cursor-pointer hover:text-dark-100" onClick={() => handleSort('timestamp')}>
                  Time {sortConfig.key === 'timestamp' && (sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                </th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredAlerts.map((alert) => (
                <React.Fragment key={alert.id}>
                  <tr className={`hover:bg-dark-800/50 transition-colors ${selectedAlerts.has(alert.id) ? 'bg-primary-500/5' : ''} ${expandedId === alert.id ? 'bg-primary-500/5' : ''}`}>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.has(alert.id)}
                        onChange={() => toggleSelect(alert.id)}
                        className="rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                    <td className="p-3 font-mono font-medium text-dark-100">{alert.symbol}</td>
                    <td className="p-3 text-dark-300">{alert.pattern}</td>
                    <td className="p-3">
                      <span className="badge bg-blue-500/20 text-blue-400">{alert.timeframe}</span>
                    </td>
                    <td className="p-3 font-mono text-dark-50">₹{alert.price.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`flex items-center gap-1 ${alert.direction === 'bullish' ? 'text-green-400' : alert.direction === 'bearish' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {alert.direction === 'bullish' && <TrendingUp size={14} />}
                        {alert.direction === 'bearish' && <TrendingDown size={14} />}
                        {alert.direction === 'neutral' && <AlertTriangle size={14} />}
                        <span className="capitalize">{alert.direction}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${alert.direction === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${alert.confidence}%` }} />
                        </div>
                        <span className="text-sm font-medium text-dark-300">{alert.confidence}%</span>
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(alert.status)}</td>
                    <td className="p-3 text-sm text-dark-400 font-mono">{alert.timestamp}</td>
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(expandedId === alert.id ? null : alert.id);
                        }}
                        className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors"
                      >
                        {expandedId === alert.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === alert.id && (
                    <tr className="bg-dark-800/50">
                      <td colSpan={11} className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-dark-500">Strategy</p>
                            <p className="font-medium text-dark-100">{alert.strategy?.replace(/_/g, ' ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-dark-500">Direction</p>
                            <p className="font-medium text-dark-100 capitalize">{alert.direction}</p>
                          </div>
                          <div>
                            <p className="text-dark-500">Confidence</p>
                            <p className="font-medium text-dark-100">{alert.confidence}%</p>
                          </div>
                          <div>
                            <p className="text-dark-500">Status</p>
                            <p className="font-medium text-dark-100">{getStatusBadge(alert.status)}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredAlerts.length === 0 && (
                <tr>
                  <td colSpan={11} className="p-12 text-center text-dark-500">
                    <Bell size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg">No alerts found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-700">
          <p className="text-sm text-dark-400">
            Showing {filteredAlerts.length} of {alerts.length} alerts
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