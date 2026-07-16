"""
Data Manager - High-level data fetching and management
"""

import asyncio
from typing import Dict, List, Optional, Any
from loguru import logger

from src.config import Config
from src.data_provider import DataProvider, YFinanceProvider


class DataManager:
    """Manages data fetching for all symbols and timeframes"""
    
    def __init__(self, config: Config):
        self.config = config
        self.provider = DataProvider(config)
    
    async def get_data(self) -> Dict[str, Any]:
        """Fetch data for all symbols and timeframes"""
        results = {}
        
        for timeframe in self.config.symbols.timeframes:
            logger.debug(f"Fetching {timeframe} data for {len(self.config.symbols.symbols)} symbols")
            tf_data = await self.provider.get_all_data(timeframe)
            
            for symbol, df in tf_data.items():
                key = f"{symbol}_{timeframe}"
                results[key] = df
        
        return results
    
    async def get_symbol_data(
        self, 
        symbol: str, 
        timeframe: str
    ) -> Optional[Any]:
        """Get data for a single symbol/timeframe"""
        return await self.provider.get_data(symbol, timeframe)
    
    async def get_multi_timeframe(self, symbol: str) -> Dict[str, Any]:
        """Get all timeframes for a symbol"""
        return await self.provider.get_multi_timeframe(symbol)