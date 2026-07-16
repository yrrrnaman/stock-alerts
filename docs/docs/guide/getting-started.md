# Getting Started

Welcome to **Stock Alert Bot** — a Python tool that monitors Indian stocks (NSE/BSE) for candlestick patterns and technical signals, then sends formatted alerts to Telegram.

## What You'll Need

| Requirement | Details |
|-------------|---------|
| **Python** | 3.10+ (3.11+ recommended) |
| **Telegram Bot** | Create via [@BotFather](https://t.me/BotFather) |
| **Chat ID** | Get from [@userinfobot](https://t.me/userinfobot) |
| **Data Source** | Free: Yahoo Finance (delayed) · Paid: Kite Connect, Fyers, Upstox |

## Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/stock-alerts.git
cd stock-alerts

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Optional: Install TA-Lib for better pattern detection
# Linux: sudo apt-get install ta-lib && pip install TA-Lib
# Mac: brew install ta-lib && pip install TA-Lib
```

## Configuration

```bash
# Copy example config
cp config.yaml config.local.yaml

# Edit with your settings
nano config.local.yaml
```

**Minimum required in `config.local.yaml`:**
```yaml
telegram:
  bot_token: "YOUR_BOT_TOKEN_FROM_BOTFATHER"
  chat_id: "YOUR_CHAT_ID_FROM_USERINFOBOT"
```

## Quick Test

```bash
# Run once to verify everything works
python main.py --once

# Or run continuously
python main.py
```

You should receive a startup message in Telegram, followed by any pattern matches on the next scan.

## Project Structure

```
stock-alerts/
├── config.yaml           # Default configuration (don't edit)
├── config.local.yaml     # Your secrets & overrides (gitignored)
├── main.py              # Entry point
├── requirements.txt     # Python dependencies
├── src/
│   ├── config.py        # Configuration loading
│   ├── data.py          # Data fetching (yfinance, Kite, etc.)
│   ├── patterns.py      # Pattern detection & strategies
│   ├── alerts.py        # Telegram alerts & charts
│   └── scheduler.py     # Periodic scanning
├── data/
│   └── cache/           # Parquet cache files
├── logs/
│   └── stock_alerts.log
└── docs/                # This documentation
```

## Next Steps

- [Installation Details](/guide/installation) — Detailed setup for each OS
- [Quick Start](/guide/quick-start) — Run your first scan in 2 minutes
- [Telegram Setup](/guide/telegram-setup) — Bot creation and chat ID
- [Data Sources](/guide/data-yfinance) — Choose your market data provider