"""
Technical Analysis - Pattern Detection and Indicators
Uses TA-Lib for pattern recognition, manual implementations for indicators
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Any, Tuple
from loguru import logger

try:
    import talib
    TALIB_AVAILABLE = True
except ImportError:
    TALIB_AVAILABLE = False
    logger.warning("TA-Lib not available, using manual implementations only")


class TechnicalIndicators:
    """Calculate technical indicators on OHLCV data using manual implementations"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
    
    def calculate_all(self, df: pd.DataFrame) -> pd.DataFrame:
        """Add all configured indicators to dataframe"""
        df = df.copy()
        
        # RSI
        if self.config.get("rsi", {}).get("enabled", True):
            period = self.config["rsi"].get("period", 14)
            df["rsi"] = self._rsi(df["close"], period)
        
        # MACD
        if self.config.get("macd", {}).get("enabled", True):
            fast = self.config["macd"].get("fast", 12)
            slow = self.config["macd"].get("slow", 26)
            signal = self.config["macd"].get("signal", 9)
            macd_line, signal_line, histogram = self._macd(df["close"], fast, slow, signal)
            df["macd"] = macd_line
            df["macd_signal"] = signal_line
            df["macd_hist"] = histogram
        
        # EMAs
        if self.config.get("ema", {}).get("enabled", True):
            for period in self.config["ema"].get("periods", [9, 20, 50, 200]):
                df[f"ema_{period}"] = self._ema(df["close"], period)
        
        # SMAs
        if self.config.get("sma", {}).get("enabled", True):
            for period in self.config["sma"].get("periods", [20, 50, 200]):
                df[f"sma_{period}"] = self._sma(df["close"], period)
        
        # Bollinger Bands
        if self.config.get("bollinger", {}).get("enabled", True):
            period = self.config["bollinger"].get("period", 20)
            std = self.config["bollinger"].get("std_dev", 2)
            upper, middle, lower = self._bollinger_bands(df["close"], period, std)
            df["bb_upper"] = upper
            df["bb_middle"] = middle
            df["bb_lower"] = lower
            df["bb_width"] = (upper - lower) / middle
        
        # ATR (for volatility)
        df["atr"] = self._atr(df["high"], df["low"], df["close"], 14)
        
        # Volume indicators
        df["volume_sma_20"] = self._sma(df["volume"], 20)
        df["volume_ratio"] = df["volume"] / df["volume_sma_20"]
        
        # Price vs EMAs (for trend detection)
        if "ema_20" in df.columns:
            df["price_vs_ema20"] = (df["close"] - df["ema_20"]) / df["ema_20"] * 100
        if "ema_50" in df.columns:
            df["price_vs_ema50"] = (df["close"] - df["ema_50"]) / df["ema_50"] * 100
        
        # 20-day high/low for breakout detection
        df["high_20"] = df["high"].rolling(20).max()
        df["low_20"] = df["low"].rolling(20).min()
        df["breakout_20_high"] = df["close"] > df["high_20"].shift(1)
        df["breakdown_20_low"] = df["close"] < df["low_20"].shift(1)
        
        return df
    
    def _sma(self, series: pd.Series, period: int) -> pd.Series:
        """Simple Moving Average"""
        return series.rolling(window=period, min_periods=period).mean()
    
    def _ema(self, series: pd.Series, period: int) -> pd.Series:
        """Exponential Moving Average"""
        return series.ewm(span=period, adjust=False, min_periods=period).mean()
    
    def _rsi(self, series: pd.Series, period: int = 14) -> pd.Series:
        """Relative Strength Index"""
        delta = series.diff()
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        avg_gain = gain.ewm(alpha=1/period, adjust=False, min_periods=period).mean()
        avg_loss = loss.ewm(alpha=1/period, adjust=False, min_periods=period).mean()
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def _macd(self, series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """MACD - returns (macd_line, signal_line, histogram)"""
        ema_fast = self._ema(series, fast)
        ema_slow = self._ema(series, slow)
        macd_line = ema_fast - ema_slow
        signal_line = self._ema(macd_line, signal)
        histogram = macd_line - signal_line
        return macd_line, signal_line, histogram
    
    def _bollinger_bands(self, series: pd.Series, period: int = 20, std: float = 2) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """Bollinger Bands - returns (upper, middle, lower)"""
        middle = self._sma(series, period)
        rolling_std = series.rolling(window=period, min_periods=period).std()
        upper = middle + (rolling_std * std)
        lower = middle - (rolling_std * std)
        return upper, middle, lower
    
    def _atr(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """Average True Range"""
        prev_close = close.shift(1)
        tr1 = high - low
        tr2 = (high - prev_close).abs()
        tr3 = (low - prev_close).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        return tr.ewm(alpha=1/period, adjust=False, min_periods=period).mean()


class CandlestickPatterns:
    """Detect candlestick patterns using TA-Lib or manual implementations"""
    
    # TA-Lib pattern names
    TALIB_PATTERNS = {
        "hammer": "CDLHAMMER",
        "inverted_hammer": "CDLINVERTEDHAMMER",
        "doji": "CDLDOJI",
        "bullish_engulfing": "CDLENGULFING",
        "bearish_engulfing": "CDLENGULFING",  # Same function, sign determines direction
        "morning_star": "CDLMORNINGSTAR",
        "evening_star": "CDLEVENINGSTAR",
        "shooting_star": "CDLSHOOTINGSTAR",
        "hanging_man": "CDLHANGINGMAN",
        "piercing_line": "CDLPIERCING",
        "dark_cloud_cover": "CDLDARKCLOUDCOVER",
        "harami_bullish": "CDLHARAMI",
        "harami_bearish": "CDLHARAMI",
        "three_white_soldiers": "CDL3WHITESOLDIERS",
        "three_black_crows": "CDL3BLACKCROWS",
    }
    
    # Pattern direction: 1 = bullish, -1 = bearish, 0 = neutral/both
    PATTERN_DIRECTION = {
        "hammer": 1,
        "inverted_hammer": 1,
        "doji": 0,
        "bullish_engulfing": 1,
        "bearish_engulfing": -1,
        "morning_star": 1,
        "evening_star": -1,
        "shooting_star": -1,
        "hanging_man": -1,
        "piercing_line": 1,
        "dark_cloud_cover": -1,
        "harami_bullish": 1,
        "harami_bearish": -1,
        "three_white_soldiers": 1,
        "three_black_crows": -1,
    }
    
    def __init__(self, enabled_patterns: List[str]):
        self.enabled_patterns = enabled_patterns
        self.use_talib = TALIB_AVAILABLE
    
    def detect(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """Detect all enabled patterns, return dict of pattern_name -> boolean Series"""
        results = {}
        
        if self.use_talib:
            results = self._detect_talib(df)
        else:
            results = self._detect_manual_all(df)
        
        # Filter to only enabled patterns
        return {k: v for k, v in results.items() if k in self.enabled_patterns}
    
    def _detect_talib(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """Use TA-Lib for pattern detection"""
        results = {}
        
        open_ = df["open"].values
        high = df["high"].values
        low = df["low"].values
        close = df["close"].values
        
        for pattern_name, talib_name in self.TALIB_PATTERNS.items():
            if pattern_name not in self.enabled_patterns:
                continue
            
            try:
                func = getattr(talib, talib_name)
                result = func(open_, high, low, close)
                
                # Convert to boolean series (non-zero = pattern detected)
                # For engulfing/harami, direction matters
                if pattern_name in ["bullish_engulfing", "harami_bullish"]:
                    results[pattern_name] = pd.Series(result > 0, index=df.index)
                elif pattern_name in ["bearish_engulfing", "harami_bearish"]:
                    results[pattern_name] = pd.Series(result < 0, index=df.index)
                else:
                    results[pattern_name] = pd.Series(result != 0, index=df.index)
                    
            except Exception as e:
                logger.warning(f"TA-Lib pattern {pattern_name} failed: {e}")
                results[pattern_name] = pd.Series(False, index=df.index)
        
        return results
    
    def _detect_manual_all(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """Manual detection for all patterns"""
        results = {}
        for pattern in self.enabled_patterns:
            results[pattern] = self._detect_manual(df, pattern)
        return results
    
    def _detect_manual(self, df: pd.DataFrame, pattern: str) -> pd.Series:
        """Manual pattern detection"""
        o, h, l, c = df["open"], df["high"], df["low"], df["close"]
        prev_o, prev_c = o.shift(1), c.shift(1)
        prev_h, prev_l = h.shift(1), l.shift(1)
        
        body = abs(c - o)
        upper_shadow = h - np.maximum(c, o)
        lower_shadow = np.minimum(c, o) - l
        total_range = h - l
        total_range = total_range.replace(0, np.nan)
        
        if pattern == "hammer":
            # Small body, long lower shadow (>2x body), little/no upper shadow
            cond = (
                (body > 0) &
                (lower_shadow > 2 * body) &
                (upper_shadow < 0.1 * body) &
                (c > o)  # Bullish hammer
            )
        elif pattern == "inverted_hammer":
            # Small body, long upper shadow (>2x body), little/no lower shadow
            cond = (
                (body > 0) &
                (upper_shadow > 2 * body) &
                (lower_shadow < 0.1 * body) &
                (c > o)  # Bullish inverted hammer
            )
        elif pattern == "doji":
            # Open ≈ Close (body very small relative to range)
            cond = (body / total_range < 0.1) & (total_range > 0)
        elif pattern == "bullish_engulfing":
            cond = (
                (prev_c < prev_o) &  # Previous bearish
                (c > o) &  # Current bullish
                (o <= prev_c) &  # Opens at or below prev close
                (c >= prev_o)  # Closes at or above prev open
            )
        elif pattern == "bearish_engulfing":
            cond = (
                (prev_c > prev_o) &  # Previous bullish
                (c < o) &  # Current bearish
                (o >= prev_c) &  # Opens at or above prev close
                (c <= prev_o)  # Closes at or below prev open
            )
        elif pattern == "morning_star":
            # Three candles: bearish, small body (star), bullish closing above midpoint of first
            c1, c2, c3 = c.shift(2), c.shift(1), c
            o1, o2, o3 = o.shift(2), o.shift(1), o
            cond = (
                (c1 < o1) &  # First bearish
                (abs(c2 - o2) < (h.shift(1) - l.shift(1)) * 0.3) &  # Second small body
                (c3 > o3) &  # Third bullish
                (c3 > (o1 + c1) / 2)  # Closes above midpoint of first
            )
        elif pattern == "evening_star":
            # Three candles: bullish, small body (star), bearish closing below midpoint of first
            c1, c2, c3 = c.shift(2), c.shift(1), c
            o1, o2, o3 = o.shift(2), o.shift(1), o
            cond = (
                (c1 > o1) &  # First bullish
                (abs(c2 - o2) < (h.shift(1) - l.shift(1)) * 0.3) &  # Second small body
                (c3 < o3) &  # Third bearish
                (c3 < (o1 + c1) / 2)  # Closes below midpoint of first
            )
        elif pattern == "shooting_star":
            # Small body, long upper shadow, little/no lower shadow, bearish
            cond = (
                (body > 0) &
                (upper_shadow > 2 * body) &
                (lower_shadow < 0.1 * body) &
                (c < o)  # Bearish
            )
        elif pattern == "hanging_man":
            # Small body, long lower shadow (>2x body), little/no upper shadow, bearish
            cond = (
                (body > 0) &
                (lower_shadow > 2 * body) &
                (upper_shadow < 0.1 * body) &
                (c < o)  # Bearish
            )
        elif pattern == "piercing_line":
            cond = (
                (prev_c < prev_o) &  # Previous bearish
                (c > o) &  # Current bullish
                (o < prev_c) &  # Opens below prev close
                (c > (prev_o + prev_c) / 2) &  # Closes above prev midpoint
                (c < prev_o)  # But below prev open
            )
        elif pattern == "dark_cloud_cover":
            cond = (
                (prev_c > prev_o) &  # Previous bullish
                (c < o) &  # Current bearish
                (o > prev_c) &  # Opens above prev close
                (c < (prev_o + prev_c) / 2) &  # Closes below prev midpoint
                (c > prev_o)  # But above prev open
            )
        elif pattern == "harami_bullish":
            cond = (
                (prev_c < prev_o) &  # Previous bearish (large body)
                (c > o) &  # Current bullish (small body)
                (o > prev_c) &  # Opens inside prev body
                (c < prev_o) &  # Closes inside prev body
                (body < abs(prev_c - prev_o) * 0.5)  # Current body < 50% of prev
            )
        elif pattern == "harami_bearish":
            cond = (
                (prev_c > prev_o) &  # Previous bullish (large body)
                (c < o) &  # Current bearish (small body)
                (o < prev_c) &  # Opens inside prev body
                (c > prev_o) &  # Closes inside prev body
                (body < abs(prev_c - prev_o) * 0.5)  # Current body < 50% of prev
            )
        elif pattern == "three_white_soldiers":
            c1, c2, c3 = c.shift(2), c.shift(1), c
            o1, o2, o3 = o.shift(2), o.shift(1), o
            cond = (
                (c1 > o1) & (c2 > o2) & (c3 > o3) &  # All bullish
                (c2 > c1) & (c3 > c2) &  # Higher closes
                (o2 > o1) & (o3 > o2) &  # Higher opens
                (c1 > o1 * 1.005) & (c2 > o2 * 1.005) & (c3 > o3 * 1.005)
            )
        elif pattern == "three_black_crows":
            c1, c2, c3 = c.shift(2), c.shift(1), c
            o1, o2, o3 = o.shift(2), o.shift(1), o
            cond = (
                (c1 < o1) & (c2 < o2) & (c3 < o3) &  # All bearish
                (c2 < c1) & (c3 < c2) &  # Lower closes
                (o2 < o1) & (o3 < o2) &  # Lower opens
                (c1 < o1 * 0.995) & (c2 < o2 * 0.995) & (c3 < o3 * 0.995)
            )
        else:
            cond = pd.Series(False, index=df.index)
        
        return cond.fillna(False)
    
    def get_pattern_direction(self, pattern: str) -> int:
        """Get pattern direction: 1=bullish, -1=bearish, 0=neutral"""
        return self.PATTERN_DIRECTION.get(pattern, 0)


class PatternAnalyzer:
    """High-level pattern analysis combining candlesticks and indicators"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.indicators = TechnicalIndicators(config.get("indicators", {}))
        self.patterns = CandlestickPatterns(config.get("candlestick", {}).get("patterns", []))
        self.strategies = config.get("strategies", [])
    
    def analyze(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run all indicators and patterns on dataframe"""
        df = self.indicators.calculate_all(df)
        pattern_results = self.patterns.detect(df)
        
        # Add pattern columns to dataframe
        for pattern_name, series in pattern_results.items():
            df[f"pattern_{pattern_name}"] = series
        
        return df
    
    def check_strategies(
        self, 
        df: pd.DataFrame, 
        timeframe: str
    ) -> List[Dict[str, Any]]:
        """Check all configured strategies against the data"""
        signals = []
        
        for strategy in self.strategies:
            if timeframe not in strategy.get("timeframes", []):
                continue
            
            signal = self._check_strategy(df, strategy)
            if signal:
                signals.append(signal)
        
        return signals
    
    def _check_strategy(
        self, 
        df: pd.DataFrame, 
        strategy: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Check a single strategy's conditions on latest candle"""
        conditions = strategy.get("conditions", [])
        if not conditions:
            return None
        
        latest = df.iloc[-1]
        prev = df.iloc[-2] if len(df) > 1 else latest
        
        all_met = True
        details = {}
        
        for cond in conditions:
            met, detail = self._check_condition(latest, prev, df, cond)
            details[cond.get("indicator", cond.get("pattern", "unknown"))] = detail
            if not met:
                all_met = False
                break
        
        if all_met:
            return {
                "strategy": strategy["name"],
                "description": strategy.get("description", ""),
                "direction": self._get_strategy_direction(strategy),
                "details": details,
                "price": latest["close"],
                "timestamp": df.index[-1],
            }
        
        return None
    
    def _check_condition(
        self, 
        latest: pd.Series, 
        prev: pd.Series, 
        df: pd.DataFrame,
        cond: Dict[str, Any]
    ) -> Tuple[bool, str]:
        """Check a single condition"""
        # Pattern condition
        if "pattern" in cond:
            patterns = cond["pattern"] if isinstance(cond["pattern"], list) else [cond["pattern"]]
            for p in patterns:
                col = f"pattern_{p}"
                if col in latest and latest[col]:
                    direction = self.patterns.get_pattern_direction(p)
                    return True, f"{p} detected ({'bullish' if direction > 0 else 'bearish' if direction < 0 else 'neutral'})"
            return False, f"No matching pattern: {patterns}"
        
        # Indicator conditions
        indicator = cond.get("indicator")
        condition = cond.get("condition")
        value = cond.get("value")
        multiplier = cond.get("multiplier", 1.0)
        tolerance = cond.get("tolerance_pct", 0)
        
        if indicator == "rsi":
            rsi = latest.get("rsi", 50)
            if condition == "lt":
                met = rsi < value
                return met, f"RSI={rsi:.1f} {'<' if met else '>='} {value}"
            elif condition == "gt":
                met = rsi > value
                return met, f"RSI={rsi:.1f} {'>' if met else '<='} {value}"
        
        elif indicator == "price_vs_ema20":
            pct = latest.get("price_vs_ema20", 0)
            if condition == "gt":
                met = pct > 0
                return met, f"Price vs EMA20: {pct:.2f}%"
            elif condition == "lt":
                met = pct < 0
                return met, f"Price vs EMA20: {pct:.2f}%"
            elif condition == "near":
                met = abs(pct) <= tolerance
                return met, f"Price near EMA20: {pct:.2f}% (tolerance: {tolerance}%)"
        
        elif indicator == "volume_spike":
            ratio = latest.get("volume_ratio", 1)
            met = ratio >= multiplier
            return met, f"Volume ratio: {ratio:.2f}x (threshold: {multiplier}x)"
        
        elif indicator == "breakout_20d_high":
            met = latest.get("breakout_20_high", False)
            return met, f"Breakout 20d high: {met}"
        
        elif indicator == "macd_bullish_cross":
            met = (latest.get("macd", 0) > latest.get("macd_signal", 0)) and \
                  (prev.get("macd", 0) <= prev.get("macd_signal", 0))
            return met, f"MACD bullish cross: {met}"
        
        elif indicator == "macd_bearish_cross":
            met = (latest.get("macd", 0) < latest.get("macd_signal", 0)) and \
                  (prev.get("macd", 0) >= prev.get("macd_signal", 0))
            return met, f"MACD bearish cross: {met}"
        
        return False, f"Unknown condition: {indicator} {condition}"
    
    def _get_strategy_direction(self, strategy: Dict[str, Any]) -> str:
        """Determine overall strategy direction"""
        for cond in strategy.get("conditions", []):
            if "pattern" in cond:
                patterns = cond["pattern"] if isinstance(cond["pattern"], list) else [cond["pattern"]]
                for p in patterns:
                    direction = self.patterns.get_pattern_direction(p)
                    if direction != 0:
                        return "bullish" if direction > 0 else "bearish"
        return "neutral"