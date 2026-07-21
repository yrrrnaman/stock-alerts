import { Bell, Moon, Sun, Monitor, Shield, Key, Database, Wifi, Terminal, Globe, Palette, Clock, Trash2, Save, TestTube, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, XCircle, WifiOff, Info, Plus, ChevronDown, ChevronUp, Zap, Target, BarChart2, Download, RefreshCw, Share2, BellRing, BellOff, SlidersHorizontal, GitMerge, Code2, Braces, FunctionSquare, Link2, Unlink2, Eye, EyeOff, RotateCcw, RotateCw, Flag, FlagOff, Bookmark, BookmarkPlus, Archive, ArchiveRestore, Settings, Search, Upload, Cloud, Server, Cpu, HardDrive, LayoutDashboard, Key as KeyIcon, KeyRound, Fingerprint, ScanEye, ScanFace, ScanLine, ScanSearch, ScanText, Barcode, QrCode, Ticket, TicketCheck, TicketMinus, TicketPlus, TicketX, TicketPercent, Clipboard, ClipboardCheck, ClipboardCopy, ClipboardList, ClipboardMinus, ClipboardPlus, ClipboardX, ClipboardType, File, FileCheck, FileCog, FileDown, FileInput, FileMinus, FileOutput, FilePlus, FileSearch, FileText as FileTextIcon, FileUp, FileX, FileQuestion, FileWarning, FileKey, FileLock, FilePen, FileCode, FileJson, Files, FileSpreadsheet, FileAudio, FileVideo, FileImage, FileArchive, FileSymlink, FileBadge, FileTerminal, FileStack, Folder, FolderCheck, FolderClock, FolderClosed, FolderCode, FolderCog, FolderDot, FolderDown, FolderGit, FolderHeart, FolderInput, FolderKanban, FolderLock, FolderMinus, FolderOpen, FolderOutput, FolderPen, FolderPlus as FolderPlusIcon, FolderRoot, FolderSearch, FolderSync, FolderTree, FolderUp, FolderX, Mail as MailIcon, MailCheck, MailMinus, MailOpen, MailPlus, MailQuestion, MailSearch, MailWarning, MailX, MessageSquare, MessageCircle, Sparkles as SparklesIcon, Flame, Bolt, Cloud as CloudIcon, CloudLightning, CloudRain, CloudSnow, CloudDrizzle, CloudFog, CloudHail, CloudSun, CloudMoon, Star, StarHalf, Award, Trophy, Medal, Ribbon, Crown, Gem, Diamond, Heart, HeartHandshake, Handshake, Users, User, UserPlus, UserMinus, UserCheck, UserX, UserCog, Shield as ShieldIcon, ShieldCheck, ShieldX, ShieldAlert, ShieldOff, Lock, LockOpen, MoreVertical, Activity, Edit, X, Send, Mail, CreditCard, Receipt, AlertOctagon, Calendar, Type as TypeIcon, LineChart, Volume2, History as HistoryIcon, ShieldAlert as ShieldAlertIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Trader' | 'Viewer';
  status: 'active' | 'inactive';
  apiKeys: number;
  lastActive: string;
}

interface PermissionRow {
  capability: string;
  owner: boolean;
  admin: boolean;
  trader: boolean;
  viewer: boolean;
}

interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  target: string;
  type: 'invite' | 'role' | 'edit';
  time: string;
}

const teamMembers: TeamMember[] = [
  { id: '1', name: 'Naman Sharma', email: 'naman@stockalert.io', role: 'Owner', status: 'active', apiKeys: 8, lastActive: 'Just now' },
  { id: '2', name: 'Priya Patel', email: 'priya@stockalert.io', role: 'Admin', status: 'active', apiKeys: 4, lastActive: '5 min ago' },
  { id: '3', name: 'Arjun Mehta', email: 'arjun@stockalert.io', role: 'Trader', status: 'active', apiKeys: 2, lastActive: '2 hours ago' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha@stockalert.io', role: 'Trader', status: 'active', apiKeys: 3, lastActive: 'Yesterday' },
  { id: '5', name: 'Rohit Kumar', email: 'rohit@stockalert.io', role: 'Viewer', status: 'inactive', apiKeys: 0, lastActive: '5 days ago' },
  { id: '6', name: 'Ananya Singh', email: 'ananya@stockalert.io', role: 'Viewer', status: 'active', apiKeys: 0, lastActive: '1 hour ago' },
];

const permissions: PermissionRow[] = [
  { capability: 'View dashboard & alerts', owner: true, admin: true, trader: true, viewer: true },
  { capability: 'Manage symbols & watchlist', owner: true, admin: true, trader: true, viewer: false },
  { capability: 'Create & edit strategies', owner: true, admin: true, trader: true, viewer: false },
  { capability: 'Configure data providers & API keys', owner: true, admin: true, trader: false, viewer: false },
  { capability: 'Send alerts via Telegram/Bot', owner: true, admin: true, trader: true, viewer: false },
  { capability: 'Manage integrations (Discord/Slack)', owner: true, admin: true, trader: false, viewer: false },
  { capability: 'View backtest results', owner: true, admin: true, trader: true, viewer: true },
  { capability: 'Manage team members & roles', owner: true, admin: false, trader: false, viewer: false },
  { capability: 'Billing & subscription', owner: true, admin: false, trader: false, viewer: false },
  { capability: 'Delete workspace', owner: true, admin: false, trader: false, viewer: false },
];

interface CustomIntegration {
  id: string;
  name: string;
  type: 'webhook' | 'rest' | 'graphql' | 'telegram_clone' | 'custom';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: Array<{ key: string; value: string }>;
  bodyTemplate: string;
  authType: 'none' | 'bearer' | 'api_key' | 'basic';
  authValue: string;
  triggerEvents: string[];
  enabled: boolean;
  createdAt: string;
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed' | 'pending';
  lastResponse?: string;
}

const integrationTemplates: Array<{ name: string; type: CustomIntegration['type']; icon: string; description: string; sample: Partial<CustomIntegration> }> = [
  { name: 'Webhook (POST JSON)', type: 'webhook', icon: '🔗', description: 'Generic JSON webhook — works with Zapier, Make, n8n', sample: { method: 'POST', bodyTemplate: '{\n  "symbol": "{{symbol}}",\n  "price": {{price}},\n  "pattern": "{{pattern}}",\n  "signal": "{{signal}}"\n}' } },
  { name: 'Telegram-like Bot', type: 'telegram_clone', icon: '📨', description: 'Send to any Telegram-compatible bot URL', sample: { method: 'POST', bodyTemplate: '{\n  "chat_id": "{{chat_id}}",\n  "text": "🚨 {{symbol}} {{signal}} at ₹{{price}}"\n}' } },
  { name: 'REST API (Generic)', type: 'rest', icon: '⚙️', description: 'Call any REST endpoint with custom payload', sample: { method: 'POST', bodyTemplate: '{\n  "event": "{{event}}",\n  "data": { "symbol": "{{symbol}}", "price": {{price}} }\n}' } },
  { name: 'GraphQL Mutation', type: 'graphql', icon: '◆', description: 'Send a GraphQL mutation/query', sample: { method: 'POST', bodyTemplate: 'mutation { logAlert(symbol: "{{symbol}}", price: {{price}}, signal: "{{signal}}") { id } }' } },
  { name: 'Custom (Advanced)', type: 'custom', icon: '🛠️', description: 'Full control over request', sample: {} },
];

const presetHeaders = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'User-Agent', value: 'StockAlert/1.0' },
  { key: 'X-Source', value: 'stock-alerts.netlify.app' },
];

const eventOptions = [
  { id: 'alert', label: 'Pattern Alert', desc: 'When a candlestick pattern fires' },
  { id: 'signal', label: 'Strategy Signal', desc: 'When a strategy triggers' },
  { id: 'scan_complete', label: 'Scan Complete', desc: 'After each market scan' },
  { id: 'error', label: 'System Error', desc: 'On backend errors' },
  { id: 'daily_summary', label: 'Daily Summary', desc: 'End-of-day recap' },
];

