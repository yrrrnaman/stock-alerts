import { useState, useMemo } from 'react';
import {
  Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Filter, Bell,
  TrendingUp, TrendingDown, DollarSign, Percent, Building2, Briefcase,
  FileText, Clock, Tag, ExternalLink, Star, StarOff, AlertCircle,
  CalendarDays, BarChart2, Target, Activity, Eye, Bookmark, BookmarkCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

type EventType = 'earnings' | 'dividend' | 'ipo' | 'board-meeting' | 'split' | 'bonus' | 'agm';

interface CalendarEvent {
  id: string;
  date: string;
  type: EventType;
  symbol: string;
  company: string;
  exchange: 'NSE' | 'BSE';
  detail: string;
  amount?: number;
  expected?: number;
  importance: 'high' | 'medium' | 'low';
  bookmarked?: boolean;
}

const monthEvents: Record<string, CalendarEvent[]> = {
  '21': [
    { id: '1', date: '21 Jul', type: 'earnings', symbol: 'TCS', company: 'Tata Consultancy Services', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 11.85, importance: 'high' },
    { id: '2', date: '21 Jul', type: 'dividend', symbol: 'COALINDIA', company: 'Coal India', exchange: 'NSE', detail: 'Final Dividend ₹5/share', amount: 5, importance: 'medium' },
    { id: '3', date: '21 Jul', type: 'board-meeting', symbol: 'RELIANCE', company: 'Reliance Industries', exchange: 'NSE', detail: 'Q1 Results + Fund Raise', importance: 'high' },
    { id: '4', date: '21 Jul', type: 'earnings', symbol: 'HDFCBANK', company: 'HDFC Bank', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 22.40, importance: 'high' },
  ],
  '22': [
    { id: '5', date: '22 Jul', type: 'earnings', symbol: 'INFY', company: 'Infosys', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 14.20, importance: 'high' },
    { id: '6', date: '22 Jul', type: 'ipo', symbol: 'OYO', company: 'Oravel Stays Ltd', exchange: 'BSE', detail: 'IPO Subscription Open', amount: 4200, importance: 'medium' },
    { id: '7', date: '22 Jul', type: 'dividend', symbol: 'SBIN', company: 'State Bank of India', exchange: 'NSE', detail: 'Dividend ₹7.10/share', amount: 7.10, importance: 'medium' },
  ],
  '23': [
    { id: '8', date: '23 Jul', type: 'earnings', symbol: 'WIPRO', company: 'Wipro', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 5.20, importance: 'medium' },
    { id: '9', date: '23 Jul', type: 'bonus', symbol: 'TATASTEEL', company: 'Tata Steel', exchange: 'NSE', detail: 'Bonus Issue 1:2 Ratio', importance: 'low' },
    { id: '10', date: '23 Jul', type: 'agm', symbol: 'MARUTI', company: 'Maruti Suzuki', exchange: 'NSE', detail: 'Annual General Meeting', importance: 'low' },
  ],
  '24': [
    { id: '11', date: '24 Jul', type: 'earnings', symbol: 'HINDUNILVR', company: 'Hindustan Unilever', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 10.10, importance: 'high' },
    { id: '12', date: '24 Jul', type: 'earnings', symbol: 'ASIANPAINT', company: 'Asian Paints', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 14.80, importance: 'medium' },
    { id: '13', date: '24 Jul', type: 'board-meeting', symbol: 'ICICIBANK', company: 'ICICI Bank', exchange: 'NSE', detail: 'Q1 Results + Dividend', importance: 'high' },
  ],
  '25': [
    { id: '14', date: '25 Jul', type: 'earnings', symbol: 'BAJFINANCE', company: 'Bajaj Finance', exchange: 'NSE', detail: 'Q1 FY27 Results', expected: 28.50, importance: 'high' },
    { id: '15', date: '25 Jul', type: 'dividend', symbol: 'TCS', company: 'Tata Consultancy', exchange: 'NSE', detail: 'Interim Dividend ₹9/share', amount: 9, importance: 'medium' },
    { id: '16', date: '25 Jul', type: 'split', symbol: 'ADANIENT', company: 'Adani Enterprises', exchange: 'NSE', detail: 'Stock Split 5:1', importance: 'medium' },
  ],
};

const typeMeta: Record<EventType, { label: string; color: string; icon: React.ComponentType<any> }> = {
  earnings: { label: 'Earnings', color: 'bg-primary-500/20 text-primary-400 border-primary-500/30', icon: BarChart2 },
  dividend: { label: 'Dividend', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: DollarSign },
  ipo: { label: 'IPO', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: TrendingUp },
  'board-meeting': { label: 'Board Meeting', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Building2 },
  split: { label: 'Stock Split', color: 'bg-accent-500/20 text-accent-400 border-accent-500/30', icon: Target },
  bonus: { label: 'Bonus Issue', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Plus },
  agm: { label: 'AGM/EGM', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: FileText },
};

const importanceDot = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500' };

export default function CalendarPage() {
  const [view, setView] = useState<'month' | 'list' | 'week'>('week');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');
  const [importanceFilter, setImportanceFilter] = useState<string>('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(['1', '5']));

  const today = '21';
  const days = ['19', '20', '21', '22', '23', '24', '25'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const allEvents = useMemo(() => Object.entries(monthEvents).flatMap(([day, evts]) =>
    evts.map(e => ({ ...e, day }))
  ), []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e =>
      (typeFilter === 'all' || e.type === typeFilter) &&
      (importanceFilter === 'all' || e.importance === importanceFilter)
    );
  }, [allEvents, typeFilter, importanceFilter]);

  const counts = useMemo(() => {
    const c: Record<EventType, number> = { earnings: 0, dividend: 0, ipo: 0, 'board-meeting': 0, split: 0, bonus: 0, agm: 0 };
    allEvents.forEach(e => c[e.type]++);
    return c;
  }, [allEvents]);

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    toast.success(bookmarks.has(id) ? 'Removed bookmark' : 'Bookmarked');
  };

  const renderWeekView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
      {days.map((day, i) => {
        const isToday = day === today;
        const dayEvents = monthEvents[day] || [];
        return (
          <div key={day} className={`card p-3 min-h-[280px] flex flex-col ${isToday ? 'border-primary-500/50 bg-primary-500/5' : ''}`}>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-dark-700">
              <div>
                <p className="text-xs text-dark-400">{dayNames[i]}</p>
                <p className={`text-xl font-bold ${isToday ? 'text-primary-400' : 'text-dark-100'}`}>{day}</p>
              </div>
              {isToday && <span className="badge bg-primary-500/20 text-primary-400 text-xs">Today</span>}
              <p className="text-xs text-dark-500">Jul</p>
            </div>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {dayEvents.map(e => {
                const Meta = typeMeta[e.type];
                const Icon = Meta.icon;
                return (
                  <div key={e.id} className={`p-2 rounded-lg border ${Meta.color} cursor-pointer hover:scale-[1.02] transition-transform`} onClick={() => toast(`Loading ${e.symbol} event details...`)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Icon size={11} />
                        <span className="font-mono font-bold text-xs">{e.symbol}</span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${importanceDot[e.importance]}`} title={`${e.importance} importance`} />
                    </div>
                    <p className="text-xs text-dark-200 line-clamp-2 leading-tight">{e.detail}</p>
                    {e.expected && <p className="text-xs text-dark-400 mt-1">EPS Est: ₹{e.expected}</p>}
                  </div>
                );
              })}
              {dayEvents.length === 0 && <p className="text-xs text-dark-600 italic text-center py-4">No events</p>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredEvents.map(e => {
        const Meta = typeMeta[e.type];
        const Icon = Meta.icon;
        return (
          <div key={e.id} className="card p-4 hover:border-primary-500/40 transition-all">
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-xl ${Meta.color.split(' ').slice(0, 2).join(' ')}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono font-bold text-dark-100">{e.symbol}</span>
                  <span className="badge bg-dark-700 text-dark-300 text-xs">{e.exchange}</span>
                  <span className={`badge text-xs ${Meta.color.split(' ').slice(0, 2).join(' ')}`}>{Meta.label}</span>
                  <span className="badge bg-dark-700 text-dark-300 text-xs">{e.date}</span>
                  <span className={`w-2 h-2 rounded-full ${importanceDot[e.importance]}`} />
                </div>
                <p className="text-sm font-medium text-dark-200">{e.detail}</p>
                <p className="text-xs text-dark-500 mt-0.5">{e.company}</p>
                {e.expected && <p className="text-xs text-dark-400 mt-1">Expected EPS: <span className="font-mono text-dark-200">₹{e.expected}</span></p>}
                {e.amount && <p className="text-xs text-dark-400 mt-1">Amount: <span className="font-mono text-green-400">₹{e.amount}/share</span></p>}
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={(ev) => { ev.stopPropagation(); toggleBookmark(e.id); }} className={`p-2 rounded-lg transition-colors ${bookmarks.has(e.id) ? 'text-accent-400 bg-accent-500/10' : 'text-dark-400 hover:bg-dark-700'}`}>
                  {bookmarks.has(e.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                </button>
                <button onClick={() => toast.success(`Reminder set for ${e.symbol} on ${e.date}`)} className="p-2 rounded-lg text-dark-400 hover:bg-dark-700 transition-colors" title="Set reminder">
                  <Bell size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {filteredEvents.length === 0 && (
        <div className="card p-12 text-center text-dark-500"><CalIcon size={36} className="mx-auto mb-3 opacity-30" /><p>No events match the filter</p></div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <CalIcon size={24} className="text-white" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold gradient-text">Market Calendar</div>
              <p className="text-dark-400 text-sm mt-1">Earnings, dividends, IPOs, board meetings & more</p>
            </div>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="card p-1 inline-flex">
            {(['week', 'month', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 rounded text-sm font-medium capitalize ${view === v ? 'bg-primary-500/20 text-primary-400' : 'text-dark-400 hover:text-dark-100'}`}>{v}</button>
            ))}
          </div>
          <button className="btn-secondary gap-2"><ChevronLeft size={16} /><span className="hidden sm:inline">Prev</span></button>
          <button className="btn-secondary gap-2"><ChevronRight size={16} /><span className="hidden sm:inline">Next</span></button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {(['earnings', 'dividend', 'ipo', 'board-meeting', 'split', 'bonus', 'agm'] as EventType[]).map(t => {
          const Meta = typeMeta[t];
          const Icon = Meta.icon;
          return (
            <button key={t} onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)} className={`card p-3 text-left transition-all ${typeFilter === t ? 'ring-2 ring-primary-500/50' : ''}`}>
              <div className="flex items-center justify-between mb-1">
                <Icon size={16} className="text-primary-400" />
                <span className="text-xl font-bold text-dark-100">{counts[t]}</span>
              </div>
              <p className="text-xs text-dark-400">{Meta.label}</p>
            </button>
          );
        })}
      </div>

      <div className="card p-3 flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-dark-400" />
        <span className="text-sm text-dark-300">Importance:</span>
        {['all', 'high', 'medium', 'low'].map(i => (
          <button key={i} onClick={() => setImportanceFilter(i)} className={`px-3 py-1 rounded text-xs font-medium capitalize ${importanceFilter === i ? 'bg-primary-500/20 text-primary-400' : 'bg-dark-800 text-dark-400 hover:bg-dark-700'}`}>{i}</button>
        ))}
      </div>

      {view === 'week' && renderWeekView()}
      {view === 'list' && renderListView()}
      {view === 'month' && (
        <div className="card p-6">
          <p className="text-center text-dark-500 py-12">Month view coming soon — week and list views available now</p>
        </div>
      )}

      <div className="card p-5 border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary-500/10"><AlertCircle size={20} className="text-primary-400" /></div>
          <div>
            <h4 className="font-semibold text-dark-50 mb-1">Upcoming High-Impact Events</h4>
            <p className="text-sm text-dark-300 mb-3">Earnings season is here. Watch these major names reporting this week:</p>
            <div className="flex flex-wrap gap-2">
              {['TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'BAJFINANCE', 'RELIANCE'].map(s => (
                <span key={s} className="badge bg-primary-500/20 text-primary-400">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}