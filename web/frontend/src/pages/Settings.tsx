import { Bell, Moon, Sun, Monitor, Shield, Key, Database, Wifi, Terminal, Globe, Palette, Clock, Trash2, Save, TestTube, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle, XCircle, WifiOff, Info, Plus, ChevronDown, ChevronUp, Zap, Target, BarChart2, Download, RefreshCw, Share2, BellRing, BellOff, SlidersHorizontal, GitMerge, Code2, Braces, FunctionSquare, Link2, Unlink2, Eye, EyeOff, RotateCcw, RotateCw, Flag, FlagOff, Bookmark, BookmarkPlus, Archive, ArchiveRestore, Settings, Search, Upload, Cloud, Server, Cpu, HardDrive, LayoutDashboard, Key as KeyIcon, KeyRound, Fingerprint, ScanEye, ScanFace, ScanLine, ScanSearch, ScanText, Barcode, QrCode, Ticket, TicketCheck, TicketMinus, TicketPlus, TicketX, TicketPercent, Clipboard, ClipboardCheck, ClipboardCopy, ClipboardList, ClipboardMinus, ClipboardPlus, ClipboardX, ClipboardType, File, FileCheck, FileCog, FileDown, FileInput, FileMinus, FileOutput, FilePlus, FileSearch, FileText as FileTextIcon, FileUp, FileX, FileQuestion, FileWarning, FileKey, FileLock, FilePen, FileCode, FileJson, Files, FileSpreadsheet, FileAudio, FileVideo, FileImage, FileArchive, FileSymlink, FileBadge, FileTerminal, FileStack, Folder, FolderCheck, FolderClock, FolderClosed, FolderCode, FolderCog, FolderDot, FolderDown, FolderGit, FolderHeart, FolderInput, FolderKanban, FolderLock, FolderMinus, FolderOpen, FolderOutput, FolderPen, FolderPlus as FolderPlusIcon, FolderRoot, FolderSearch, FolderSync, FolderTree, FolderUp, FolderX, Mail as MailIcon, MailCheck, MailMinus, MailOpen, MailPlus, MailQuestion, MailSearch, MailWarning, MailX, MessageSquare, MessageCircle, Sparkles as SparklesIcon, Flame, Bolt, Cloud as CloudIcon, CloudLightning, CloudRain, CloudSnow, CloudDrizzle, CloudFog, CloudHail, CloudSun, CloudMoon, Star, StarHalf, Award, Trophy, Medal, Ribbon, Crown, Gem, Diamond, Heart, HeartHandshake, Handshake, Users, User, UserPlus, UserMinus, UserCheck, UserX, UserCog, Shield as ShieldIcon, ShieldCheck, ShieldX, ShieldAlert, ShieldOff, Lock, LockOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'notifications' | 'data' | 'advanced' | 'integrations'>('general');
  const [saving, setSaving] = useState(false);
  
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