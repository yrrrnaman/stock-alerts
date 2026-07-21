import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Zap, ListChecks, Briefcase, Newspaper, Calendar, LineChart, Sparkles } from 'lucide-react';

const mobileItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/symbols', label: 'Symbols', icon: BarChart2 },
  { path: '/trades', label: 'Trades', icon: Briefcase },
  { path: '/scanner', label: 'Scan', icon: Zap },
  { path: '/alerts', label: 'Alerts', icon: ListChecks },
  { path: '/analysis', label: 'Markets', icon: LineChart },
  { path: '/news', label: 'News', icon: Newspaper },
];

export default function BottomNav() {
  return (
    <>
      {/* Visible only on mobile/tablet (< lg) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-dark-700 bg-dark-900/95 backdrop-blur-md safe-area-pb">
        <div className="grid grid-cols-7 h-16">
          {mobileItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? 'text-primary-400 bg-primary-500/10'
                    : 'text-dark-400 hover:text-dark-100 active:bg-dark-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      {/* Spacer so page content doesn't get hidden behind the bottom nav on mobile */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <style>{`
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0); }
      `}</style>
    </>
  );
}