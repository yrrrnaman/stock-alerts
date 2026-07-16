"""
Real-time Data Providers for Indian Stock Market
Supports: Zerodha Kite Connect, Fyers, Upstox, Angel One
"""

import asyncio
import json
import time
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass
from loguru import logger

try:
    import websockets
    WS_AVAILABLE = True
except ImportError:
    WS_AVAILABLE = False
    logger.warning("websockets not available, real-time streaming disabled")


@dataclass
class TickData:
    """Single tick data point"""
    symbol: str
    timestamp: datetime
    ltp: float  # Last traded price
    ltq: int    # Last traded quantity
    volume: int
    bid_price: float = 0
    bid_qty: int = 0
    ask_price: float = 0
    ask_qty: int = 0
    oi: int = 0  # Open interest
    change: float = 0
    change_pct: float = 0


@dataclass
class CandleData:
    """OHLCV candle"""
    symbol: str
    timeframe: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int


class BaseRealTimeProvider(ABC):
    """Abstract base class for real-time data providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.connected = False
        self.subscriptions: Dict[str, List[Callable]] = {}
        self.tick_callbacks: List[Callable[[TickData], None]] = []
        self.candle_callbacks: List[Callable[[CandleData], None]] = []
    
    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection"""
        pass
    
    @abstractmethod
    async def disconnect(self) -> None:
        """Close connection"""
        pass
    
    @abstractmethod
    async def subscribe(self, symbols: List[str], mode: str = "full") -> bool:
        """Subscribe to symbols (mode: ltp, quote, full)"""
        pass
    
    @abstractmethod
    async def unsubscribe(self, symbols: List[str]) -> bool:
        """Unsubscribe from symbols"""
        pass
    
    @abstractmethod
    async def get_historical(
        self, 
        symbol: str, 
        timeframe: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> List[CandleData]:
        """Get historical candles"""
        pass
    
    def on_tick(self, callback: Callable[[TickData], None]) -> None:
        """Register tick callback"""
        self.tick_callbacks.append(callback)
    
    def on_candle(self, callback: Callable[[CandleData], None]) -> None:
        """Register candle callback"""
        self.candle_callbacks.append(callback)
    
    def _emit_tick(self, tick: TickData) -> None:
        for cb in self.tick_callbacks:
            try:
                cb(tick)
            except Exception as e:
                logger.error(f"Tick callback error: {e}")
    
    def _emit_candle(self, candle: CandleData) -> None:
        for cb in self.candle_callbacks:
            try:
                cb(candle)
            except Exception as e:
                logger.error(f"Candle callback error: {e}")


class KiteConnectProvider(BaseRealTimeProvider):
    """Zerodha Kite Connect WebSocket Provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key")
        self.access_token = config.get("access_token")
        self.ws_url = "wss://ws.kite.trade"
        self.ws = None
        self._reconnect_task = None
        self._heartbeat_task = None
        
        # Instrument token mapping (symbol -> token)
        self.instrument_tokens: Dict[str, int] = {}
        self.token_to_symbol: Dict[int, str] = {}
    
    async def connect(self) -> bool:
        if not WS_AVAILABLE:
            logger.error("websockets library required for Kite Connect")
            return False
        
        if not self.api_key or not self.access_token:
            logger.error("Kite Connect: api_key and access_token required")
            return False
        
        try:
            url = f"{self.ws_url}?api_key={self.api_key}&access_token={self.access_token}"
            self.ws = await websockets.connect(url, ping_interval=20, ping_timeout=10)
            self.connected = True
            logger.info("Kite Connect WebSocket connected")
            
            # Start message handler
            asyncio.create_task(self._handle_messages())
            
            # Resubscribe if needed
            if self.subscriptions:
                await self._resubscribe()
            
            return True
        except Exception as e:
            logger.error(f"Kite Connect connection failed: {e}")
            self.connected = False
            return False
    
    async def disconnect(self) -> None:
        self.connected = False
        if self.ws:
            await self.ws.close()
            self.ws = None
        if self._reconnect_task:
            self._reconnect_task.cancel()
        logger.info("Kite Connect disconnected")
    
    async def _handle_messages(self) -> None:
        """Handle incoming WebSocket messages"""
        try:
            async for message in self.ws:
                if isinstance(message, bytes):
                    await self._parse_binary_message(message)
                else:
                    await self._parse_text_message(message)
        except Exception as e:
            logger.error(f"WebSocket message handler error: {e}")
            self.connected = False
            # Attempt reconnect
            asyncio.create_task(self._reconnect())
    
    async def _parse_binary_message(self, data: bytes) -> None:
        """Parse Kite Connect binary protocol"""
        # Kite Connect uses binary protocol - simplified parsing
        # Full implementation would use kiteconnect library's parsing
        pass
    
    async def _parse_text_message(self, message: str) -> None:
        """Parse text messages (heartbeat, etc.)"""
        try:
            msg = json.loads(message)
            if msg.get("type") == "heartbeat":
                return
        except:
            pass
    
    async def subscribe(self, symbols: List[str], mode: str = "full") -> bool:
        if not self.connected or not self.ws:
            logger.warning("Not connected, queuing subscription")
            for s in symbols:
                if s not in self.subscriptions:
                    self.subscriptions[s] = []
            return False
        
        # Convert symbols to instrument tokens
        tokens = []
        for symbol in symbols:
            token = await self._get_instrument_token(symbol)
            if token:
                tokens.append(token)
                self.token_to_symbol[token] = symbol
            else:
                logger.warning(f"Unknown symbol: {symbol}")
        
        if not tokens:
            return False
        
        # Kite Connect subscription message
        msg = {
            "a": "subscribe",
            "v": tokens
        }
        
        if mode == "ltp":
            msg["m"] = "ltp"
        elif mode == "quote":
            msg["m"] = "quote"
        else:
            msg["m"] = "full"
        
        try:
            await self.ws.send(json.dumps(msg))
            for s in symbols:
                if s not in self.subscriptions:
                    self.subscriptions[s] = []
            logger.info(f"Subscribed to {len(tokens)} symbols ({mode})")
            return True
        except Exception as e:
            logger.error(f"Subscribe failed: {e}")
            return False
    
    async def unsubscribe(self, symbols: List[str]) -> bool:
        if not self.connected or not self.ws:
            return False
        
        tokens = [self.instrument_tokens.get(s) for s in symbols if s in self.instrument_tokens]
        if not tokens:
            return True
        
        msg = {"a": "unsubscribe", "v": tokens}
        try:
            await self.ws.send(json.dumps(msg))
            for s in symbols:
                self.subscriptions.pop(s, None)
            logger.info(f"Unsubscribed from {len(tokens)} symbols")
            return True
        except Exception as e:
            logger.error(f"Unsubscribe failed: {e}")
            return False
    
    async def _get_instrument_token(self, symbol: str) -> Optional[int]:
        """Get instrument token for symbol (cached or fetch)"""
        if symbol in self.instrument_tokens:
            return self.instrument_tokens[symbol]
        
        # Would fetch from instruments API in real implementation
        # For now, return None to indicate unknown
        logger.warning(f"Instrument token not cached for {symbol}")
        return None
    
    async def _resubscribe(self) -> None:
        """Resubscribe to previously subscribed symbols"""
        if self.subscriptions:
            symbols = list(self.subscriptions.keys())
            await self.subscribe(symbols, "full")
    
    async def _reconnect(self) -> None:
        """Attempt reconnection with exponential backoff"""
        for attempt in range(5):
            wait = 2 ** attempt
            logger.info(f"Reconnecting in {wait}s (attempt {attempt + 1}/5)")
            await asyncio.sleep(wait)
            if await self.connect():
                return
        logger.error("Failed to reconnect after 5 attempts")
    
    async def get_historical(
        self, 
        symbol: str, 
        timeframe: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> List[CandleData]:
        """Get historical data via Kite Connect REST API"""
        # Would use kiteconnect library's historical_data method
        # Placeholder implementation
        logger.warning("Historical data not implemented for Kite Connect provider")
        return []


class FyersProvider(BaseRealTimeProvider):
    """Fyers API WebSocket Provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.client_id = config.get("client_id")
        self.access_token = config.get("access_token")
        self.ws_url = "wss://api-t1.fyers.in/socket/v2"
        self.ws = None
    
    async def connect(self) -> bool:
        if not WS_AVAILABLE:
            logger.error("websockets library required for Fyers")
            return False
        
        if not self.client_id or not self.access_token:
            logger.error("Fyers: client_id and access_token required")
            return False
        
        try:
            url = f"{self.ws_url}?token={self.access_token}&client_id={self.client_id}"
            self.ws = await websockets.connect(url)
            self.connected = True
            logger.info("Fyers WebSocket connected")
            asyncio.create_task(self._handle_messages())
            return True
        except Exception as e:
            logger.error(f"Fyers connection failed: {e}")
            return False
    
    async def disconnect(self) -> None:
        self.connected = False
        if self.ws:
            await self.ws.close()
            self.ws = None
    
    async def _handle_messages(self) -> None:
        try:
            async for message in self.ws:
                data = json.loads(message)
                await self._parse_message(data)
        except Exception as e:
            logger.error(f"Fyers message handler error: {e}")
            self.connected = False
    
    async def _parse_message(self, data: Dict) -> None:
        """Parse Fyers WebSocket message"""
        if data.get("type") == "sf":  # Symbol feed
            for tick_data in data.get("data", []):
                tick = TickData(
                    symbol=tick_data.get("symbol", ""),
                    timestamp=datetime.now(),
                    ltp=tick_data.get("ltp", 0),
                    ltq=tick_data.get("ltq", 0),
                    volume=tick_data.get("vol", 0),
                    bid_price=tick_data.get("bid_price", 0),
                    bid_qty=tick_data.get("bid_qty", 0),
                    ask_price=tick_data.get("ask_price", 0),
                    ask_qty=tick_data.get("ask_qty", 0),
                    oi=tick_data.get("oi", 0),
                )
                self._emit_tick(tick)
    
    async def subscribe(self, symbols: List[str], mode: str = "full") -> bool:
        if not self.connected or not self.ws:
            return False
        
        # Fyers subscription format
        msg = {
            "type": "subscribe",
            "symbols": symbols,
            "data_type": "symbolData" if mode != "ltp" else "ltp"
        }
        
        try:
            await self.ws.send(json.dumps(msg))
            logger.info(f"Fyers subscribed to {len(symbols)} symbols")
            return True
        except Exception as e:
            logger.error(f"Fyers subscribe failed: {e}")
            return False
    
    async def unsubscribe(self, symbols: List[str]) -> bool:
        if not self.connected or not self.ws:
            return False
        
        msg = {"type": "unsubscribe", "symbols": symbols}
        try:
            await self.ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Fyers unsubscribe failed: {e}")
            return False
    
    async def get_historical(
        self, 
        symbol: str, 
        timeframe: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> List[CandleData]:
        logger.warning("Historical data not implemented for Fyers provider")
        return []


class UpstoxProvider(BaseRealTimeProvider):
    """Upstox API WebSocket Provider (v3)"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.access_token = config.get("access_token")
        self.ws_url = "wss://api.upstox.com/v2/feed/websocket"
        self.ws = None
    
    async def connect(self) -> bool:
        if not WS_AVAILABLE:
            logger.error("websockets library required for Upstox")
            return False
        
        if not self.access_token:
            logger.error("Upstox: access_token required")
            return False
        
        try:
            url = f"{self.ws_url}?api-version=2.0&authorization={self.access_token}"
            self.ws = await websockets.connect(url)
            self.connected = True
            logger.info("Upstox WebSocket connected")
            asyncio.create_task(self._handle_messages())
            return True
        except Exception as e:
            logger.error(f"Upstox connection failed: {e}")
            return False
    
    async def disconnect(self) -> None:
        self.connected = False
        if self.ws:
            await self.ws.close()
            self.ws = None
    
    async def _handle_messages(self) -> None:
        try:
            async for message in self.ws:
                # Upstox uses protobuf - would need protobuf parsing
                logger.debug(f"Upstox message received: {len(message)} bytes")
        except Exception as e:
            logger.error(f"Upstox message handler error: {e}")
            self.connected = False
    
    async def subscribe(self, symbols: List[str], mode: str = "full") -> bool:
        logger.warning("Upstox subscribe not fully implemented")
        return False
    
    async def unsubscribe(self, symbols: List[str]) -> bool:
        return False
    
    async def get_historical(
        self, 
        symbol: str, 
        timeframe: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> List[CandleData]:
        return []


class MockRealTimeProvider(BaseRealTimeProvider):
    """Mock provider for testing - simulates real-time ticks from yfinance"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.symbols: List[str] = []
        self._running = False
        self._task = None
    
    async def connect(self) -> bool:
        self.connected = True
        self._running = True
        self._task = asyncio.create_task(self._simulate_ticks())
        logger.info("Mock real-time provider connected")
        return True
    
    async def disconnect(self) -> None:
        self.connected = False
        self._running = False
        if self._task:
            self._task.cancel()
    
    async def subscribe(self, symbols: List[str], mode: str = "full") -> bool:
        self.symbols = symbols
        logger.info(f"Mock provider subscribed to {symbols}")
        return True
    
    async def unsubscribe(self, symbols: List[str]) -> bool:
        self.symbols = [s for s in self.symbols if s not in symbols]
        return True
    
    async def _simulate_ticks(self) -> None:
        """Generate mock ticks for subscribed symbols"""
        import yfinance as yf
        import random
        
        last_prices = {}
        
        while self._running and self.symbols:
            try:
                for symbol in self.symbols:
                    # Get latest price from yfinance (delayed)
                    try:
                        ticker = yf.Ticker(symbol)
                        hist = ticker.history(period="1d", interval="1m")
                        if not hist.empty:
                            last_price = float(hist["Close"].iloc[-1])
                            
                            # Add small random variation
                            variation = random.uniform(-0.002, 0.002)
                            price = last_price * (1 + variation)
                            
                            if symbol in last_prices:
                                change = price - last_prices[symbol]
                                change_pct = (change / last_prices[symbol]) * 100
                            else:
                                change = 0
                                change_pct = 0
                            
                            last_prices[symbol] = price
                            
                            tick = TickData(
                                symbol=symbol,
                                timestamp=datetime.now(),
                                ltp=round(price, 2),
                                ltq=random.randint(1, 100),
                                volume=random.randint(1000, 100000),
                                change=round(change, 2),
                                change_pct=round(change_pct, 2)
                            )
                            self._emit_tick(tick)
                    except Exception as e:
                        logger.debug(f"Mock tick error for {symbol}: {e}")
                
                await asyncio.sleep(5)  # Update every 5 seconds
            except Exception as e:
                logger.error(f"Mock tick simulation error: {e}")
                await asyncio.sleep(10)
    
    async def get_historical(
        self, 
        symbol: str, 
        timeframe: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> List[CandleData]:
        return []


def create_provider(provider_type: str, config: Dict[str, Any]) -> BaseRealTimeProvider:
    """Factory function to create real-time provider"""
    providers = {
        "kite": KiteConnectProvider,
        "fyers": FyersProvider,
        "upstox": UpstoxProvider,
        "mock": MockRealTimeProvider,
    }
    
    provider_class = providers.get(provider_type.lower())
    if not provider_class:
        raise ValueError(f"Unknown provider: {provider_type}. Available: {list(providers.keys())}")
    
    return provider_class(config)