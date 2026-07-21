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
from src.codex_analyzer import CodexAnalyzer, create_codex_analyzer_from_config


class StockAlertBot:
    """Main bot orchestrator"""
    
    def __init__(self, config: Config):
        self.config = config
        self.data_manager = DataManager(config)
        self.pattern_analyzer = PatternAnalyzer(config.patterns.model_dump())
        self.alert_manager = AlertManager(config)
        
        # Initialize Codex analyzer if enabled
        self.codex_analyzer = None
        if config.codex.get("enabled", False):
            try:
                codex_config = {
                    "openai_api_key": config.codex.get("api_key", ""),
                    "codex_model": config.codex.get("model", "gpt-4o"),
                    "codex_analyze_patterns": config.codex.get("analyze_patterns", True),
                    "codex_analyze_strategies": config.codex.get("analyze_strategies", True),
                    "codex_generate_alerts": config.codex.get("generate_alerts", True),
                }
                self.codex_analyzer = create_codex_analyzer_from_config(codex_config)
                logger.info("Codex AI analyzer initialized")
            except Exception as e:
                logger.warning(f"Failed to initialize Codex analyzer: {e}")
        
        # Stats
        self.stats = {
            "scans": 0,
            "signals_found": 0,
            "alerts_sent": 0,
            "errors": 0,
            "last_scan": None,
            "codex_calls": 0,
            "codex_errors": 0,
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
        
        # Enhance alerts with Codex if enabled
        if self.codex_analyzer and all_alerts:
            all_alerts = await self._enhance_with_codex(all_alerts, data)
        
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
    
    async def _enhance_with_codex(self, alerts: List[Dict], data: Dict) -> List[Dict]:
        """Enhance alerts with Codex AI analysis"""
        
        if not self.codex_analyzer:
            return alerts
        
        enhanced = []
        
        for alert in alerts:
            try:
                signal = alert["signal"]
                pattern = signal.get("pattern", "Unknown")
                symbol = alert["symbol"]
                timeframe = alert["timeframe"]
                
                # Prepare market context
                market_context = await self._get_market_context(symbol, timeframe, data)
                
                # Analyze with Codex
                if self.config.codex.get("analyze_patterns", True):
                    analysis = self.codex_analyzer.analyze_pattern(
                        symbol=symbol,
                        pattern_name=pattern,
                        pattern_data=self._extract_pattern_data(signal),
                        market_context=market_context,
                        timeframe=timeframe
                    )
                    
                    # Add Codex insights to alert
                    alert["codex_analysis"] = {
                        "summary": analysis.summary,
                        "recommendation": analysis.recommendation,
                        "confidence": analysis.confidence,
                        "risk_assessment": analysis.risk_assessment,
                        "key_signals": analysis.signals[:3],
                        "model": analysis.model_used
                    }
                    
                    self.stats["codex_calls"] += 1
                
            except Exception as e:
                logger.error(f"Codex enhancement failed for {alert['symbol']}: {e}")
                self.stats["codex_errors"] += 1
            
            enhanced.append(alert)
        
        return enhanced
    
    def _extract_pattern_data(self, signal: Dict) -> Dict:
        """Extract pattern data from signal for Codex analysis"""
        return {
            "open": signal.get("open", 0),
            "high": signal.get("high", 0),
            "low": signal.get("low", 0),
            "close": signal.get("close", 0) or signal.get("price", 0),
            "volume": signal.get("volume", 0),
            "confidence": signal.get("confidence", 0.5)
        }
    
    async def _get_market_context(self, symbol: str, timeframe: str, data: Dict) -> Dict:
        """Get market context for Codex analysis"""
        
        # Get index data
        nifty_data = data.get("^NSEI_1d") or data.get("^NSEI_1h")
        bank_nifty = data.get("^NSEBANK_1d") or data.get("^NSEBANK_1h")
        
        # Get sector performance from same timeframe data
        sector_perf = {}
        for key, df in data.items():
            if key.endswith(f"_{timeframe}") and len(df) > 0:
                sym = key.rsplit("_", 1)[0]
                if sym not in ["^NSEI", "^NSEBANK", "^NSEFIN", "^INDIAVIX"]:
                    change = ((df.iloc[-1]["close"] - df.iloc[-2]["close"]) / df.iloc[-2]["close"]) * 100
                    sector_perf[sym] = f"{change:+.2f}%"
        
        return {
            "nifty": f"{nifty_data.iloc[-1]['close']:.0f} ({sector_perf.get('^NSEI', 'N/A')})" if nifty_data is not None else "N/A",
            "bank_nifty": f"{bank_nifty.iloc[-1]['close']:.0f} ({sector_perf.get('^NSEBANK', 'N/A')})" if bank_nifty is not None else "N/A",
            "sector": sector_perf.get(symbol.split(".")[0], "N/A") if "." in symbol else "N/A",
            "trend": "Uptrend" if sector_perf.get(symbol.split(".")[0], "0").startswith("+") else "Downtrend",
            "volume": "Above average" if sector_perf else "N/A",
            "support": signal.get("support", "N/A"),
            "resistance": signal.get("resistance", "N/A")
        }
    
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