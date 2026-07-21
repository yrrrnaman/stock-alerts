import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Symbols from './pages/Symbols';
import Strategies from './pages/Strategies';
import Alerts from './pages/Alerts';
import { Tools } from './pages/Tools';
import Analysis from './pages/Analysis';
import Trades from './pages/Trades';
import Scanner from './pages/Scanner';
import Calendar from './pages/Calendar';
import News from './pages/News';
import StrategyApply from './pages/StrategyApply';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="symbols" element={<Symbols />} />
          <Route path="strategies" element={<Strategies />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="tools" element={<Tools />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="trades" element={<Trades />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="news" element={<News />} />
          <Route path="strategies/:id/apply" element={<StrategyApply />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;