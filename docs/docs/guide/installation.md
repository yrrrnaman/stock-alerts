# Installation

Detailed installation instructions for different platforms.

## Prerequisites

### Python 3.10+
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install python3 python3-venv python3-pip

# macOS (Homebrew)
brew install python

# Windows
# Download from python.org
```

### TA-Lib (Optional but Recommended)
TA-Lib provides more accurate candlestick pattern detection than pandas-ta.

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install build-essential wget
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install
pip install TA-Lib
```

**macOS:**
```bash
brew install ta-lib
pip install TA-Lib
```

**Windows:**
```bash
# Install from pre-built wheel
pip install --only-binary :all: TA-Lib
# Or use conda: conda install -c conda-forge ta-lib
```

## Virtual Environment

```bash
# Create
python -m venv venv

# Activate
# Linux/macOS:
source venv/bin/activate
# Windows CMD:
venv\Scripts\activate
# Windows PowerShell:
venv\Scripts\Activate.ps1

# Verify
python --version
pip --version
```

## Install Dependencies

```bash
# Core dependencies
pip install -r requirements.txt

# Development dependencies (optional)
pip install -r requirements-dev.txt
```

## Verify Installation

```bash
# Quick test
python -c "import yfinance, pandas, pandas_ta, telegram; print('All imports OK')"

# Run single scan
python main.py --once
```

## Troubleshooting

### `ModuleNotFoundError: No module named 'talib'`
```bash
# Install TA-Lib system dependency first (see above), then:
pip install TA-Lib --no-binary :all:
```

### `yfinance` fails with JSON decode error
```bash
# Upgrade yfinance
pip install --upgrade yfinance
```

### Telegram `Unauthorized` error
- Verify `bot_token` in `config.local.yaml`
- Ensure bot is started (send `/start` to your bot)
- Check `chat_id` is correct (use @userinfobot)

### Permission denied on cache/logs
```bash
mkdir -p data/cache logs
chmod 755 data/cache logs
```

## Docker Installation (Alternative)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "main.py"]
```

```bash
# Build
docker build -t stock-alerts .

# Run
docker run -d \
  --name stock-alerts \
  -v $(pwd)/config.local.yaml:/app/config.local.yaml \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  stock-alerts
```

## Next Steps

- [Quick Start](/guide/quick-start) — Run your first scan
- [Telegram Setup](/guide/telegram-setup) — Configure bot and chat ID
- [Configuration](/config/overview) — Full config reference