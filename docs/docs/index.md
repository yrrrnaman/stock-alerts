---
layout: home
hero:
  name: Stock Alert Bot
  text: Real-time Indian Stock Pattern Alerts
  tagline: Monitor NSE/BSE candlestick patterns and technical signals → Get instant Telegram notifications
  image:
    src: /logo.svg
    alt: Stock Alert Bot
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/yourusername/stock-alerts
features:
  - title: Real-time Pattern Detection
    details: Detect 15+ candlestick patterns (hammer, doji, engulfing, morning star, etc.) across multiple timeframes
  - title: Technical Indicators
    details: Built-in RSI, MACD, EMA/SMA, Bollinger Bands, ATR, Volume analysis for signal confirmation
  - title: Flexible Strategies
    details: Combine patterns + indicators in YAML config — no code changes needed for new strategies
  - title: Free Data Source
    details: Uses Yahoo Finance (yfinance) by default — zero cost, delayed 15-20 min. Swap in Kite/Fyers for live data
  - title: Telegram Alerts
    details: Rich formatted messages with optional chart screenshots, deduplication, and cooldown controls
  - title: Extensible Architecture
    details: Clean Python codebase — add custom patterns, data sources, or delivery channels easily
---

## Quick Example

```yaml
# config.yaml
symbols:
  - "RELIANCE.NS"
  - "TCS.NS"
  - "NIFTY50.NS"
timeframes: ["15m", "1h", "1d"]

patterns:
  candlestick:
    patterns: ["hammer", "bullish_engulfing", "morning_star"]
  strategies:
    - name: "bullish_reversal"
      conditions:
        - pattern: "hammer"
        - indicator: "rsi"
          condition: "lt"
          value: 35
```

```bash
# Install & run
pip install -r requirements.txt
cp config.yaml config.local.yaml  # Add your Telegram bot token
python main.py
```

## Why Stock Alert Bot?

| Feature | Stock Alert Bot | TradingView Alerts | Custom Scripts |
|---------|----------------|-------------------|----------------|
| **Cost** | Free (yfinance) | Free tier limited | Free |
| **Real-time** | Via broker API | Webhook delay | Your infra |
| **Patterns** | 15+ built-in | Limited free | Manual |
| **Indicators** | RSI, MACD, EMA, BB | Basic | Manual |
| **Strategies** | YAML config | Pine Script | Code |
| **Telegram** | Native + charts | Webhook only | Manual |
| **Backtest** | Planned | Paid | Manual |

## Next Steps

- 📖 [Getting Started](/guide/getting-started) — Install and run in 5 minutes
- ⚙️ [Configuration](/config/overview) — Full config reference
- 🕯️ [Patterns](/patterns/overview) — All supported candlestick patterns
- 🎯 [Strategies](/strategies/overview) — Build powerful combined signals