import {
  LayoutDashboard, BarChart2, ListChecks, Zap, Settings, ChevronLeft, ChevronRight,
  Menu, X, Moon, Sun, Monitor, Sparkles, LineChart, Briefcase, Newspaper, CalendarDays, ScanSearch
} from 'lucide-react';
import BottomNav from './BottomNav';
import { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/symbols', label: 'Symbols', icon: BarChart2 },
  { path: '/trades', label: 'Trades', icon: Briefcase },
  { path: '/strategies', label: 'Strategies', icon: Zap },
  { path: '/scanner', label: 'Scanner', icon: ScanSearch },
  { path: '/alerts', label: 'Alerts', icon: ListChecks },
  { path: '/tools', label: 'Tools', icon: Sparkles },
  { path: '/analysis', label: 'Analysis', icon: LineChart },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setCollapsed(JSON.parse(saved));
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setTheme(savedTheme as any);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [theme]);

  const toggleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <div className="min-h-screen bg-light-50 dark:bg-dark-950 transition-colors duration-200">
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-white dark:bg-dark-900/95 border-r border-light-300 dark:border-dark-700 backdrop-blur-sm transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-light-300 dark:border-dark-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg text-primary-500 dark:text-primary-400">
                <Zap size={20} />
              </div>
              {!collapsed && <span className="font-bold text-light-900 dark:text-dark-50 text-lg">StockAlerts</span>}
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded hover:bg-light-200 dark:hover:bg-dark-800 text-light-500 dark:text-dark-400">
              <X size={20} />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400 font-semibold'
                      : 'text-light-600 dark:text-dark-400 hover:bg-light-200 dark:hover:bg-dark-800 hover:text-light-900 dark:hover:text-dark-100'
                  } ${collapsed ? 'justify-center' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-light-300 dark:border-dark-700">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-light-200 dark:hover:bg-dark-800 text-light-500 dark:text-dark-400 hover:text-light-900 dark:hover:text-dark-100 transition-colors"
                title={`Theme: ${theme}`}
              >
                {theme === 'dark' ? <Moon size={20} /> : theme === 'light' ? <Sun size={20} /> : <Monitor size={20} />}
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded-lg hover:bg-light-200 dark:hover:bg-dark-800 text-light-500 dark:text-dark-400 hover:text-light-900 dark:hover:text-dark-100 transition-colors"
              >
                {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          </div>
        </div>
      </aside>
      <div className={`lg:ml-64 transition-all duration-300 ${collapsed ? 'lg:ml-20' : ''}`}>
        <header className="sticky top-0 z-40 h-16 bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm border-b border-light-300 dark:border-dark-700">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded hover:bg-light-200 dark:hover:bg-dark-800 text-light-500 dark:text-dark-400">
              <Menu size={24} />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-light-100 dark:bg-dark-800/50 rounded-lg border border-light-300 dark:border-dark-700 text-sm text-light-600 dark:text-dark-400">
                <span id="clock" className="font-mono tabular-nums"></span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <BottomNav />
    </div>
  );
}