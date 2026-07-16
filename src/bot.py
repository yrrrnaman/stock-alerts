"""
Main Bot Logic - Orchestrates data fetching, pattern analysis, and alerting
"""

import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from loguru import logger

from src.config import Config
from src.data import DataManager
from src.patterns import PatternAnalyzer, TechnicalIndicators
from src.alerts import AlertManager


class StockAlertBot:
    """Main bot orchestrator"""
    
    def __init__(self, config: Config):
        self.config = config
        self.data_manager = DataManager(config)
        self.pattern_analyzer = PatternAnalyzer(config.patterns.model_dump())
        self.alert_manager = AlertManager(config)
        
        # Stats
        self.stats = {
            "scans": 0,
            "signals_found": 0,
            "alerts_sent": 0,
            "errors": 0,
            "last_scan": None,
        }
    
    async def scan_all(self) -> List[Dict[str, Any]]:
        """Run a full scan across all symbols and timeframes"""
        logger.info("Starting market scan...")
        start_time = datetime.now()
        
        # Fetch all data
        data = await self.data_manager.get_data()
        if not data:
            logger.warning("No data fetched")
            return []
        
        logger.info(f"Fetched data for {len(data)} symbol/timeframe combinations")
        
        # Analyze each symbol/timeframe
        all_alerts = []
        
        for key, df in data.items():
            try:
                # Parse key: "SYMBOL_TIMEFRAME"
                parts = key.rsplit("_", 1)
                if len(parts) != 2:
                    continue
                symbol, timeframe = parts
                
                # Run pattern analysis
                signals = await self._analyze_symbol(symbol, timeframe, df)
                
                for signal in signals:
                    alert = {
                        "symbol": symbol,
                        "timeframe": timeframe,
                        "signal": signal,
                    }
                    all_alerts.append(alert)
                    self.stats["signals_found"] += 1
                    
            except Exception as e:
                logger.error(f"Error analyzing {key}: {e}")
                self.stats["errors"] += 1
        
        # Send alerts
        if all_alerts:
            sent = await self.alert_manager.send_bulk(all_alerts, data)
            self.stats["alerts_sent"] += sent
            logger.info(f"Sent {sent}/{len(all_alerts)} alerts")
        else:
            logger.info("No signals found in this scan")
        
        # Update stats
        self.stats["scans"] += 1
        self.stats["last_scan"] = datetime.now()
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"Scan completed in {elapsed:.1f}s | Signals: {len(all_alerts)}")
        
        return all_alerts
    
    async def _analyze_symbol(
        self, 
        symbol: str, 
        timeframe: str, 
        df: Any
    ) -> List[Dict[str, Any]]:
        """Analyze a single symbol/timeframe for signals"""
        
        if df is None or len(df) < 50:
            return []
        
        # Calculate indicators and detect patterns
        analyzed_df = self.pattern_analyzer.analyze(df.copy())
        
        # Check configured strategies
        signals = self.pattern_analyzer.check_strategies(analyzed_df, timeframe)
        
        # Also check individual strong patterns (without full strategy)
        pattern_signals = self._check_strong_patterns(analyzed_df, timeframe)
        signals.extend(pattern_signals)
        
        return signals
    
    def _check_strong_patterns(
        self, 
        df: Any, 
        timeframe: str
    ) -> List[Dict[str, Any]]:
        """Check for strong individual candlestick patterns"""
        
        signals = []
        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else latest
        
        # Strong reversal patterns that warrant alerts on their own
        strong_patterns = {
            "bullish_engulfing": "bullish",
            "bearish_engulfing": "bearish",
            "hammer": "bullish",
            "inverted_hammer": "bullish",
            "shooting_star": "bearish",
            "hanging_man": "bearish",
            "morning_star": "bullish",
            "evening_star": "bearish",
            "three_white_soldiers": "bullish",
            "three_black_crows": "bearish",
            "piercing_line": "bullish",
            "dark_cloud_cover": "bearish",
        }
        
        for pattern, direction in strong_patterns.items():
            col = f"pattern_{pattern}"
            if col in latest and latest[col]:
                # Additional confirmation for higher timeframes
                if timeframe in ["1h", "1d"]:
                    # Require some confirmation (volume, RSI, trend)
                    if not self._has_confirmation(latest, direction):
                        continue
                
                signals.append({
                    "pattern": pattern,
                    "direction": direction,
                    "price": latest["close"],
                    "timestamp": df.index[-1],
                    "details": {pattern: f"Detected on {timeframe}"}
                })
        
        return signals
    
    def _has_confirmation(self, latest: Any, direction: str) -> bool:
        """Check for additional confirmation"""
        
        # Volume confirmation
        if latest.get("volume_ratio", 1) > 1.2:
            return True
        
        # RSI confirmation
        rsi = latest.get("rsi", 50)
        if direction == "bullish" and rsi < 40:
            return True
        if direction == "bearish" and rsi > 60:
            return True
        
        # Trend confirmation (price vs EMA20)
        pct_vs_ema = latest.get("price_vs_ema20", 0)
        if direction == "bullish" and pct_vs_ema > -1:  # Near or above EMA20
            return True
        if direction == "bearish" and pct_vs_ema < 1:  # Near or below EMA20
            return True
        
        return False
    
    async def scan_symbol(self, symbol: str, timeframes: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Scan a specific symbol across timeframes"""
        timeframes = timeframes or self.config.symbols.timeframes
        alerts = []
        
        for tf in timeframes:
            df = await self.data_manager.get_symbol_data(symbol, tf)
            if df is not None:
                signals = await self._analyze_symbol(symbol, tf, df)
                for signal in signals:
                    alerts.append({
                        "symbol": symbol,
                        "timeframe": tf,
                        "signal": signal
                    })
        
        return alerts
    
    def get_stats(self) -> Dict[str, Any]:
        """Get bot statistics"""
        return self.stats.copy()
    
    async def close(self) -> None:
        """Cleanup"""
        await self.alert_manager.close()
        logger.info("Bot closed")


async def test_bot():
    """Quick test"""
    from src.config import Config
    
    config = Config.load("config.yaml")
    bot = StockAlertBot(config)
    
    # Test single symbol
    alerts = await bot.scan_symbol("RELIANCE.NS", ["15m", "1h"])
    print(f"Found {len(alerts)} alerts")
    for a in alerts:
        print(f"  {a['symbol']} {a['timeframe']}: {a['signal']}")
    
    await bot.close()


if __name__ == "__main__":
    asyncio.run(test_bot())