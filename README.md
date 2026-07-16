# Stock Alert Bot 📈

Real-time Indian stock market (NSE/BSE) candlestick pattern alerts via Telegram. Built with Python, uses Yahoo Finance (free, delayed 15-20 min) or broker APIs (Zerodha Kite, Fyers, Upstox) for live data.

## Features

- **15+ Candlestick Patterns**: Hammer, Doji, Engulfing, Morning/Evening Star, Shooting Star, Harami, Three White Soldiers, and more
- **Technical Indicators**: RSI, MACD, EMA/SMA, Bollinger Bands, ATR, Volume analysis
- **Flexible Strategies**: Combine patterns + indicators in YAML config — no code changes needed
- **Multiple Timeframes**: 15m, 1h, 1d (configurable)
- **Telegram Alerts**: Rich formatted messages with optional chart screenshots
- **Deduplication**: Cooldown periods prevent spam
- **Scheduler**: Runs every 15 minutes (configurable)
- **Free Data Source**: Yahoo Finance by default, swap in broker APIs for real-time

## Quick Start

```bash
# Clone
git clone https://github.com/yrrrnaman/stock-alerts.git
cd stock-alerts

# Setup virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure (copy and edit with your Telegram bot token)
cp config.yaml config.local.yaml
# Edit config.local.yaml with your bot_token and chat_id

# Run
python main.py
```

## Telegram Setup

1. Create bot: Message [@BotFather](https://t.me/BotFather) → `/newbot` → copy token
2. Get chat ID: Message [@userinfobot](https://t.me/userinfobot) → copy ID
3. Add to `config.local.yaml`:
```yaml
telegram:
  bot_token: "YOUR_BOT_TOKEN"
  chat_id: "YOUR_CHAT_ID"
```

## Configuration

All settings in `config.yaml` (override in `config.local.yaml`):

| Section | Description |
|---------|-------------|
| `symbols` | Stock symbols (NSE format: `RELIANCE.NS`, `^NSEI` for Nifty) |
| `timeframes` | `15m`, `1h`, `1d` |
| `patterns.candlestick.patterns` | Enable/disable specific patterns |
| `patterns.indicators` | RSI, MACD, EMA, SMA, Bollinger settings |
| `patterns.strategies` | Combined pattern + indicator rules |
| `alerts` | Cooldown, chart inclusion, message template |
| `scheduler` | Interval, timezone, run on start |

## Example Strategy

```yaml
strategies:
  - name: "bullish_reversal"
    description: "Hammer + RSI oversold near support"
    timeframes: ["15m", "1h"]
    conditions:
      - pattern: "hammer"
      - indicator: "rsi"
        condition: "lt"
        value: 35
      - indicator: "price_vs_ema20"
        condition: "near"
        tolerance_pct: 1.0
```

## Supported Patterns

**Single Candle**: Hammer, Inverted Hammer, Doji, Shooting Star, Hanging Man  
**Two Candle**: Bullish/Bearish Engulfing, Piercing Line, Dark Cloud Cover, Harami  
**Three Candle**: Morning Star, Evening Star, Three White Soldiers, Three Black Crows

## Data Sources

| Source | Real-time | Cost | Setup |
|--------|-----------|------|-------|
| Yahoo Finance (default) | ❌ 15-20 min delay | Free | None |
| Zerodha Kite Connect | ✅ | ₹2000/mo | Broker account |
| Fyers API | ✅ | Free with account | Broker account |
| Upstox API | ✅ | Free with account | Broker account |

## Architecture

```
src/
├── config.py         # Pydantic config models
├── data.py           # Data fetching (yfinance, Kite, etc.)
├── patterns.py       # Pattern detection (TA-Lib + manual)
├── alerts.py         # Telegram alerts + charts
├── bot.py            # Main orchestrator
├── scheduler.py      # APScheduler integration
└── chart.py          # mplfinance chart generation
```

## Deploy

**Systemd Service** (Linux):
```ini
# /etc/systemd/system/stock-alerts.service
[Unit]
Description=Stock Alert Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/stock-alerts
ExecStart=/home/ubuntu/stock-alerts/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Docker**:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

## Documentation

Full docs at: **https://yrrrnaman.github.io/stock-alerts/**

## License

MIT License - feel free to use and modify.

---

**Built with** Python, TA-Lib, yfinance, python-telegram-bot, APScheduler, mplfinance