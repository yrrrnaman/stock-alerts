import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Component, ReactNode } from 'react';
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

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) {
    console.error('App crashed:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: '32px', color: '#f1f5f9', background: '#0f172a',
          fontFamily: 'system-ui, sans-serif', minHeight: '100vh'
        }}>
          <h1 style={{ color: '#ef4444', fontSize: '24px', marginBottom: '16px' }}>
            ⚠️ Something broke loading the app
          </h1>
          <pre style={{
            background: '#020617', padding: '16px', borderRadius: '8px',
            overflow: 'auto', fontSize: '13px', border: '1px solid #334155'
          }}>
            {this.state.error.name}: {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{
              marginTop: '16px', padding: '10px 20px',
              background: '#22c55e', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/stock-alerts">
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
    </ErrorBoundary>
  );
}

export default App;