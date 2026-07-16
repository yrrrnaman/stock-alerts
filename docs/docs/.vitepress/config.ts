import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Stock Alert Bot',
  description: 'Real-time Indian stock market candlestick pattern alerts via Telegram',
  lang: 'en-US',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#1a73e8' }],
    ['meta', { property: 'og:title', content: 'Stock Alert Bot' }],
    ['meta', { property: 'og:description', content: 'Real-time Indian stock market candlestick pattern alerts via Telegram' }],
    ['meta', { property: 'og:type', content: 'website' }],
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Stock Alert Bot',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Configuration', link: '/config/overview' },
      { text: 'Patterns', link: '/patterns/overview' },
      { text: 'Strategies', link: '/strategies/overview' },
      { text: 'API Reference', link: '/api/overview' },
      { text: 'GitHub', link: 'https://github.com/yourusername/stock-alerts' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Telegram Setup', link: '/guide/telegram-setup' },
          ],
        },
        {
          text: 'Running',
          items: [
            { text: 'Local Development', link: '/guide/local-dev' },
            { text: 'Production Deploy', link: '/guide/production' },
            { text: 'Docker', link: '/guide/docker' },
            { text: 'Systemd Service', link: '/guide/systemd' },
          ],
        },
        {
          text: 'Data Sources',
          items: [
            { text: 'Yahoo Finance (Free)', link: '/guide/data-yfinance' },
            { text: 'Zerodha Kite Connect', link: '/guide/data-kite' },
            { text: 'Fyers API', link: '/guide/data-fyers' },
            { text: 'Upstox API', link: '/guide/data-upstox' },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Overview', link: '/config/overview' },
            { text: 'config.yaml Reference', link: '/config/reference' },
            { text: 'Environment Variables', link: '/config/env-vars' },
            { text: 'Local Overrides', link: '/config/local-overrides' },
          ],
        },
      ],
      '/patterns/': [
        {
          text: 'Candlestick Patterns',
          items: [
            { text: 'Overview', link: '/patterns/overview' },
            { text: 'Single Candle', link: '/patterns/single-candle' },
            { text: 'Two Candle', link: '/patterns/two-candle' },
            { text: 'Three Candle', link: '/patterns/three-candle' },
            { text: 'Custom Patterns', link: '/patterns/custom' },
          ],
        },
      ],
      '/strategies/': [
        {
          text: 'Strategies',
          items: [
            { text: 'Overview', link: '/strategies/overview' },
            { text: 'Built-in Strategies', link: '/strategies/built-in' },
            { text: 'Creating Custom Strategies', link: '/strategies/custom' },
            { text: 'Combining Patterns + Indicators', link: '/strategies/combining' },
            { text: 'Examples', link: '/strategies/examples' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/overview' },
            { text: 'Config', link: '/api/config' },
            { text: 'Data Provider', link: '/api/data-provider' },
            { text: 'Pattern Analyzer', link: '/api/pattern-analyzer' },
            { text: 'Alert Manager', link: '/api/alert-manager' },
            { text: 'Scheduler', link: '/api/scheduler' },
          ],
        },
      ],
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/stock-alerts' },
      { icon: 'telegram', link: 'https://t.me/yourbot' },
    ],
    
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Naman',
    },
    
    editLink: {
      pattern: 'https://github.com/yourusername/stock-alerts/edit/main/docs/docs/:path',
      text: 'Edit this page on GitHub',
    },
    
    lastUpdated: true,
    lastUpdatedText: 'Last updated',
    
    search: {
      provider: 'local',
    },
  },
  
  markdown: {
    theme: 'github-dark',
    lineNumbers: true,
  },
  
  buildDir: '../dist',
  outDir: '../dist',
})