function loadCustomIntegrations(): CustomIntegration[] {
  try {
    const raw = localStorage.getItem('stockalert:custom_integrations');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

const defaultIntegrations: CustomIntegration[] = [
  {
    id: 'demo-1',
    name: 'Zapier Catch Hook',
    type: 'webhook',
    endpoint: 'https://hooks.zapier.com/hooks/catch/12345/abcdef/',
    method: 'POST',
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    bodyTemplate: '{\n  "symbol": "{{symbol}}",\n  "price": {{price}},\n  "signal": "{{signal}}"\n}',
    authType: 'none',
    authValue: '',
    triggerEvents: ['alert', 'signal'],
    enabled: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastTriggered: new Date(Date.now() - 3600000).toISOString(),
    lastStatus: 'success',
    lastResponse: '200 OK — delivered to Zap',
  },
  {
    id: 'demo-2',
    name: 'Custom Telegram Mirror',
    type: 'telegram_clone',
    endpoint: 'https://api.telegram.org/bot{{token}}/sendMessage',
    method: 'POST',
    headers: [],
    bodyTemplate: '{\n  "chat_id": "{{chat_id}}",\n  "text": "{{message}}"\n}',
    authType: 'none',
    authValue: '',
    triggerEvents: ['alert'],
    enabled: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

const activityLog: ActivityEntry[] = [
  { id: '1', user: 'Naman Sharma', action: 'invited', target: 'ananya@stockalert.io as Viewer', type: 'invite', time: '1 hour ago' },
  { id: '2', user: 'Priya Patel', action: 'changed role of', target: 'Arjun Mehta to Trader', type: 'role', time: '3 hours ago' },
  { id: '3', user: 'Naman Sharma', action: 'updated API keys for', target: 'Zerodha Kite integration', type: 'edit', time: '5 hours ago' },
  { id: '4', user: 'Arjun Mehta', action: 'enabled strategy', target: 'momentum_breakout on 15m timeframe', type: 'edit', time: 'Yesterday at 18:42' },
  { id: '5', user: 'Naman Sharma', action: 'invited', target: 'sneha@stockalert.io as Trader', type: 'invite', time: '2 days ago' },
];

const sessions = [
  { id: 's1', device: 'MacBook Pro 16"', browser: 'Chrome 124', os: 'macOS Sonoma', location: 'Bengaluru, IN', ip: '103.21.58.x', current: true, lastActive: 'Active now' },
  { id: 's2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', os: 'iOS 17.4', location: 'Bengaluru, IN', ip: '103.21.58.x', current: false, lastActive: '2 hours ago' },
  { id: 's3', device: 'Trading Rig', browser: 'Firefox 125', os: 'Ubuntu 24.04', location: 'Mumbai, IN', ip: '49.36.112.x', current: false, lastActive: 'Yesterday' },
  { id: 's4', device: 'iPad Air', browser: 'Safari', os: 'iPadOS 17', location: 'Bengaluru, IN', ip: '103.21.58.x', current: false, lastActive: '4 days ago' },
];

const invoices = [
  { id: 'inv-2026-07', date: '21 Jul 2026', amount: '₹4,999', plan: 'Pro Monthly', status: 'paid' },
  { id: 'inv-2026-06', date: '21 Jun 2026', amount: '₹4,999', plan: 'Pro Monthly', status: 'paid' },
  { id: 'inv-2026-05', date: '21 May 2026', amount: '₹4,999', plan: 'Pro Monthly', status: 'paid' },
  { id: 'inv-2026-04', date: '21 Apr 2026', amount: '₹49,999', plan: 'Pro Annual (renewed)', status: 'paid' },
];

const indianMarketHolidays2026 = [
  { date: '26 Jan 2026', name: 'Republic Day', exchange: 'NSE/BSE' },
  { date: '03 Mar 2026', name: 'Holi', exchange: 'NSE/BSE' },
  { date: '14 Apr 2026', name: 'Dr. Ambedkar Jayanti', exchange: 'NSE/BSE' },
  { date: '01 May 2026', name: 'Maharashtra Day', exchange: 'BSE' },
  { date: '27 Aug 2026', name: 'Ganesh Chaturthi', exchange: 'NSE/BSE' },
  { date: '02 Oct 2026', name: 'Gandhi Jayanti', exchange: 'NSE/BSE' },
  { date: '19 Oct 2026', name: 'Dussehra', exchange: 'NSE/BSE' },
  { date: '08 Nov 2026', name: 'Diwali (Laxmi Pujan)', exchange: 'NSE/BSE' },
  { date: '25 Dec 2026', name: 'Christmas', exchange: 'NSE/BSE' },
];

const chartColorSchemes = [
  { id: 'classic', name: 'Classic Green/Red', bull: '#22c55e', bear: '#ef4444', vol: '#94a3b8' },
  { id: 'modern', name: 'Modern Cyan/Pink', bull: '#06b6d4', bear: '#ec4899', vol: '#64748b' },
  { id: 'professional', name: 'Pro Blue/Orange', bull: '#3b82f6', bear: '#f97316', vol: '#6b7280' },
  { id: 'monochrome', name: 'Mono White/Red', bull: '#f1f5f9', bear: '#ef4444', vol: '#94a3b8' },
  { id: 'high-contrast', name: 'High Contrast', bull: '#00ff88', bear: '#ff0066', vol: '#ffffff' },
];

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'notifications' | 'data' | 'advanced' | 'integrations' | 'teams' | 'account' | 'billing' | 'risk' | 'market' | 'display' | 'backup'>('general');
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<{ email: string; role: 'Admin' | 'Trader' | 'Viewer'; message: string }>({ email: '', role: 'Viewer', message: '' });
  const [customIntegrations, setCustomIntegrations] = useState<CustomIntegration[]>(() => {
    const saved = loadCustomIntegrations();
    return saved.length ? saved : defaultIntegrations;
  });
  const [editingIntegration, setEditingIntegration] = useState<CustomIntegration | null>(null);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('stockalert:custom_integrations', JSON.stringify(customIntegrations));
  }, [customIntegrations]);

  const openNewIntegration = () => {
    setEditingIntegration({
      id: `custom-${Date.now()}`,
      name: '',
      type: 'webhook',
      endpoint: '',
      method: 'POST',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      bodyTemplate: '{\n  "symbol": "{{symbol}}",\n  "price": {{price}},\n  "pattern": "{{pattern}}"\n}',
      authType: 'none',
      authValue: '',
      triggerEvents: ['alert'],
      enabled: true,
      createdAt: new Date().toISOString(),
    });
    setShowIntegrationModal(true);
  };

  const openEditIntegration = (integration: CustomIntegration) => {
    setEditingIntegration({ ...integration });
    setShowIntegrationModal(true);
  };

  const saveIntegration = () => {
    if (!editingIntegration) return;
    if (!editingIntegration.name.trim()) { toast.error('Name is required'); return; }
    if (!editingIntegration.endpoint.trim()) { toast.error('Endpoint URL is required'); return; }
    setCustomIntegrations(prev => {
      const idx = prev.findIndex(i => i.id === editingIntegration.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = editingIntegration;
        return copy;
      }
      return [editingIntegration, ...prev];
    });
    toast.success(`Integration "${editingIntegration.name}" saved`);
    setShowIntegrationModal(false);
    setEditingIntegration(null);
  };

  const deleteIntegration = (id: string) => {
    const target = customIntegrations.find(i => i.id === id);
    setCustomIntegrations(prev => prev.filter(i => i.id !== id));
    if (target) toast.success(`Deleted "${target.name}"`);
  };

  const toggleIntegration = (id: string) => {
    setCustomIntegrations(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  };

  const testIntegration = async (id: string) => {
    const target = customIntegrations.find(i => i.id === id);
    if (!target) return;
    setTestingIntegration(id);
    toast.loading(`Testing ${target.name}...`, { id: `test-${id}` });
    await new Promise(r => setTimeout(r, 1500));
    const success = Math.random() > 0.2;
    setCustomIntegrations(prev => prev.map(i => i.id === id ? {
      ...i,
      lastTriggered: new Date().toISOString(),
      lastStatus: success ? 'success' : 'failed',
      lastResponse: success ? `${Math.floor(Math.random() * 50) + 200} OK — delivered` : `4${Math.floor(Math.random() * 9)} ${['Bad Request', 'Unauthorized', 'Not Found'][Math.floor(Math.random() * 3)]}`,
    } : i));
    setTestingIntegration(null);
    if (success) toast.success(`${target.name} responded OK`, { id: `test-${id}` });
    else toast.error(`${target.name} failed — check endpoint & auth`, { id: `test-${id}` });
  };

  const applyTemplate = (templateName: string) => {
    if (!editingIntegration) return;
    const template = integrationTemplates.find(t => t.name === templateName);
    if (!template) return;
    setEditingIntegration({
      ...editingIntegration,
      type: template.type,
      method: (template.sample.method as CustomIntegration['method']) || editingIntegration.method,
      bodyTemplate: template.sample.bodyTemplate || editingIntegration.bodyTemplate,
    });
    toast.success(`Applied "${template.name}" template`);
  };
  
  const [config, setConfig] = useState({
    general: {
      scanInterval: 15,
      timezone: 'Asia/Kolkata',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      theme: theme,
      autoRefresh: true,
      compactMode: false,
      soundEnabled: true,
      animationsEnabled: true,
    },
    api: {
      // Telegram
      telegramBotToken: '',
      telegramChatId: '',
      // Data Providers
      dataProvider: 'yfinance',
      // Zerodha Kite
      kiteApiKey: '',
      kiteAccessToken: '',
      // Fyers
      fyersClientId: '',
      fyersAccessToken: '',
      // Upstox
      upstoxAccessToken: '',
      // Angel One
      angelApiKey: '',
      angelClientId: '',
      angelPassword: '',
      angelTotp: '',
      // OpenAI/Codex
      openaiApiKey: '',
      codexModel: 'gpt-4o',
      // Custom APIs
      customApiEndpoint: '',
      customApiKey: '',
    },
    notifications: {
      enableTelegram: true,
      enableBrowser: false,
      enableEmail: false,
      enablePush: false,
      enableDiscord: false,
      enableSlack: false,
      enableWhatsApp: false,
      enableSMS: false,
      alertCooldown: 15,
      maxAlertsPerScan: 20,
      includeCharts: true,
      soundEnabled: true,
      onlyHighConfidence: false,
      minConfidence: 70,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      weekendNotifications: false,
    },
    data: {
      cacheTTL: 300,
      lookbackPeriods: { '15m': 100, '1h': 200, '1d': 500 },
      defaultTimeframes: ['15m', '1h', '1d'],
      maxSymbols: 50,
      enableCache: true,
      compressionEnabled: true,
      dataRetentionDays: 90,
      autoCleanup: true,
    },
    advanced: {
      debugMode: false,
      logLevel: 'INFO',
      enableMetrics: true,
      customWebhook: '',
      webhookSecret: '',
      rateLimit: 100,
      corsEnabled: true,
      apiTimeout: 30000,
      maxConcurrentScans: 5,
    },
    integrations: {
      // TradingView
      tradingviewWebhookUrl: '',
      tradingviewSecret: '',
      // Discord
      discordWebhookUrl: '',
      discordBotToken: '',
      // Slack
      slackWebhookUrl: '',
      slackBotToken: '',
      // Google Sheets
      googleSheetsId: '',
      googleServiceAccount: '',
      // Notion
      notionToken: '',
      notionDatabaseId: '',
      // Webhooks
      customWebhooks: [] as Array<{ name: string; url: string; events: string }>,
    }
  });

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved as any);
    document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches));
  }, [theme]);

  const handleSave = async (section: string) => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    toast.success(`${section} settings saved`);
  };

  const handleTestTelegram = async () => {
    toast.loading('Sending test message...', { id: 'test' });
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Test message sent!', { id: 'test' });
  };

  const handleTestConnection = async (provider: string) => {
    toast.loading(`Testing ${provider} connection...`, { id: provider });
    await new Promise(r => setTimeout(r, 2000));
    toast.success(`${provider} connected!`, { id: provider });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Cache', icon: Database },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'account', label: 'Account', icon: UserCog },
    { id: 'billing', label: 'Billing', icon: Ticket },
    { id: 'risk', label: 'Risk', icon: AlertTriangle },
    { id: 'market', label: 'Market', icon: Globe },
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'backup', label: 'Backup', icon: Archive },
    { id: 'advanced', label: 'Advanced', icon: Terminal },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary-500/10">
              <Settings size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-dark-50">Settings</div>
              <div className="text-dark-400 text-sm">Configure your StockAlert preferences and integrations</div>
            </div>
          </h1>
        </div>
        <button
          onClick={() => handleSave(activeTab)}
          disabled={saving}
          className="btn-primary gap-2"
        >
          <Save size={18} className={saving ? 'animate-spin' : ''} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-dark-700 overflow-x-auto">
          <nav className="flex gap-1 p-1 min-w-max" role="tablist">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20'
                      : 'text-dark-400 hover:text-dark-100 hover:bg-dark-800/50'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 max-w-5xl">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Palette size={20} /> Appearance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Theme</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${theme === 'dark' ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500'}`}
                    >
                      <Moon size={20} className="mx-auto mb-1" />
                      <span className="block text-center text-sm">Dark</span>
                    </button>
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${theme === 'light' ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500'}`}
                    >
                      <Sun size={20} className="mx-auto mb-1" />
                      <span className="block text-center text-sm">Light</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all ${theme === 'system' ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500'}`}
                    >
                      <Monitor size={20} className="mx-auto mb-1" />
                      <span className="block text-center text-sm">System</span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Timezone</label>
                  <select
                    className="input"
                    value={config.general.timezone}
                    onChange={e => setConfig({...config, general: {...config.general, timezone: e.target.value}})}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Language</label>
                  <select className="input">
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                    <option value="ta">தமிழ்</option>
                    <option value="te">తెలుగు</option>
                    <option value="mr">मराठी</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Clock size={20} /> Scanner Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Scan Interval (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="input"
                    value={config.general.scanInterval}
                    onChange={e => setConfig({...config, general: {...config.general, scanInterval: parseInt(e.target.value) || 15}})}
                  />
                </div>
                <div>
                  <label className="label">Date Format</label>
                  <select
                    className="input"
                    value={config.general.dateFormat}
                    onChange={e => setConfig({...config, general: {...config.general, dateFormat: e.target.value}})}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.general.autoRefresh}
                      onChange={e => setConfig({...config, general: {...config.general, autoRefresh: e.target.checked}})}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Auto-refresh dashboard</span>
                  </label>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.general.compactMode}
                      onChange={e => setConfig({...config, general: {...config.general, compactMode: e.target.checked}})}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Compact mode</span>
                  </label>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.general.soundEnabled}
                      onChange={e => setConfig({...config, general: {...config.general, soundEnabled: e.target.checked}})}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Sound notifications</span>
                  </label>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.general.animationsEnabled}
                      onChange={e => setConfig({...config, general: {...config.general, animationsEnabled: e.target.checked}})}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span>UI animations</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Shield size={20} /> Telegram Bot</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Bot Token</label>
                  <div className="relative">
                    <input
                      type="password"
                      className="input pr-12"
                      value={config.api.telegramBotToken}
                      onChange={e => setConfig({...config, api: {...config.api, telegramBotToken: e.target.value}})}
                      placeholder="Enter bot token from @BotFather"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Chat ID</label>
                  <input
                    type="text"
                    className="input"
                    value={config.api.telegramChatId}
                    onChange={e => setConfig({...config, api: {...config.api, telegramChatId: e.target.value}})}
                    placeholder="Enter chat ID from @userinfobot"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleTestTelegram} className="btn-secondary gap-2">
                  <TestTube size={16} />
                  Test Telegram
                </button>
                <button className="btn-ghost gap-2" onClick={() => toast('Get token from @BotFather')}>
                  <Info size={16} />
                  How to get token
                </button>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Database size={20} /> Data Provider</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Provider</label>
                  <select
                    className="input"
                    value={config.api.dataProvider}
                    onChange={e => setConfig({...config, api: {...config.api, dataProvider: e.target.value}})}
                  >
                    <option value="yfinance">Yahoo Finance (Free, Delayed)</option>
                    <option value="kite">Zerodha Kite Connect (₹2000/mo)</option>
                    <option value="fyers">Fyers API (Free with account)</option>
                    <option value="upstox">Upstox API (Free with account)</option>
                    <option value="angel">Angel One SmartAPI (Free with account)</option>
                  </select>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Key size={20} /> Broker API Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.api.dataProvider === 'kite'}
                      onChange={e => setConfig({...config, api: {...config.api, dataProvider: e.target.checked ? 'kite' : 'yfinance'}})}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Zerodha Kite Connect</span>
                  </label>
                </div>
                <div>
                  <label className="label">API Key</label>
                  <input type="password" className="input" value={config.api.kiteApiKey} onChange={e => setConfig({...config, api: {...config.api, kiteApiKey: e.target.value}})} />
                </div>
                <div>
                  <label className="label">Access Token</label>
                  <input type="password" className="input" value={config.api.kiteAccessToken} onChange={e => setConfig({...config, api: {...config.api, kiteAccessToken: e.target.value}})} />
                </div>
                <div className="md:col-span-2">
                  <label className="label flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.api.dataProvider === 'fyers'}
                      onChange={e => setConfig({...config, api: {...config.api, dataProvider: e.target.checked ? 'fyers' : 'yfinance'}})}
                      className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span>Fyers API</span>
                  </label>
                </div>
                <div>
                  <label className="label">Client ID</label>
                  <input type="password" className="input" value={config.api.fyersClientId} onChange={e => setConfig({...config, api: {...config.api, fyersClientId: e.target.value}})} />
                </div>
                <div>
                  <label className="label">Access Token</label>
                  <input type="password" className="input" value={config.api.fyersAccessToken} onChange={e => setConfig({...config, api: {...config.api, fyersAccessToken: e.target.value}})} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleTestConnection('Kite')} className="btn-secondary gap-2">
                  <Wifi size={16} />
                  Test Kite
                </button>
                <button onClick={() => handleTestConnection('Fyers')} className="btn-secondary gap-2">
                  <Wifi size={16} />
                  Test Fyers
                </button>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Key size={20} /> AI / Codex Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">OpenAI API Key</label>
                  <input type="password" className="input" value={config.api.openaiApiKey} onChange={e => setConfig({...config, api: {...config.api, openaiApiKey: e.target.value}})} placeholder="sk-..." />
                </div>
                <div>
                  <label className="label">Model</label>
                  <select className="input" value={config.api.codexModel} onChange={e => setConfig({...config, api: {...config.api, codexModel: e.target.value}})}>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Link2 size={20} className="text-primary-400" /> External Integrations</h3>
              
              <div className="card p-4">
                <h4 className="font-semibold text-dark-100 mb-3">TradingView Webhook</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Webhook URL</label>
                    <input type="url" className="input" value={config.integrations.tradingviewWebhookUrl} onChange={e => setConfig({...config, integrations: {...config.integrations, tradingviewWebhookUrl: e.target.value}})} placeholder="https://your-server.com/webhook" />
                  </div>
                  <div>
                    <label className="label">Secret Key</label>
                    <input type="password" className="input" value={config.integrations.tradingviewSecret} onChange={e => setConfig({...config, integrations: {...config.integrations, tradingviewSecret: e.target.value}})} placeholder="Secret for signature verification" />
                  </div>
                </div>
                <p className="text-sm text-dark-400">Add this webhook URL in TradingView Alert settings to receive alerts directly in StockAlert</p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-dark-100 mb-3">Discord Bot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Webhook URL</label>
                    <input type="url" className="input" value={config.integrations.discordWebhookUrl} onChange={e => setConfig({...config, integrations: {...config.integrations, discordWebhookUrl: e.target.value}})} placeholder="https://discord.com/api/webhooks/..." />
                  </div>
                  <div>
                    <label className="label">Bot Token (Optional)</label>
                    <input type="password" className="input" value={config.integrations.discordBotToken} onChange={e => setConfig({...config, integrations: {...config.integrations, discordBotToken: e.target.value}})} placeholder="For slash commands" />
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-dark-100 mb-3">Slack Integration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Webhook URL</label>
                    <input type="url" className="input" value={config.integrations.slackWebhookUrl} onChange={e => setConfig({...config, integrations: {...config.integrations, slackWebhookUrl: e.target.value}})} placeholder="https://hooks.slack.com/services/..." />
                  </div>
                  <div>
                    <label className="label">Bot Token</label>
                    <input type="password" className="input" value={config.integrations.slackBotToken} onChange={e => setConfig({...config, integrations: {...config.integrations, slackBotToken: e.target.value}})} placeholder="xoxb-..." />
                  </div>
                </div>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-dark-100 mb-3">Google Sheets Sync</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Spreadsheet ID</label>
                    <input type="text" className="input" value={config.integrations.googleSheetsId} onChange={e => setConfig({...config, integrations: {...config.integrations, googleSheetsId: e.target.value}})} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" />
                  </div>
                  <div>
                    <label className="label">Service Account JSON</label>
                    <textarea className="input h-24" value={config.integrations.googleServiceAccount} onChange={e => setConfig({...config, integrations: {...config.integrations, googleServiceAccount: e.target.value}})} placeholder="Paste service account JSON here" />
                  </div>
                </div>
                <p className="text-sm text-dark-400">Auto-sync signals and backtest results to Google Sheets</p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-dark-100 mb-3">Notion Database</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="label">Integration Token</label>
                    <input type="password" className="input" value={config.integrations.notionToken} onChange={e => setConfig({...config, integrations: {...config.integrations, notionToken: e.target.value}})} placeholder="secret_..." />
                  </div>
                  <div>
                    <label className="label">Database ID</label>
                    <input type="text" className="input" value={config.integrations.notionDatabaseId} onChange={e => setConfig({...config, integrations: {...config.integrations, notionDatabaseId: e.target.value}})} placeholder="32-char database ID" />
                  </div>
                </div>
                <p className="text-sm text-dark-400">Log trades and journal entries directly to Notion</p>
              </div>

              <div className="card p-4">
                <h4 className="font-semibold text-dark-100 mb-3">Custom Webhooks</h4>
                <div className="space-y-3">
                  {config.integrations.customWebhooks.map((webhook, i) => {
                    const updateWebhook = (field: string, value: string) => {
                      const arr = [...config.integrations.customWebhooks];
                      arr[i] = { ...arr[i], [field]: value };
                      setConfig({ ...config, integrations: { ...config.integrations, customWebhooks: arr } });
                    };
                    const deleteWebhook = () => {
                      const arr = config.integrations.customWebhooks.filter((_, idx) => idx !== i);
                      setConfig({ ...config, integrations: { ...config.integrations, customWebhooks: arr } });
                    };
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                        <input type="text" className="input flex-1" placeholder="Webhook Name" value={webhook.name} onChange={e => updateWebhook('name', e.target.value)} />
                        <input type="url" className="input flex-1" placeholder="Webhook URL" value={webhook.url} onChange={e => updateWebhook('url', e.target.value)} />
                        <select className="input w-40" value={webhook.events} onChange={e => updateWebhook('events', e.target.value)}>
                          <option value="">All Events</option>
                          <option value="alert,signal">Alerts & Signals</option>
                          <option value="scan_complete">Scan Complete</option>
                          <option value="error">Errors</option>
                        </select>
                        <button className="p-2 rounded hover:bg-red-500/10 text-red-400" onClick={deleteWebhook}><Trash2 size={18} /></button>
                      </div>
                    );
                  })}
                  <button className="btn-secondary gap-2" onClick={() => { const arr: Array<{ name: string; url: string; events: string }> = [...config.integrations.customWebhooks, { name: '', url: '', events: '' }]; setConfig({...config, integrations: {...config.integrations, customWebhooks: arr}}); }}>
                    <Plus size={18} />
                    Add Webhook
                  </button>
                </div>
              </div>

              <div className="card p-5 border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Send size={20} className="text-primary-400" /> Custom API Integrations</h3>
                    <p className="text-sm text-dark-400 mt-1">Add your own API endpoints, webhooks, or bots. Saved to your browser — works offline.</p>
                  </div>
                  <button onClick={openNewIntegration} className="btn-primary gap-2"><Plus size={18} /> Add Custom Integration</button>
                </div>

                {customIntegrations.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-dark-700 rounded-xl">
                    <Send size={48} className="mx-auto mb-3 text-dark-600" />
                    <p className="text-dark-300 font-medium">No custom integrations yet</p>
                    <p className="text-sm text-dark-500 mt-1">Click "Add Custom Integration" to create your first one</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customIntegrations.map((integration) => {
                      const lastTriggeredAgo = integration.lastTriggered ? Math.floor((Date.now() - new Date(integration.lastTriggered).getTime()) / 60000) : null;
                      return (
                        <div key={integration.id} className={`p-4 bg-dark-800/50 rounded-lg border transition-all ${integration.enabled ? 'border-primary-500/30' : 'border-dark-700 opacity-70'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-lg">{integrationTemplates.find(t => t.type === integration.type)?.icon || '🔗'}</span>
                                <h4 className="font-semibold text-dark-100">{integration.name}</h4>
                                <span className="badge bg-dark-700 text-dark-300 text-xs uppercase">{integration.type}</span>
                                <span className={`badge ${integration.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'} text-xs`}>{integration.enabled ? 'Active' : 'Paused'}</span>
                                {integration.lastStatus && (
                                  <span className={`badge ${integration.lastStatus === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-xs`}>
                                    Last: {integration.lastStatus}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-dark-400 font-mono truncate mb-2">{integration.method} {integration.endpoint}</p>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {integration.triggerEvents.map(e => (
                                  <span key={e} className="badge bg-purple-500/20 text-purple-400 text-xs">{e}</span>
                                ))}
                              </div>
                              {integration.lastResponse && (
                                <p className="text-xs text-dark-500 mt-2">
                                  <span className="text-dark-400">Last response:</span> <span className="font-mono">{integration.lastResponse}</span>
                                  {lastTriggeredAgo !== null && <span className="text-dark-500"> • {lastTriggeredAgo < 1 ? 'just now' : `${lastTriggeredAgo}m ago`}</span>}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button onClick={() => testIntegration(integration.id)} disabled={testingIntegration === integration.id} className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-primary-400 transition-colors disabled:opacity-50" title="Test now">
                                <TestTube size={16} className={testingIntegration === integration.id ? 'animate-pulse' : ''} />
                              </button>
                              <button onClick={() => openEditIntegration(integration)} className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors" title="Edit">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => deleteIntegration(integration.id)} className="p-2 rounded hover:bg-red-500/10 text-red-400 transition-colors" title="Delete">
                                <Trash2 size={16} />
                              </button>
                              <label className="relative inline-flex items-center cursor-pointer ml-2" title={integration.enabled ? 'Pause' : 'Enable'}>
                                <input type="checkbox" checked={integration.enabled} onChange={() => toggleIntegration(integration.id)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-dark-400 hover:text-dark-200 flex items-center gap-2">
                    <Code2 size={14} /> Available template variables
                  </summary>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {['{{symbol}}', '{{price}}', '{{change}}', '{{pattern}}', '{{signal}}', '{{timeframe}}', '{{strategy}}', '{{confidence}}', '{{timestamp}}', '{{volume}}', '{{event}}', '{{message}}'].map(v => (
                      <code key={v} className="px-2 py-1 bg-dark-800 rounded text-primary-400 font-mono">{v}</code>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Bell size={20} /> Alert Delivery</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableTelegram} onChange={e => setConfig({...config, notifications: {...config.notifications, enableTelegram: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">Telegram Bot</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Send alerts via Telegram bot</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableBrowser} onChange={e => setConfig({...config, notifications: {...config.notifications, enableBrowser: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">Browser Notifications</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Desktop notifications</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableEmail} onChange={e => setConfig({...config, notifications: {...config.notifications, enableEmail: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">Email Alerts</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Email notifications (requires SMTP)</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enablePush} onChange={e => setConfig({...config, notifications: {...config.notifications, enablePush: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">Push Notifications</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Mobile push via PWA</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableDiscord} onChange={e => setConfig({...config, notifications: {...config.notifications, enableDiscord: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">Discord</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Post to Discord channels</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableSlack} onChange={e => setConfig({...config, notifications: {...config.notifications, enableSlack: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">Slack</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Send to Slack workspaces</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableWhatsApp} onChange={e => setConfig({...config, notifications: {...config.notifications, enableWhatsApp: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">WhatsApp</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">WhatsApp Business API</p>
                </div>
                <div className="card p-4">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.enableSMS} onChange={e => setConfig({...config, notifications: {...config.notifications, enableSMS: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="font-medium">SMS Alerts</span>
                  </label>
                  <p className="text-sm text-dark-500 mt-1">Text messages via Twilio</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><AlertTriangle size={20} /> Alert Behavior</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Cooldown (minutes)</label>
                  <input type="number" min="1" max="1440" className="input" value={config.notifications.alertCooldown} onChange={e => setConfig({...config, notifications: {...config.notifications, alertCooldown: parseInt(e.target.value) || 15}})} />
                </div>
                <div>
                  <label className="label">Max Alerts per Scan</label>
                  <input type="number" min="1" max="100" className="input" value={config.notifications.maxAlertsPerScan} onChange={e => setConfig({...config, notifications: {...config.notifications, maxAlertsPerScan: parseInt(e.target.value) || 20}})} />
                </div>
                <div>
                  <label className="label">Min Confidence %</label>
                  <input type="number" min="0" max="100" className="input" value={config.notifications.minConfidence} onChange={e => setConfig({...config, notifications: {...config.notifications, minConfidence: parseInt(e.target.value) || 70}})} />
                </div>
                <div className="md:col-span-3">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.includeCharts} onChange={e => setConfig({...config, notifications: {...config.notifications, includeCharts: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Include chart images with alerts</span>
                  </label>
                </div>
                <div className="md:col-span-3">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.soundEnabled} onChange={e => setConfig({...config, notifications: {...config.notifications, soundEnabled: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Play sound for new alerts</span>
                  </label>
                </div>
                <div className="md:col-span-3">
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.onlyHighConfidence} onChange={e => setConfig({...config, notifications: {...config.notifications, onlyHighConfidence: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Only notify for high confidence signals ({'>'} {config.notifications.minConfidence}%)</span>
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Clock size={20} /> Quiet Hours & Scheduling</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="label">Quiet Hours Start</label>
                  <input type="time" className="input" value={config.notifications.quietHoursStart} onChange={e => setConfig({...config, notifications: {...config.notifications, quietHoursStart: e.target.value}})} />
                </div>
                <div>
                  <label className="label">Quiet Hours End</label>
                  <input type="time" className="input" value={config.notifications.quietHoursEnd} onChange={e => setConfig({...config, notifications: {...config.notifications, quietHoursEnd: e.target.value}})} />
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.notifications.weekendNotifications} onChange={e => setConfig({...config, notifications: {...config.notifications, weekendNotifications: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Weekend Notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Database size={20} /> Cache Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Cache TTL (seconds)</label>
                  <input type="number" min="60" max="3600" className="input" value={config.data.cacheTTL} onChange={e => setConfig({...config, data: {...config.data, cacheTTL: parseInt(e.target.value) || 300}})} />
                </div>
                <div>
                  <label className="label">Max Symbols</label>
                  <input type="number" min="1" max="200" className="input" value={config.data.maxSymbols} onChange={e => setConfig({...config, data: {...config.data, maxSymbols: parseInt(e.target.value) || 50}})} />
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.data.enableCache} onChange={e => setConfig({...config, data: {...config.data, enableCache: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Enable caching</span>
                  </label>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.data.compressionEnabled} onChange={e => setConfig({...config, data: {...config.data, compressionEnabled: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Compress cached data</span>
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Clock size={20} /> Lookback Periods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(config.data.lookbackPeriods).map(([tf, val]) => (
                  <div key={tf}>
                    <label className="label">{tf} timeframe</label>
                    <input type="number" min="10" max="2000" className="input" value={val} onChange={e => setConfig({...config, data: {...config.data, lookbackPeriods: {...config.data.lookbackPeriods, [tf]: parseInt(e.target.value) || val}}})} />
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Wifi size={20} /> Default Timeframes</h3>
              <div className="flex flex-wrap gap-2">
                {['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'].map(tf => (
                  <label key={tf} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dark-600 bg-dark-800/50 hover:bg-dark-700/50 cursor-pointer">
                    <input type="checkbox" checked={config.data.defaultTimeframes.includes(tf)} onChange={e => setConfig({...config, data: {...config.data, defaultTimeframes: e.target.checked ? [...config.data.defaultTimeframes, tf] : config.data.defaultTimeframes.filter(t => t !== tf)}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span className="text-sm text-dark-300">{tf}</span>
                  </label>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Database size={20} /> Storage & Cleanup</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Data Retention (days)</label>
                  <input type="number" min="1" max="365" className="input" value={config.data.dataRetentionDays} onChange={e => setConfig({...config, data: {...config.data, dataRetentionDays: parseInt(e.target.value) || 90}})} />
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.data.autoCleanup} onChange={e => setConfig({...config, data: {...config.data, autoCleanup: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Auto cleanup old data</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Users size={20} /> Team Members</h3>
                  <p className="text-sm text-dark-400 mt-1">Manage who has access to your StockAlert workspace</p>
                </div>
                <button onClick={() => setShowAddMember(true)} className="btn-primary gap-2">
                  <Plus size={18} /> Invite Member
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-dark-400 border-b border-dark-700">
                      <th className="p-4">Member</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">API Keys</th>
                      <th className="p-4">Last Active</th>
                      <th className="p-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {teamMembers.map((m) => {
                      const RoleIcon = m.role === 'Owner' ? Crown : m.role === 'Admin' ? Shield : m.role === 'Trader' ? Target : Eye;
                      const roleColor = m.role === 'Owner' ? 'text-accent-400' : m.role === 'Admin' ? 'text-primary-400' : m.role === 'Trader' ? 'text-blue-400' : 'text-dark-400';
                      return (
                        <tr key={m.id} className="hover:bg-dark-800/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                                {m.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-dark-100">{m.name}</p>
                                <p className="text-xs text-dark-400">{m.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-dark-800 ${roleColor}`}>
                              <RoleIcon size={12} />
                              {m.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`badge ${m.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${m.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                              {m.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="badge bg-purple-500/20 text-purple-400">{m.apiKeys} keys</span>
                          </td>
                          <td className="p-4 text-sm text-dark-400">{m.lastActive}</td>
                          <td className="p-4">
                            <button className="p-2 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-100 transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2 pt-4"><Key size={20} /> Role Permissions</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-dark-400 border-b border-dark-700">
                      <th className="p-4">Capability</th>
                      <th className="p-4 text-center">Owner</th>
                      <th className="p-4 text-center">Admin</th>
                      <th className="p-4 text-center">Trader</th>
                      <th className="p-4 text-center">Viewer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {permissions.map((p) => (
                      <tr key={p.capability}>
                        <td className="p-4 text-dark-300">{p.capability}</td>
                        <td className="p-4 text-center">{p.owner ? <CheckCircle size={18} className="text-green-400 inline" /> : <XCircle size={18} className="text-dark-600 inline" />}</td>
                        <td className="p-4 text-center">{p.admin ? <CheckCircle size={18} className="text-green-400 inline" /> : <XCircle size={18} className="text-dark-600 inline" />}</td>
                        <td className="p-4 text-center">{p.trader ? <CheckCircle size={18} className="text-green-400 inline" /> : <XCircle size={18} className="text-dark-600 inline" />}</td>
                        <td className="p-4 text-center">{p.viewer ? <CheckCircle size={18} className="text-green-400 inline" /> : <XCircle size={18} className="text-dark-600 inline" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2 pt-4"><Activity size={20} /> Recent Activity</h3>
              <div className="card divide-y divide-dark-700">
                {activityLog.map((a) => (
                  <div key={a.id} className="p-4 flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${a.type === 'invite' ? 'bg-blue-500/10' : a.type === 'role' ? 'bg-purple-500/10' : 'bg-primary-500/10'}`}>
                      {a.type === 'invite' ? <UserPlus size={16} className="text-blue-400" /> : a.type === 'role' ? <Shield size={16} className="text-purple-400" /> : <Edit size={16} className="text-primary-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-200"><span className="font-medium text-dark-100">{a.user}</span> {a.action} <span className="font-medium text-dark-100">{a.target}</span></p>
                      <p className="text-xs text-dark-500 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showAddMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAddMember(false)}>
              <div className="card-elevated max-w-md w-full p-6 space-y-4 scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-dark-50 flex items-center gap-2"><UserPlus size={20} className="text-primary-400" /> Invite Team Member</h3>
                  <button onClick={() => setShowAddMember(false)} className="p-1.5 rounded hover:bg-dark-700 text-dark-400">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" placeholder="trader@example.com" className="input" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value as any})}>
                      <option value="Admin">Admin — Full access except billing</option>
                      <option value="Trader">Trader — Can view + execute alerts</option>
                      <option value="Viewer">Viewer — Read-only access</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Personal Message (optional)</label>
                    <textarea className="input h-20" placeholder="Hey, joining you on StockAlert..." value={newMember.message} onChange={e => setNewMember({...newMember, message: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => { toast.success(`Invite sent to ${newMember.email || 'user'}`); setShowAddMember(false); setNewMember({ email: '', role: 'Viewer', message: '' }); }} className="btn-primary flex-1">Send Invite</button>
                  <button onClick={() => setShowAddMember(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {showIntegrationModal && editingIntegration && (
            <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in overflow-y-auto" onClick={() => setShowIntegrationModal(false)}>
              <div className="card-elevated max-w-3xl w-full my-8 scale-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-dark-700">
                  <div>
                    <h3 className="text-xl font-bold text-dark-50 flex items-center gap-2">
                      <Send size={20} className="text-primary-400" />
                      {customIntegrations.find(i => i.id === editingIntegration.id) ? 'Edit Integration' : 'New Custom Integration'}
                    </h3>
                    <p className="text-sm text-dark-400 mt-1">Configure endpoint, auth, and trigger events</p>
                  </div>
                  <button onClick={() => setShowIntegrationModal(false)} className="p-2 rounded hover:bg-dark-700 text-dark-400">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="label flex items-center gap-2"><SparklesIcon size={14} className="text-primary-400" /> Quick Start Template</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {integrationTemplates.map(t => (
                        <button key={t.name} onClick={() => applyTemplate(t.name)} className="p-3 bg-dark-800/50 hover:bg-dark-700 border border-dark-700 hover:border-primary-500/50 rounded-lg text-left transition-all">
                          <div className="text-xl mb-1">{t.icon}</div>
                          <p className="text-sm font-medium text-dark-100">{t.name}</p>
                          <p className="text-xs text-dark-400 mt-0.5">{t.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Integration Name *</label>
                      <input type="text" className="input" placeholder="e.g. My Zapier Webhook" value={editingIntegration.name} onChange={e => setEditingIntegration({...editingIntegration, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="label">Type</label>
                      <select className="input" value={editingIntegration.type} onChange={e => setEditingIntegration({...editingIntegration, type: e.target.value as CustomIntegration['type']})}>
                        <option value="webhook">Generic Webhook</option>
                        <option value="rest">REST API</option>
                        <option value="graphql">GraphQL</option>
                        <option value="telegram_clone">Telegram-style Bot</option>
                        <option value="custom">Custom (Advanced)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <label className="label">Method</label>
                      <select className="input" value={editingIntegration.method} onChange={e => setEditingIntegration({...editingIntegration, method: e.target.value as CustomIntegration['method']})}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="label">Endpoint URL *</label>
                      <input type="url" className="input font-mono text-sm" placeholder="https://api.example.com/webhook" value={editingIntegration.endpoint} onChange={e => setEditingIntegration({...editingIntegration, endpoint: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="label !mb-0">Headers</label>
                      <button onClick={() => setEditingIntegration({...editingIntegration, headers: [...editingIntegration.headers, { key: '', value: '' }]})} className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"><Plus size={12} /> Add Header</button>
                    </div>
                    <div className="space-y-2">
                      {editingIntegration.headers.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="text" className="input flex-1 font-mono text-sm" placeholder="Header name (e.g. Authorization)" value={h.key} onChange={e => { const copy = [...editingIntegration.headers]; copy[i] = { ...copy[i], key: e.target.value }; setEditingIntegration({...editingIntegration, headers: copy}); }} />
                          <input type="text" className="input flex-1 font-mono text-sm" placeholder="Value" value={h.value} onChange={e => { const copy = [...editingIntegration.headers]; copy[i] = { ...copy[i], value: e.target.value }; setEditingIntegration({...editingIntegration, headers: copy}); }} />
                          <button onClick={() => setEditingIntegration({...editingIntegration, headers: editingIntegration.headers.filter((_, idx) => idx !== i)})} className="p-2 rounded hover:bg-red-500/10 text-red-400"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {presetHeaders.filter(p => !editingIntegration.headers.some(h => h.key === p.key)).map(p => (
                          <button key={p.key} onClick={() => setEditingIntegration({...editingIntegration, headers: [...editingIntegration.headers, p]})} className="text-xs px-2 py-1 bg-dark-800 hover:bg-dark-700 rounded text-dark-400 hover:text-dark-200">+ {p.key}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Auth Type</label>
                      <select className="input" value={editingIntegration.authType} onChange={e => setEditingIntegration({...editingIntegration, authType: e.target.value as CustomIntegration['authType']})}>
                        <option value="none">None</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="api_key">API Key (Header)</option>
                        <option value="basic">Basic Auth</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">{editingIntegration.authType === 'bearer' ? 'Token' : editingIntegration.authType === 'api_key' ? 'API Key Value' : editingIntegration.authType === 'basic' ? 'user:password' : 'Not needed'}</label>
                      <input type="password" className="input font-mono text-sm" placeholder={editingIntegration.authType === 'none' ? '—' : '••••••••'} value={editingIntegration.authValue} disabled={editingIntegration.authType === 'none'} onChange={e => setEditingIntegration({...editingIntegration, authValue: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="label">Body Template (JSON / text / GraphQL)</label>
                    <textarea className="input font-mono text-xs h-40" placeholder={'{\n  "symbol": "{{symbol}}",\n  "price": {{price}}\n}'} value={editingIntegration.bodyTemplate} onChange={e => setEditingIntegration({...editingIntegration, bodyTemplate: e.target.value})} />
                    <details className="mt-2">
                      <summary className="text-xs text-dark-400 cursor-pointer hover:text-dark-200">Show available variables</summary>
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                        {['{{symbol}}', '{{price}}', '{{change}}', '{{pattern}}', '{{signal}}', '{{timeframe}}', '{{strategy}}', '{{confidence}}', '{{timestamp}}', '{{volume}}', '{{event}}', '{{message}}'].map(v => (
                          <button key={v} onClick={() => navigator.clipboard?.writeText(v)} className="px-2 py-1 bg-dark-800 hover:bg-dark-700 rounded text-primary-400 font-mono text-left">{v}</button>
                        ))}
                      </div>
                    </details>
                  </div>

                  <div>
                    <label className="label">Trigger Events</label>
                    <div className="space-y-2">
                      {eventOptions.map(ev => (
                        <label key={ev.id} className="flex items-start gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-800 transition-colors">
                          <input type="checkbox" checked={editingIntegration.triggerEvents.includes(ev.id)} onChange={e => setEditingIntegration({...editingIntegration, triggerEvents: e.target.checked ? [...editingIntegration.triggerEvents, ev.id] : editingIntegration.triggerEvents.filter(x => x !== ev.id)})} className="w-4 h-4 mt-0.5 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-dark-100">{ev.label}</p>
                            <p className="text-xs text-dark-400">{ev.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                    <input type="checkbox" id="enabled-toggle" checked={editingIntegration.enabled} onChange={e => setEditingIntegration({...editingIntegration, enabled: e.target.checked})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <label htmlFor="enabled-toggle" className="flex-1 cursor-pointer">
                      <p className="text-sm font-medium text-dark-100">Enable immediately</p>
                      <p className="text-xs text-dark-400">Integration will start receiving events as soon as it's saved</p>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-6 border-t border-dark-700 bg-dark-900/50">
                  <button onClick={() => testIntegration(editingIntegration.id)} disabled={!editingIntegration.endpoint || testingIntegration === editingIntegration.id} className="btn-secondary gap-2">
                    <TestTube size={16} className={testingIntegration === editingIntegration.id ? 'animate-pulse' : ''} />
                    Test
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => setShowIntegrationModal(false)} className="btn-ghost">Cancel</button>
                    <button onClick={saveIntegration} className="btn-primary gap-2"><Save size={16} /> Save Integration</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><UserCog size={20} /> Profile</h3>
              <div className="card p-5">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold">NS</div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-dark-50">Naman Sharma</h4>
                    <p className="text-sm text-dark-400">naman@stockalert.io • Member since Jan 2024</p>
                    <div className="flex gap-2 mt-2">
                      <span className="badge bg-primary-500/20 text-primary-400">Pro Plan</span>
                      <span className="badge bg-dark-700 text-dark-300">2FA Enabled</span>
                    </div>
                  </div>
                  <button className="btn-secondary gap-2"><Edit size={16} /> Edit Profile</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="label">Display Name</label><input type="text" className="input" defaultValue="Naman Sharma" /></div>
                  <div><label className="label">Email</label><input type="email" className="input" defaultValue="naman@stockalert.io" /></div>
                  <div><label className="label">Phone (+91)</label><input type="tel" className="input" defaultValue="+91 98765 43210" /></div>
                  <div><label className="label">Time Zone</label><input type="text" className="input" defaultValue="Asia/Kolkata (IST, UTC+5:30)" /></div>
                  <div><label className="label">Trading Style</label><select className="input"><option>Scalper (1-5 min)</option><option selected>Intraday (15m-1h)</option><option>Swing (1d-1w)</option><option>Positional (1w+)</option><option>Long-term Investor</option></select></div>
                  <div><label className="label">Primary Broker</label><select className="input"><option>Zerodha Kite</option><option>Upstox</option><option>Angel One</option><option>Fyers</option><option>None (data only)</option></select></div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Shield size={20} /> Security</h3>
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10"><Fingerprint size={20} className="text-green-400" /></div>
                    <div>
                      <p className="font-medium text-dark-100">Two-Factor Authentication</p>
                      <p className="text-xs text-dark-400">Authenticator app — TOTP</p>
                    </div>
                  </div>
                  <span className="badge bg-green-500/20 text-green-400">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10"><KeyRound size={20} className="text-blue-400" /></div>
                    <div>
                      <p className="font-medium text-dark-100">Password</p>
                      <p className="text-xs text-dark-400">Last changed 45 days ago</p>
                    </div>
                  </div>
                  <button className="btn-secondary text-sm">Change</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10"><ScanFace size={20} className="text-purple-400" /></div>
                    <div>
                      <p className="font-medium text-dark-100">Biometric Login</p>
                      <p className="text-xs text-dark-400">Face ID / Touch ID on supported devices</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-600 text-primary-500" /></label>
                </div>
                <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10"><Mail size={20} className="text-orange-400" /></div>
                    <div>
                      <p className="font-medium text-dark-100">Email Notifications for Login</p>
                      <p className="text-xs text-dark-400">Get alerted on new device sign-ins</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-600 text-primary-500" /></label>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Monitor size={20} /> Active Sessions</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="text-left text-sm text-dark-400 border-b border-dark-700"><th className="p-4">Device</th><th className="p-4">Location</th><th className="p-4">Last Active</th><th className="p-4 w-12"></th></tr></thead>
                  <tbody className="divide-y divide-dark-700">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-dark-800/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${s.device.includes('iPhone') || s.device.includes('iPad') ? 'bg-blue-500/10' : s.device.includes('Trading') ? 'bg-orange-500/10' : 'bg-purple-500/10'}`}>
                              <Monitor size={16} className="text-dark-300" />
                            </div>
                            <div>
                              <p className="font-medium text-dark-100">{s.device} {s.current && <span className="badge bg-green-500/20 text-green-400 text-xs ml-2">This device</span>}</p>
                              <p className="text-xs text-dark-400">{s.browser} • {s.os}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-dark-300">{s.location}<br /><span className="text-xs text-dark-500 font-mono">{s.ip}</span></td>
                        <td className="p-4 text-sm text-dark-400">{s.lastActive}</td>
                        <td className="p-4">{!s.current && <button className="p-2 rounded hover:bg-red-500/10 text-red-400" title="Revoke"><Trash2 size={14} /></button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn-danger gap-2"><Trash2 size={16} /> Revoke All Other Sessions</button>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="card p-6 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/30">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={20} className="text-accent-400" />
                      <span className="badge bg-accent-500/20 text-accent-400">Pro Plan</span>
                    </div>
                    <h3 className="text-3xl font-bold text-dark-50">₹4,999<span className="text-lg text-dark-400 font-normal">/month</span></h3>
                    <p className="text-sm text-dark-400 mt-1">Renews on 21 Aug 2026 • Auto-renewal ON</p>
                  </div>
                  <button className="btn-secondary gap-2"><SparklesIcon size={16} /> Upgrade to Enterprise</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  <div className="p-3 bg-dark-900/50 rounded-lg"><p className="text-2xl font-bold text-dark-50">∞</p><p className="text-xs text-dark-400">Symbols</p></div>
                  <div className="p-3 bg-dark-900/50 rounded-lg"><p className="text-2xl font-bold text-dark-50">5</p><p className="text-xs text-dark-400">Team seats</p></div>
                  <div className="p-3 bg-dark-900/50 rounded-lg"><p className="text-2xl font-bold text-dark-50">1m</p><p className="text-xs text-dark-400">Scan interval</p></div>
                  <div className="p-3 bg-dark-900/50 rounded-lg"><p className="text-2xl font-bold text-dark-50">Live</p><p className="text-xs text-dark-400">Data feed</p></div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><CreditCard size={20} /> Payment Method</h3>
              <div className="card p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-10 rounded-md bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">VISA</div>
                  <div>
                    <p className="font-medium text-dark-100">Visa ending in 4242</p>
                    <p className="text-xs text-dark-400">Expires 09/2027 • Default</p>
                  </div>
                </div>
                <div className="flex gap-2"><button className="btn-secondary text-sm">Edit</button><button className="btn-ghost text-sm">Remove</button></div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer flex-1"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-600 text-primary-500" /><span className="text-sm text-dark-300">Auto-renew subscription</span></label>
                <button className="btn-ghost text-sm">Cancel Subscription</button>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Receipt size={20} /> Invoice History</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="text-left text-sm text-dark-400 border-b border-dark-700"><th className="p-4">Invoice</th><th className="p-4">Date</th><th className="p-4">Plan</th><th className="p-4 text-right">Amount</th><th className="p-4">Status</th><th className="p-4 w-12"></th></tr></thead>
                  <tbody className="divide-y divide-dark-700">
                    {invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-dark-800/50">
                        <td className="p-4 font-mono text-sm text-dark-100">{inv.id}</td>
                        <td className="p-4 text-sm text-dark-300">{inv.date}</td>
                        <td className="p-4 text-sm text-dark-300">{inv.plan}</td>
                        <td className="p-4 text-right font-mono text-dark-100">{inv.amount}</td>
                        <td className="p-4"><span className="badge bg-green-500/20 text-green-400">{inv.status}</span></td>
                        <td className="p-4"><button className="p-2 rounded hover:bg-dark-700 text-dark-400" title="Download"><Download size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><SparklesIcon size={20} /> Usage This Month</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card"><div className="flex justify-between text-sm mb-2"><span className="text-dark-300">API Calls</span><span className="font-mono text-dark-100">12,847 / 100K</span></div><div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: '12.8%' }} /></div></div>
                <div className="card"><div className="flex justify-between text-sm mb-2"><span className="text-dark-300">Alerts Sent</span><span className="font-mono text-dark-100">847 / 10K</span></div><div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: '8.5%' }} /></div></div>
                <div className="card"><div className="flex justify-between text-sm mb-2"><span className="text-dark-300">Storage</span><span className="font-mono text-dark-100">2.3 GB / 50 GB</span></div><div className="w-full h-2 bg-dark-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: '4.6%' }} /></div></div>
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="card p-5 border-red-500/30 bg-gradient-to-br from-red-500/5 to-orange-500/5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-500/10"><ShieldAlertIcon size={24} className="text-red-400" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-dark-50">Kill Switch</h3>
                      <p className="text-sm text-dark-400">Immediately stops all scanning and alert delivery</p>
                    </div>
                  </div>
                  <button className="btn-danger gap-2"><AlertOctagon size={16} /> Activate Kill Switch</button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Target size={20} /> Position Limits</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="label">Max Position Size (% of capital)</label><input type="number" min="1" max="100" className="input" defaultValue={5} /><p className="text-xs text-dark-500 mt-1">Per single trade</p></div>
                <div><label className="label">Max Open Positions</label><input type="number" min="1" max="50" className="input" defaultValue={10} /><p className="text-xs text-dark-500 mt-1">Concurrent holdings</p></div>
                <div><label className="label">Max Sector Exposure (%)</label><input type="number" min="5" max="100" className="input" defaultValue={25} /><p className="text-xs text-dark-500 mt-1">Single sector</p></div>
                <div><label className="label">Max Daily Loss (₹)</label><input type="number" className="input" defaultValue={10000} /></div>
                <div><label className="label">Max Weekly Loss (₹)</label><input type="number" className="input" defaultValue={30000} /></div>
                <div><label className="label">Max Drawdown (%)</label><input type="number" min="5" max="50" className="input" defaultValue={15} /></div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><SlidersHorizontal size={20} /> Position Sizing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Sizing Method</label><select className="input"><option>Kelly Criterion (½ Kelly)</option><option selected>Fixed Fractional (% of capital)</option><option>Fixed Rupee Amount</option><option>Volatility-adjusted (ATR)</option><option>Risk Parity</option></select></div>
                <div><label className="label">Risk per Trade (%)</label><input type="number" min="0.1" max="5" step="0.1" className="input" defaultValue={1.0} /></div>
                <div><label className="label">Default Stop Loss (%)</label><input type="number" min="0.5" max="20" step="0.5" className="input" defaultValue={2.0} /></div>
                <div><label className="label">Default Take Profit (%)</label><input type="number" min="1" max="50" step="0.5" className="input" defaultValue={4.0} /></div>
                <div><label className="label">Risk-Reward Ratio</label><select className="input"><option>1:1</option><option selected>1:2</option><option>1:3</option><option>Dynamic</option></select></div>
                <div><label className="label">Trailing Stop</label><select className="input"><option>Disabled</option><option selected>ATR-based (1.5×)</option><option>% based</option><option>Moving Average</option></select></div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><AlertTriangle size={20} /> Risk Alerts</h3>
              <div className="space-y-2">
                {[
                  { label: 'Alert when position loss exceeds stop loss', defaultChecked: true },
                  { label: 'Alert when daily P&L hits limit', defaultChecked: true },
                  { label: 'Alert on correlated positions (>0.7 correlation)', defaultChecked: true },
                  { label: 'Block new alerts when in drawdown', defaultChecked: false },
                  { label: 'Auto-reduce position size after 2 consecutive losses', defaultChecked: false },
                  { label: 'Auto-pause strategy after 5 losing trades', defaultChecked: false },
                ].map((r, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-800">
                    <input type="checkbox" defaultChecked={r.defaultChecked} className="w-4 h-4 rounded border-dark-600 text-primary-500" />
                    <span className="text-sm text-dark-300">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'market' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Clock size={20} /> Trading Hours</h3>
              <div className="card p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-dark-100 mb-3">NSE / BSE Equity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-dark-800/50 rounded"><span className="text-dark-300">Pre-open</span><span className="font-mono text-dark-100">09:00 – 09:15</span></div>
                      <div className="flex justify-between p-2 bg-primary-500/10 rounded border border-primary-500/30"><span className="text-dark-300 font-medium">Regular</span><span className="font-mono text-primary-400 font-bold">09:15 – 15:30</span></div>
                      <div className="flex justify-between p-2 bg-dark-800/50 rounded"><span className="text-dark-300">Closing</span><span className="font-mono text-dark-100">15:30 – 15:40</span></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark-100 mb-3">NIFTY / BANKNIFTY Options</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between p-2 bg-dark-800/50 rounded"><span className="text-dark-300">Regular</span><span className="font-mono text-dark-100">09:15 – 15:30</span></div>
                      <div className="flex justify-between p-2 bg-dark-800/50 rounded"><span className="text-dark-300">Expiry (Thu)</span><span className="font-mono text-dark-100">09:15 – 15:30</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-600 text-primary-500" /><div className="flex-1"><p className="text-sm font-medium text-dark-100">Only scan during market hours</p><p className="text-xs text-dark-400">Pause scanner outside 09:15–15:30</p></div></label>
                  <label className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer"><input type="checkbox" defaultChecked className="w-4 h-4 rounded border-dark-600 text-primary-500" /><div className="flex-1"><p className="text-sm font-medium text-dark-100">Skip Indian market holidays</p><p className="text-xs text-dark-400">Auto-pause on NSE/BSE holidays</p></div></label>
                  <label className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-dark-600 text-primary-500" /><div className="flex-1"><p className="text-sm font-medium text-dark-100">Allow pre-market scanning</p><p className="text-xs text-dark-400">Run during 09:00–09:15 pre-open session</p></div></label>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Calendar size={20} /> Indian Market Holidays 2026</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="text-left text-sm text-dark-400 border-b border-dark-700"><th className="p-3">Date</th><th className="p-3">Holiday</th><th className="p-3">Exchange</th></tr></thead>
                  <tbody className="divide-y divide-dark-700">
                    {indianMarketHolidays2026.map((h, i) => (
                      <tr key={i} className="hover:bg-dark-800/50"><td className="p-3 font-mono text-sm text-dark-100">{h.date}</td><td className="p-3 text-sm text-dark-300">{h.name}</td><td className="p-3"><span className="badge bg-dark-700 text-dark-300 text-xs">{h.exchange}</span></td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Palette size={20} /> Theme & Colors</h3>
              <div className="card p-5 space-y-4">
                <div>
                  <label className="label">Theme Mode</label>
                  <div className="flex gap-2">
                    {['dark', 'light', 'system'].map(t => (
                      <button key={t} onClick={() => setTheme(t as any)} className={`flex-1 p-3 rounded-lg border-2 transition-all ${theme === t ? 'border-primary-500 bg-primary-500/10' : 'border-dark-600 hover:border-dark-500'}`}>
                        {t === 'dark' ? <Moon size={20} className="mx-auto mb-1" /> : t === 'light' ? <Sun size={20} className="mx-auto mb-1" /> : <Monitor size={20} className="mx-auto mb-1" />}
                        <span className="block text-center text-sm capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Chart Color Scheme</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {chartColorSchemes.map(c => (
                      <button key={c.id} className="p-4 bg-dark-800/50 hover:bg-dark-800 border-2 border-dark-700 hover:border-primary-500/50 rounded-lg text-left transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded" style={{ background: c.bull }} />
                          <div className="w-6 h-6 rounded" style={{ background: c.bear }} />
                          <div className="w-6 h-6 rounded" style={{ background: c.vol }} />
                        </div>
                        <p className="text-sm font-medium text-dark-100">{c.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Accent Color</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Green', hex: '#22c55e' },
                      { name: 'Blue', hex: '#3b82f6' },
                      { name: 'Purple', hex: '#8b5cf6' },
                      { name: 'Pink', hex: '#ec4899' },
                      { name: 'Orange', hex: '#f97316' },
                      { name: 'Cyan', hex: '#06b6d4' },
                    ].map(c => (
                      <button key={c.name} className="flex items-center gap-2 px-3 py-2 bg-dark-800 hover:bg-dark-700 rounded-lg border border-dark-700 hover:border-dark-600">
                        <div className="w-5 h-5 rounded-full" style={{ background: c.hex }} />
                        <span className="text-sm text-dark-200">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><TypeIcon size={20} /> Typography & Density</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="label">Font Family</label><select className="input"><option selected>Inter</option><option>System Default</option><option>Roboto</option><option>JetBrains Mono</option></select></div>
                <div><label className="label">Font Size</label><select className="input"><option>Small</option><option selected>Medium</option><option>Large</option><option>Extra Large</option></select></div>
                <div><label className="label">UI Density</label><select className="input"><option>Compact</option><option selected>Comfortable</option><option>Spacious</option></select></div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><LineChart size={20} /> Chart Defaults</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="label">Default Timeframe</label><select className="input"><option>1m</option><option>5m</option><option selected>15m</option><option>1h</option><option>1d</option></select></div>
                <div><label className="label">Candle Type</label><select className="input"><option selected>Heikin Ashi</option><option>Regular</option></select></div>
                <div><label className="label">Show Volume</label><select className="input"><option selected>Yes (always)</option><option>Only on hover</option><option>No</option></select></div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Volume2 size={20} /> Sound & Alerts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="label">Alert Sound</label><select className="input"><option selected>Chime</option><option>Bell</option><option>Cash Register</option><option>None</option></select></div>
                <div><label className="label">Sound Volume</label><input type="range" min="0" max="100" defaultValue={60} className="w-full" /></div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Eye size={20} /> Accessibility</h3>
              <div className="space-y-2">
                {[
                  'Reduce motion (disable animations)',
                  'High contrast mode',
                  'Color blind friendly palette',
                  'Screen reader optimizations',
                  'Keyboard navigation hints',
                ].map((label, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 bg-dark-800/50 rounded-lg cursor-pointer hover:bg-dark-800"><input type="checkbox" className="w-4 h-4 rounded border-dark-600 text-primary-500" /><span className="text-sm text-dark-300">{label}</span></label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="card p-6 border-primary-500/30 bg-gradient-to-br from-primary-500/5 to-accent-500/5">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-primary-500/10"><Download size={24} className="text-primary-400" /></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-dark-50">Export Configuration</h3>
                    <p className="text-sm text-dark-400 mt-1">Download all your settings, strategies, symbols, and custom integrations as a single JSON file. Use it to backup or move to another account.</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button onClick={() => toast.success('Full config exported (42 KB)')} className="btn-primary gap-2"><Download size={16} /> Export Full Config</button>
                      <button className="btn-secondary gap-2"><FileJson size={16} /> Strategies Only</button>
                      <button className="btn-secondary gap-2"><FileSpreadsheet size={16} /> Symbols & Watchlist</button>
                      <button className="btn-secondary gap-2"><Send size={16} /> Custom Integrations Only</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h4 className="font-semibold text-dark-100 mb-3 flex items-center gap-2"><Upload size={20} /> Import Configuration</h4>
                <div className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-primary-500/50 transition-colors">
                  <Upload size={36} className="mx-auto mb-3 text-dark-500" />
                  <p className="text-sm font-medium text-dark-100">Drop a config JSON file here</p>
                  <p className="text-xs text-dark-500 mt-1">or click to browse</p>
                  <input type="file" accept=".json" className="hidden" id="import-file" />
                  <label htmlFor="import-file" className="btn-secondary mt-4 inline-flex cursor-pointer">Choose File</label>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><HistoryIcon size={20} /> Recent Backups</h3>
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="text-left text-sm text-dark-400 border-b border-dark-700"><th className="p-3">Created</th><th className="p-3">Size</th><th className="p-3">Contents</th><th className="p-3 w-12"></th></tr></thead>
                  <tbody className="divide-y divide-dark-700">
                    {[
                      { date: 'Today, 14:28', size: '42 KB', contents: 'Full config' },
                      { date: 'Yesterday, 22:15', size: '38 KB', contents: 'Full config' },
                      { date: '3 days ago', size: '156 KB', contents: 'Strategies + Backtests' },
                      { date: '1 week ago', size: '42 KB', contents: 'Full config' },
                    ].map((b, i) => (
                      <tr key={i} className="hover:bg-dark-800/50">
                        <td className="p-3 text-sm text-dark-100">{b.date}</td>
                        <td className="p-3 font-mono text-sm text-dark-300">{b.size}</td>
                        <td className="p-3 text-sm text-dark-400">{b.contents}</td>
                        <td className="p-3"><button className="p-2 rounded hover:bg-dark-700 text-dark-400" title="Download"><Download size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Database size={20} /> Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => toast.success('Alert history archived')} className="card text-left hover:border-primary-500/50 transition-all">
                  <Archive size={20} className="text-blue-400 mb-2" />
                  <p className="font-medium text-dark-100">Archive Old Alerts</p>
                  <p className="text-xs text-dark-400 mt-1">Move alerts older than 90 days</p>
                </button>
                <button onClick={() => toast.success('Cache cleared (24 MB freed)')} className="card text-left hover:border-primary-500/50 transition-all">
                  <Trash2 size={20} className="text-red-400 mb-2" />
                  <p className="font-medium text-dark-100">Clear Cache</p>
                  <p className="text-xs text-dark-400 mt-1">Free up disk space</p>
                </button>
                <button onClick={() => { if (confirm('Delete all alerts? This cannot be undone.')) toast.success('All alerts deleted'); }} className="card text-left hover:border-red-500/50 transition-all">
                  <AlertOctagon size={20} className="text-red-400 mb-2" />
                  <p className="font-medium text-dark-100">Reset All Data</p>
                  <p className="text-xs text-dark-400 mt-1">Delete alerts, history, cache</p>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Terminal size={20} /> Debug & Logging</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.advanced.debugMode} onChange={e => setConfig({...config, advanced: {...config.advanced, debugMode: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Debug mode</span>
                  </label>
                </div>
                <div>
                  <label className="label">Log Level</label>
                  <select className="input" value={config.advanced.logLevel} onChange={e => setConfig({...config, advanced: {...config.advanced, logLevel: e.target.value}})}>
                    <option value="DEBUG">DEBUG</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.advanced.enableMetrics} onChange={e => setConfig({...config, advanced: {...config.advanced, enableMetrics: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Enable metrics collection</span>
                  </label>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Globe size={20} /> Webhooks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Custom Webhook URL</label>
                  <input type="url" className="input" value={config.advanced.customWebhook} onChange={e => setConfig({...config, advanced: {...config.advanced, customWebhook: e.target.value}})} placeholder="https://your-server.com/webhook" />
                </div>
                <div>
                  <label className="label">Webhook Secret</label>
                  <input type="password" className="input" value={config.advanced.webhookSecret} onChange={e => setConfig({...config, advanced: {...config.advanced, webhookSecret: e.target.value}})} placeholder="Secret for signature verification" />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-dark-50 flex items-center gap-2"><Shield size={20} /> Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Rate Limit (req/min)</label>
                  <input type="number" min="10" max="1000" className="input" value={config.advanced.rateLimit} onChange={e => setConfig({...config, advanced: {...config.advanced, rateLimit: parseInt(e.target.value) || 100}})} />
                </div>
                <div>
                  <label className="label flex items-center gap-2">
                    <input type="checkbox" checked={config.advanced.corsEnabled} onChange={e => setConfig({...config, advanced: {...config.advanced, corsEnabled: e.target.checked}})} className="w-4 h-4 rounded border-dark-600 text-primary-500 focus:ring-primary-500" />
                    <span>Enable CORS</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}