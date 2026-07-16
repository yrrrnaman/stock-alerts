"""
Data Provider - Fetches and caches market data
Supports yfinance (free, delayed) and extensible for Kite Connect
"""

import asyncio
import os
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

import pandas as pd
import yfinance as yf
from loguru import logger

from src.config import Config, DataConfig, SymbolsConfig


class DataCache:
    """File-based cache for market data"""
    
    def __init__(self, cache_dir: str, ttl_seconds: int):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl_seconds = ttl_seconds
    
    def _cache_path(self, symbol: str, timeframe: str) -> Path:
        safe_symbol = symbol.replace(".", "_").replace("/", "_")
        return self.cache_dir / f"{safe_symbol}_{timeframe}.parquet"
    
    def get(self, symbol: str, timeframe: str) -> Optional[pd.DataFrame]:
        path = self._cache_path(symbol, timeframe)
        if not path.exists():
            return None
        
        # Check TTL
        mtime = path.stat().st_mtime
        if time.time() - mtime > self.ttl_seconds:
            logger.debug(f"Cache expired for {symbol} {timeframe}")
            return None
        
        try:
            df = pd.read_parquet(path)
            logger.debug(f"Cache hit: {symbol} {timeframe} ({len(df)} rows)")
            return df
        except Exception as e:
            logger.warning(f"Cache read failed for {symbol} {timeframe}: {e}")
            return None
    
    def set(self, symbol: str, timeframe: str, df: pd.DataFrame) -> None:
        path = self._cache_path(symbol, timeframe)
        try:
            df.to_parquet(path)
            logger.debug(f"Cached: {symbol} {timeframe} ({len(df)} rows)")
        except Exception as e:
            logger.warning(f"Cache write failed for {symbol} {timeframe}: {e}")


class YFinanceProvider:
    """Yahoo Finance data provider (free, 15-20 min delayed)"""
    
    # yfinance interval mapping
    INTERVAL_MAP = {
        "1m": "1m",
        "2m": "2m",
        "5m": "5m",
        "15m": "15m",
        "30m": "30m",
        "60m": "60m",
        "90m": "90m",
        "1h": "1h",
        "1d": "1d",
        "5d": "5d",
        "1wk": "1wk",
        "1mo": "1mo",
        "3mo": "3mo",
    }
    
    # Max period for each interval (yfinance limits)
    MAX_PERIOD = {
        "1m": "7d",
        "2m": "60d",
        "5m": "60d",
        "15m": "60d",
        "30m": "60d",
        "60m": "730d",
        "90m": "60d",
        "1h": "730d",
        "1d": "max",
        "5d": "max",
        "1wk": "max",
        "1mo": "max",
        "3mo": "max",
    }
    
    def __init__(self, config: DataConfig):
        self.config = config
        self.cache = DataCache(config.cache_dir, config.cache_ttl_seconds)
    
    async def fetch(
        self, 
        symbol: str, 
        timeframe: str, 
        lookback: int
    ) -> Optional[pd.DataFrame]:
        """Fetch OHLCV data for a symbol/timeframe"""
        # Check cache first
        cached = self.cache.get(symbol, timeframe)
        if cached is not None and len(cached) >= lookback:
            return cached.tail(lookback)
        
        # Fetch from yfinance
        try:
            interval = self.INTERVAL_MAP.get(timeframe, "1d")
            period = self.MAX_PERIOD.get(interval, "max")
            
            logger.debug(f"Fetching {symbol} {timeframe} (interval={interval}, period={period})")
            
            # Run in executor to avoid blocking
            loop = asyncio.get_event_loop()
            ticker = yf.Ticker(symbol)
            df = await loop.run_in_executor(
                None,
                lambda: ticker.history(period=period, interval=interval, auto_adjust=True)
            )
            
            if df.empty:
                logger.warning(f"No data returned for {symbol} {timeframe}")
                return None
            
            # Standardize columns
            df = df.rename(columns={
                "Open": "open",
                "High": "high",
                "Low": "low",
                "Close": "close",
                "Volume": "volume"
            })
            
            # Keep only OHLCV
            df = df[["open", "high", "low", "close", "volume"]]
            df.index.name = "timestamp"
            
            # Cache it
            self.cache.set(symbol, timeframe, df)
            
            return df.tail(lookback)
            
        except Exception as e:
            logger.error(f"Error fetching {symbol} {timeframe}: {e}")
            return None
    
    async def fetch_multiple(
        self, 
        symbols: List[str], 
        timeframe: str, 
        lookback: int
    ) -> Dict[str, pd.DataFrame]:
        """Fetch data for multiple symbols concurrently"""
        tasks = [
            self.fetch(symbol, timeframe, lookback) 
            for symbol in symbols
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        data = {}
        for symbol, result in zip(symbols, results):
            if isinstance(result, Exception):
                logger.error(f"Error fetching {symbol}: {result}")
            elif result is not None:
                data[symbol] = result
        
        return data


class DataProvider:
    """Main data provider interface"""
    
    def __init__(self, config: Config):
        self.config = config
        self.symbols_config = config.symbols
        
        if config.data.provider == "yfinance":
            self.provider = YFinanceProvider(config.data)
        else:
            raise ValueError(f"Unknown data provider: {config.data.provider}")
    
    async def get_data(
        self, 
        symbol: str, 
        timeframe: str
    ) -> Optional[pd.DataFrame]:
        lookback = self.symbols_config.lookback_periods.get(timeframe, 100)
        return await self.provider.fetch(symbol, timeframe, lookback)
    
    async def get_all_data(
        self, 
        timeframe: str
    ) -> Dict[str, pd.DataFrame]:
        lookback = self.symbols_config.lookback_periods.get(timeframe, 100)
        return await self.provider.fetch_multiple(
            self.symbols_config.symbols,
            timeframe,
            lookback
        )
    
    async def get_multi_timeframe(
        self, 
        symbol: str
    ) -> Dict[str, pd.DataFrame]:
        """Get data for all configured timeframes for a symbol"""
        results = {}
        for tf in self.symbols_config.timeframes:
            df = await self.get_data(symbol, tf)
            if df is not None:
                results[tf] = df
        return results