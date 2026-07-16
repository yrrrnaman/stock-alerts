import { Home, BarChart2, ListChecks, Zap, Settings, ChevronLeft, ChevronRight, Menu, X, Moon, Sun, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/symbols', label: 'Symbols', icon: BarChart2 },
  { path: '/strategies', label: 'Strategies', icon: Zap },
  { path: '/alerts', label: 'Alerts', icon: ListChecks },
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
    document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, [theme]);

  const toggleTheme = () => {
    const themes: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system'];
    const idx = themes.indexOf(theme);
    setTheme(themes[(idx + 1) % themes.length]);
  };

  return (
    <div className="min-h-screen bg-dark-950 dark">
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-dark-900/95 border-r border-dark-700 backdrop-blur-sm transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-4 border-b border-dark-700">
            {!collapsed && (
              <NavLink to="/" className="flex items-center gap-2 font-bold text-xl text-primary-400">
                <BarChart2 size={24} />
                <span>StockAlert</span>
              </NavLink>
            )}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-400"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                      : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/50'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          <div className="p-3 border-t border-dark-700">
            {!collapsed && (
              <div className="space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' && <Moon size={20} />}
                    {theme === 'light' && <Sun size={20} />}
                    {theme === 'system' && <Monitor size={20} />}
                  </div>
                  <span className="font-medium capitalize">{theme}</span>
                </button>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800/50 transition-colors"
                >
                  {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                  {!collapsed && <span className="font-medium">Collapse</span>}
                </button>
              </div>
            )}
            {collapsed && (
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800/50 transition-colors"
                  title={theme}
                >
                  {theme === 'dark' && <Moon size={20} />}
                  {theme === 'light' && <Sun size={20} />}
                  {theme === 'system' && <Monitor size={20} />}
                </button>
                <button
                  onClick={() => setCollapsed(false)}
                  className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800/50 transition-colors"
                  title="Expand sidebar"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={`lg:pl-64 transition-all duration-300 ${collapsed ? 'lg:pl-20' : ''}`}>
        <header className="sticky top-0 z-40 h-16 bg-dark-950/80 backdrop-blur-sm border-b border-dark-700">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-800 text-dark-400"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 lg:flex-none" />
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-dark-800/50 border border-dark-700 rounded-lg text-sm text-dark-300">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live</span>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}