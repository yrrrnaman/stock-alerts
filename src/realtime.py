"""
Real-time Data Providers for Indian Stock Market
Supports: Zerodha Kite Connect, Fyers, Upstox, Angel One, Mock
"""

import asyncio
import json
import time
import hmac
import hashlib
import base64
from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable, Set
from dataclasses import dataclass, field
from urllib.parse import urlencode
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
    token: str
    timestamp: datetime
    ltp: float                    # Last traded price
    ltq: int = 0                  # Last traded quantity
    volume: int = 0               # Total volume
    bid_price: float = 0.0
    bid_qty: int = 0
    ask_price: float = 0.0
    ask_qty: int = 0
    oi: int = 0                   # Open interest
    oi_day_high: int = 0
    oi_day_low: int = 0
    change: float = 0.0
    change_pct: float = 0.0
    high: float = 0.0
    low: float = 0.0
    open: float = 0.0
    close: float = 0.0
    avg_price: float = 0.0
    total_buy_qty: int = 0
    total_sell_qty: int = 0


@dataclass
class CandleData:
    """OHLCV candle"""
    symbol: str
    token: str
    timeframe: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    oi: int = 0


@dataclass
class InstrumentInfo:
    """Instrument metadata"""
    token: str
    symbol: str
    name: str
    exchange: str
    segment: str
    instrument_type: str
    lot_size: int = 1
    tick_size: float = 0.05
    expiry: Optional[datetime] = None
    strike: float = 0.0
    option_type: str = ""


class BaseRealTimeProvider(ABC):
    """Abstract base class for real-time data providers"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.connected = False
        self.connecting = False
        self._ws = None
        self._subscriptions: Set[str] = set()
        self._token_to_symbol: Dict[str, str] = {}
        self._symbol_to_token: Dict[str, str] = {}
        self._tick_callbacks: List[Callable[[TickData], None]] = []
        self._candle_callbacks: List[Callable[[CandleData], None]] = []
        self._connection_callbacks: List[Callable[[bool], None]] = []
        self._reconnect_task: Optional[asyncio.Task] = None
        self._heartbeat_task: Optional[asyncio.Task] = None
        self._message_queue: asyncio.Queue = asyncio.Queue()
        self._last_heartbeat = time.time()
    
    @abstractmethod
    async def _connect_impl(self) -> bool:
        """Implementation-specific connection logic"""
        pass
    
    @abstractmethod
    async def _disconnect_impl(self) -> None:
        """Implementation-specific disconnection logic"""
        pass
    
    @abstractmethod
    async def _subscribe_impl(self, symbols: List[str], mode: str) -> bool:
        """Implementation-specific subscription"""
        pass
    
    @abstractmethod
    async def _unsubscribe_impl(self, symbols: List[str]) -> bool:
        """Implementation-specific unsubscription"""
        pass
    
    @abstractmethod
    async def _handle_message(self, message: Any) -> None:
        """Handle incoming WebSocket message"""
        pass
    
    async def connect(self) -> bool:
        """Connect to the real-time feed"""
        if self.connected or self.connecting:
            return self.connected
        
        self.connecting = True
        try:
            success = await self._connect_impl()
            self.connected = success
            self.connecting = False
            
            if success:
                logger.info(f"{self.__class__.__name__} connected")
                await self._start_heartbeat()
                await self._notify_connection(True)
                
                # Resubscribe to previous subscriptions
                if self._subscriptions:
                    await self._subscribe_impl(list(self._subscriptions), self.config.get("mode", "full"))
            else:
                await self._notify_connection(False)
            
            return success
        except Exception as e:
            logger.error(f"{self.__class__.__name__} connection failed: {e}")
            self.connected = False
            self.connecting = False
            await self._notify_connection(False)
            return False
    
    async def disconnect(self) -> None:
        """Disconnect from the real-time feed"""
        self.connected = False
        
        if self._heartbeat_task:
            self._heartbeat_task.cancel()
            self._heartbeat_task = None
        
        if self._reconnect_task:
            self._reconnect_task.cancel()
            self._reconnect_task = None
        
        await self._disconnect_impl()
        await self._notify_connection(False)
        logger.info(f"{self.__class__.__name__} disconnected")
    
    async def subscribe(self, symbols: List[str], mode: str = "full") -> bool:
        """Subscribe to real-time data for symbols"""
        if not self.connected:
            logger.warning("Not connected, queueing subscription")
            self._subscriptions.update(symbols)
            return False
        
        # Map symbols to tokens
        tokens = []
        for symbol in symbols:
            token = self._symbol_to_token.get(symbol)
            if token:
                tokens.append(token)
                self._token_to_symbol[token] = symbol
            else:
                logger.warning(f"Unknown symbol: {symbol}")
        
        if not tokens:
            return False
        
        success = await self._subscribe_impl(symbols, mode)
        if success:
            self._subscriptions.update(symbols)
        return success
    
    async def unsubscribe(self, symbols: List[str]) -> bool:
        """Unsubscribe from symbols"""
        if not self.connected:
            self._subscriptions.difference_update(symbols)
            return True
        
        success = await self._unsubscribe_impl(symbols)
        if success:
            self._subscriptions.difference_update(symbols)
        return success
    
    async def get_historical(
        self, 
        symbol: str, 
        timeframe: str, 
        from_date: datetime, 
        to_date: datetime
    ) -> List[CandleData]:
        """Get historical candles (to be implemented by providers)"""
        return []
    
    def on_tick(self, callback: Callable[[TickData], None]) -> None:
        """Register tick callback"""
        self._tick_callbacks.append(callback)
    
    def on_candle(self, callback: Callable[[CandleData], None]) -> None:
        """Register candle callback"""
        self._candle_callbacks.append(callback)
    
    def on_connection_change(self, callback: Callable[[bool], None]) -> None:
        """Register connection state change callback"""
        self._connection_callbacks.append(callback)
    
    def set_instrument_mapping(self, symbol_to_token: Dict[str, str]) -> None:
        """Set symbol to token mapping"""
        self._symbol_to_token = symbol_to_token
        self._token_to_symbol = {v: k for k, v in symbol_to_token.items()}
    
    async def _emit_tick(self, tick: TickData) -> None:
        for cb in self._tick_callbacks:
            try:
                await cb(tick) if asyncio.iscoroutinefunction(cb) else cb(tick)
            except Exception as e:
                logger.error(f"Tick callback error: {e}")
    
    async def _emit_candle(self, candle: CandleData) -> None:
        for cb in self._candle_callbacks:
            try:
                await cb(candle) if asyncio.iscoroutinefunction(cb) else cb(candle)
            except Exception as e:
                logger.error(f"Candle callback error: {e}")
    
    async def _notify_connection(self, connected: bool) -> None:
        for cb in self._connection_callbacks:
            try:
                await cb(connected) if asyncio.iscoroutinefunction(cb) else cb(connected)
            except Exception as e:
                logger.error(f"Connection callback error: {e}")
    
    async def _start_heartbeat(self) -> None:
        """Start heartbeat to keep connection alive"""
        async def heartbeat():
            while self.connected:
                await asyncio.sleep(30)
                if self.connected:
                    self._last_heartbeat = time.time()
        
        self._heartbeat_task = asyncio.create_task(heartbeat())
    
    async def _reconnect(self) -> None:
        """Attempt to reconnect"""
        if self._reconnect_task and not self._reconnect_task.done():
            return
        
        async def do_reconnect():
            await asyncio.sleep(5)
            attempt = 0
            while not self.connected and attempt < 10:
                logger.info(f"Reconnection attempt {attempt + 1}")
                if await self.connect():
                    break
                attempt += 1
                await asyncio.sleep(10 * attempt)  # Exponential backoff
        
        self._reconnect_task = asyncio.create_task(do_reconnect())


class MockProvider(BaseRealTimeProvider):
    """Mock provider for testing - generates random tick data"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self._running = False
        self._tick_task: Optional[asyncio.Task] = None
        self._base_prices: Dict[str, float] = {}
    
    async def _connect_impl(self) -> bool:
        if not WS_AVAILABLE:
            logger.warning("Mock provider doesn't need websockets")
        self._running = True
        self._tick_task = asyncio.create_task(self._generate_ticks())
        return True
    
    async def _disconnect_impl(self) -> None:
        self._running = False
        if self._tick_task:
            self._tick_task.cancel()
            self._tick_task = None
    
    async def _subscribe_impl(self, symbols: List[str], mode: str) -> bool:
        for symbol in symbols:
            if symbol not in self._base_prices:
                # Set realistic base prices for common NSE symbols
                base_prices = {
                    "RELIANCE.NS": 2500, "TCS.NS": 3800, "INFY.NS": 1500,
                    "HDFCBANK.NS": 1600, "ICICIBANK.NS": 1000, "^NSEI": 24000,
                    "^NSEBANK": 52000, "SBIN.NS": 600, "BHARTIARTL.NS": 1200,
                }
                self._base_prices[symbol] = base_prices.get(symbol, 1000)
        return True
    
    async def _unsubscribe_impl(self, symbols: List[str]) -> bool:
        return True
    
    async def _handle_message(self, message: Any) -> None:
        pass
    
    async def _generate_ticks(self) -> None:
        """Generate mock tick data"""
        import random
        
        while self._running and self.connected:
            await asyncio.sleep(random.uniform(0.5, 2.0))
            
            if not self._subscriptions:
                continue
            
            for symbol in list(self._subscriptions):
                base = self._base_prices.get(symbol, 1000)
                # Random walk
                change = random.uniform(-0.002, 0.002)
                ltp = base * (1 + change)
                self._base_prices[symbol] = ltp
                
                tick = TickData(
                    symbol=symbol,
                    token=self._symbol_to_token.get(symbol, symbol),
                    timestamp=datetime.now(),
                    ltp=round(ltp, 2),
                    ltq=random.randint(1, 100),
                    volume=random.randint(1000, 100000),
                    bid_price=round(ltp * 0.999, 2),
                    bid_qty=random.randint(10, 1000),
                    ask_price=round(ltp * 1.001, 2),
                    ask_qty=random.randint(10, 1000),
                    change=round(ltp - base, 2),
                    change_pct=round(change * 100, 2),
                    high=round(ltp * 1.01, 2),
                    low=round(ltp * 0.99, 2),
                    open=base,
                    close=round(ltp, 2),
                )
                await self._emit_tick(tick)


class KiteConnectProvider(BaseRealTimeProvider):
    """Zerodha Kite Connect WebSocket Provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.access_token = config.get("access_token", "")
        self.ws_url = "wss://ws.kite.trade"
        self._reconnect_interval = 5
    
    async def _connect_impl(self) -> bool:
        if not WS_AVAILABLE:
            logger.error("websockets library required for Kite Connect")
            return False
        
        if not self.api_key or not self.access_token:
            logger.error("Kite Connect: api_key and access_token required")
            return False
        
        try:
            url = f"{self.ws_url}?api_key={self.api_key}&access_token={self.access_token}"
            self._ws = await websockets.connect(
                url,
                ping_interval=20,
                ping_timeout=10,
                close_timeout=5,
                max_size=2**20
            )
            
            # Start message handler
            asyncio.create_task(self._message_handler())
            return True
            
        except Exception as e:
            logger.error(f"Kite Connect connection failed: {e}")
            return False
    
    async def _disconnect_impl(self) -> None:
        if self._ws:
            await self._ws.close()
            self._ws = None
    
    async def _subscribe_impl(self, symbols: List[str], mode: str) -> bool:
        if not self._ws:
            return False
        
        tokens = []
        for symbol in symbols:
            token = self._symbol_to_token.get(symbol)
            if token:
                tokens.append(int(token))
            else:
                logger.warning(f"No token mapping for {symbol}")
        
        if not tokens:
            return False
        
        # Kite Connect subscription message
        msg = {
            "a": "subscribe",
            "v": tokens
        }
        
        mode_map = {"ltp": "ltp", "quote": "quote", "full": "full"}
        msg["m"] = mode_map.get(mode, "full")
        
        try:
            await self._ws.send(json.dumps(msg))
            logger.info(f"Kite: Subscribed to {len(tokens)} instruments ({mode})")
            return True
        except Exception as e:
            logger.error(f"Kite subscribe failed: {e}")
            return False
    
    async def _unsubscribe_impl(self, symbols: List[str]) -> bool:
        if not self._ws:
            return False
        
        tokens = [int(self._symbol_to_token[s]) for s in symbols if s in self._symbol_to_token]
        if not tokens:
            return True
        
        msg = {"a": "unsubscribe", "v": tokens}
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Kite unsubscribe failed: {e}")
            return False
    
    async def _message_handler(self) -> None:
        """Handle incoming WebSocket messages"""
        try:
            async for message in self._ws:
                if isinstance(message, bytes):
                    await self._parse_binary(message)
                else:
                    await self._parse_text(message)
        except Exception as e:
            logger.error(f"Kite message handler error: {e}")
            self.connected = False
            asyncio.create_task(self._reconnect())
    
    async def _parse_text(self, message: str) -> None:
        """Parse text messages (heartbeat, etc.)"""
        try:
            msg = json.loads(message)
            if msg.get("type") == "heartbeat":
                return
        except:
            pass
    
    async def _parse_binary(self, data: bytes) -> None:
        """Parse Kite Connect binary protocol"""
        # Kite Connect binary format parsing
        # This is a simplified version - full implementation would use kiteconnect library
        try:
            # Format: 2 bytes (count) + N * (4 bytes token + 8 bytes ltp + ...)
            # For simplicity, we'll log and skip detailed parsing
            # In production, use kiteconnect's tick parsing
            logger.debug(f"Kite binary message: {len(data)} bytes")
        except Exception as e:
            logger.error(f"Binary parse error: {e}")


class FyersProvider(BaseRealTimeProvider):
    """Fyers WebSocket Provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.client_id = config.get("client_id", "")
        self.access_token = config.get("access_token", "")
        self.ws_url = "wss://api.fyers.in/socket/v2/dataSock"
        self._message_id = 0
    
    async def _connect_impl(self) -> bool:
        if not WS_AVAILABLE:
            return False
        
        if not self.client_id or not self.access_token:
            logger.error("Fyers: client_id and access_token required")
            return False
        
        try:
            auth = f"{self.client_id}:{self.access_token}"
            url = f"{self.ws_url}?Authorization={auth}"
            self._ws = await websockets.connect(
                url,
                ping_interval=20,
                ping_timeout=10
            )
            asyncio.create_task(self._message_handler())
            return True
        except Exception as e:
            logger.error(f"Fyers connection failed: {e}")
            return False
    
    async def _disconnect_impl(self) -> None:
        if self._ws:
            await self._ws.close()
            self._ws = None
    
    async def _subscribe_impl(self, symbols: List[str], mode: str) -> bool:
        if not self._ws:
            return False
        
        # Fyers format: NSE:SYMBOL-EQ
        fy_symbols = []
        for symbol in symbols:
            if symbol.endswith(".NS"):
                fy_symbols.append(f"NSE:{symbol[:-3]}-EQ")
            elif symbol.startswith("^"):
                fy_symbols.append(f"NSE:{symbol[1:]}-IDX")
            else:
                fy_symbols.append(symbol)
        
        msg = {
            "type": "subscribe",
            "symbols": fy_symbols,
            "dataType": mode if mode in ["symbolData", "depthData"] else "symbolData"
        }
        
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Fyers subscribe failed: {e}")
            return False
    
    async def _unsubscribe_impl(self, symbols: List[str]) -> bool:
        if not self._ws:
            return False
        
        fy_symbols = [f"NSE:{s[:-3]}-EQ" if s.endswith(".NS") else s for s in symbols]
        msg = {"type": "unsubscribe", "symbols": fy_symbols}
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Fyers unsubscribe failed: {e}")
            return False
    
    async def _message_handler(self) -> None:
        try:
            async for message in self._ws:
                if isinstance(message, str):
                    await self._parse_message(json.loads(message))
        except Exception as e:
            logger.error(f"Fyers message handler error: {e}")
            self.connected = False
            asyncio.create_task(self._reconnect())
    
    async def _parse_message(self, msg: Dict) -> None:
        """Parse Fyers message format"""
        if msg.get("type") == "sf":  # Symbol feed
            for symbol, data in msg.get("data", {}).items():
                tick = TickData(
                    symbol=symbol.replace("NSE:", "").replace("-EQ", ".NS"),
                    token=symbol,
                    timestamp=datetime.now(),
                    ltp=data.get("ltp", 0),
                    ltq=data.get("ltq", 0),
                    volume=data.get("vol", 0),
                    bid_price=data.get("bp1", 0),
                    bid_qty=data.get("bq1", 0),
                    ask_price=data.get("sp1", 0),
                    ask_qty=data.get("sq1", 0),
                    oi=data.get("oi", 0),
                    change=data.get("ch", 0),
                    change_pct=data.get("chp", 0),
                    high=data.get("h", 0),
                    low=data.get("l", 0),
                    open=data.get("o", 0),
                    close=data.get("c", 0),
                )
                await self._emit_tick(tick)


class UpstoxProvider(BaseRealTimeProvider):
    """Upstox WebSocket Provider (v3)"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.access_token = config.get("access_token", "")
        self.ws_url = "wss://api.upstox.com/v2/feed/market-data-feed"
        self._instrument_keys: Dict[str, str] = {}  # symbol -> instrument_key
    
    async def _connect_impl(self) -> bool:
        if not WS_AVAILABLE:
            return False
        
        if not self.access_token:
            logger.error("Upstox: access_token required")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Accept": "application/json",
                "Api-Version": "2.0"
            }
            self._ws = await websockets.connect(
                self.ws_url,
                extra_headers=headers,
                ping_interval=20,
                ping_timeout=10
            )
            asyncio.create_task(self._message_handler())
            return True
        except Exception as e:
            logger.error(f"Upstox connection failed: {e}")
            return False
    
    async def _disconnect_impl(self) -> None:
        if self._ws:
            await self._ws.close()
            self._ws = None
    
    async def _subscribe_impl(self, symbols: List[str], mode: str) -> bool:
        if not self._ws:
            return False
        
        # Upstox uses instrument keys like NSE_EQ|INE002A01018
        instrument_keys = []
        for symbol in symbols:
            key = self._instrument_keys.get(symbol)
            if key:
                instrument_keys.append(key)
            else:
                logger.warning(f"No instrument key for {symbol}")
        
        if not instrument_keys:
            return False
        
        msg = {
            "guid": "subscribe",
            "method": "sub",
            "data": {
                "mode": "full" if mode == "full" else "ltpc",
                "instrumentKeys": instrument_keys
            }
        }
        
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Upstox subscribe failed: {e}")
            return False
    
    async def _unsubscribe_impl(self, symbols: List[str]) -> bool:
        if not self._ws:
            return False
        
        instrument_keys = [self._instrument_keys[s] for s in symbols if s in self._instrument_keys]
        if not instrument_keys:
            return True
        
        msg = {
            "guid": "unsubscribe",
            "method": "unsub",
            "data": {"instrumentKeys": instrument_keys}
        }
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Upstox unsubscribe failed: {e}")
            return False
    
    async def _message_handler(self) -> None:
        try:
            async for message in self._ws:
                if isinstance(message, str):
                    await self._parse_message(json.loads(message))
        except Exception as e:
            logger.error(f"Upstox message handler error: {e}")
            self.connected = False
            asyncio.create_task(self._reconnect())
    
    async def _parse_message(self, msg: Dict) -> None:
        """Parse Upstox message format"""
        if msg.get("type") == "feed":
            for data in msg.get("data", []):
                key = data.get("instrumentKey", "")
                tick = TickData(
                    symbol=self._get_symbol_from_key(key),
                    token=key,
                    timestamp=datetime.fromtimestamp(data.get("timestamp", 0) / 1000),
                    ltp=data.get("ltp", 0),
                    ltq=data.get("ltq", 0),
                    volume=data.get("volume", 0),
                    bid_price=data.get("bp1", 0),
                    bid_qty=data.get("bq1", 0),
                    ask_price=data.get("sp1", 0),
                    ask_qty=data.get("sq1", 0),
                    oi=data.get("oi", 0),
                    change=data.get("change", 0),
                    change_pct=data.get("changePct", 0),
                    high=data.get("high", 0),
                    low=data.get("low", 0),
                    open=data.get("open", 0),
                    close=data.get("close", 0),
                )
                await self._emit_tick(tick)
    
    def _get_symbol_from_key(self, key: str) -> str:
        """Convert instrument key to symbol"""
        # Reverse lookup
        for sym, k in self._instrument_keys.items():
            if k == key:
                return sym
        return key
    
    def set_instrument_keys(self, keys: Dict[str, str]) -> None:
        """Set symbol to instrument key mapping"""
        self._instrument_keys = keys


class AngelOneProvider(BaseRealTimeProvider):
    """Angel One (Angel Broking) SmartAPI WebSocket Provider"""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.client_id = config.get("client_id", "")
        self.password = config.get("password", "")
        self.totp = config.get("totp", "")
        self.auth_token = None
        self.feed_token = None
        self.ws_url = "wss://smartapisocket.angelone.in/smart-stream"
        self._correlation_id = 0
    
    async def _connect_impl(self) -> bool:
        if not WS_AVAILABLE:
            return False
        
        # Need to authenticate first via REST API
        if not await self._authenticate():
            return False
        
        try:
            url = f"{self.ws_url}?token={self.auth_token}&user={self.client_id}&apiKey={self.api_key}"
            self._ws = await websockets.connect(url, ping_interval=20)
            asyncio.create_task(self._message_handler())
            return True
        except Exception as e:
            logger.error(f"Angel One connection failed: {e}")
            return False
    
    async def _authenticate(self) -> bool:
        """Authenticate via REST API to get tokens"""
        import aiohttp
        
        try:
            async with aiohttp.ClientSession() as session:
                # Generate TOTP if needed
                import pyotp
                totp_code = pyotp.TOTP(self.totp).now() if self.totp else ""
                
                payload = {
                    "clientcode": self.client_id,
                    "password": self.password,
                    "totp": totp_code
                }
                
                async with session.post(
                    "https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword",
                    json=payload,
                    headers={"Content-Type": "application/json", "X-PrivateKey": self.api_key}
                ) as resp:
                    data = await resp.json()
                    if data.get("status"):
                        self.auth_token = data["data"]["jwtToken"]
                        self.feed_token = data["data"]["feedToken"]
                        return True
        except Exception as e:
            logger.error(f"Angel One auth failed: {e}")
        return False
    
    async def _disconnect_impl(self) -> None:
        if self._ws:
            await self._ws.close()
            self._ws = None
    
    async def _subscribe_impl(self, symbols: List[str], mode: str) -> bool:
        if not self._ws:
            return False
        
        self._correlation_id += 1
        msg = {
            "correlationID": f"sub_{self._correlation_id}",
            "action": "subscribe",
            "params": {
                "mode": 1 if mode == "ltp" else 2 if mode == "quote" else 3,
                "tokenList": [{"exchangeType": 1, "tokens": [self._symbol_to_token.get(s, s) for s in symbols]}]
            }
        }
        
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Angel One subscribe failed: {e}")
            return False
    
    async def _unsubscribe_impl(self, symbols: List[str]) -> bool:
        if not self._ws:
            return False
        
        self._correlation_id += 1
        msg = {
            "correlationID": f"unsub_{self._correlation_id}",
            "action": "unsubscribe",
            "params": {
                "mode": 3,
                "tokenList": [{"exchangeType": 1, "tokens": [self._symbol_to_token.get(s, s) for s in symbols]}]
            }
        }
        try:
            await self._ws.send(json.dumps(msg))
            return True
        except Exception as e:
            logger.error(f"Angel One unsubscribe failed: {e}")
            return False
    
    async def _message_handler(self) -> None:
        try:
            async for message in self._ws:
                if isinstance(message, str):
                    await self._parse_message(json.loads(message))
        except Exception as e:
            logger.error(f"Angel One message handler error: {e}")
            self.connected = False
            asyncio.create_task(self._reconnect())
    
    async def _parse_message(self, msg: Dict) -> None:
        """Parse Angel One message"""
        if msg.get("type") == "feed":
            for data in msg.get("data", []):
                token = str(data.get("tk", ""))
                symbol = self._token_to_symbol.get(token, token)
                tick = TickData(
                    symbol=symbol,
                    token=token,
                    timestamp=datetime.now(),
                    ltp=data.get("lp", 0),
                    ltq=data.get("lq", 0),
                    volume=data.get("v", 0),
                    bid_price=data.get("bp1", 0),
                    bid_qty=data.get("bq1", 0),
                    ask_price=data.get("sp1", 0),
                    ask_qty=data.get("sq1", 0),
                    oi=data.get("oi", 0),
                    change=data.get("ch", 0),
                    change_pct=data.get("chp", 0),
                    high=data.get("h", 0),
                    low=data.get("l", 0),
                    open=data.get("o", 0),
                    close=data.get("c", 0),
                )
                await self._emit_tick(tick)


class RealTimeManager:
    """Manages real-time data providers and distribution"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.provider: Optional[BaseRealTimeProvider] = None
        self._tick_buffer: Dict[str, List[TickData]] = {}
        self._candle_builders: Dict[str, Dict[str, List[TickData]]] = {}
        self._running = False
    
    def create_provider(self) -> BaseRealTimeProvider:
        """Create provider based on config"""
        rt_config = self.config.get("realtime", {})
        provider_name = rt_config.get("provider", "mock")
        
        provider_configs = {
            "kite": rt_config.get("kite", {}),
            "fyers": rt_config.get("fyers", {}),
            "upstox": rt_config.get("upstox", {}),
            "angel": rt_config.get("angel", {}),
            "mock": rt_config.get("mock", {}),
        }
        
        provider_map = {
            "kite": KiteConnectProvider,
            "fyers": FyersProvider,
            "upstox": UpstoxProvider,
            "angel": AngelOneProvider,
            "mock": MockProvider,
        }
        
        provider_class = provider_map.get(provider_name, MockProvider)
        self.provider = provider_class(provider_configs.get(provider_name, {}))
        
        # Set up callbacks
        self.provider.on_tick(self._on_tick)
        self.provider.on_connection_change(self._on_connection_change)
        
        return self.provider
    
    async def start(self, symbols: List[str], mode: str = "full") -> bool:
        """Start real-time streaming for symbols"""
        if not self.provider:
            self.create_provider()
        
        if not self.provider:
            return False
        
        self._running = True
        
        # Connect
        connected = await self.provider.connect()
        if not connected:
            return False
        
        # Subscribe
        await self.provider.subscribe(symbols, mode)
        
        # Start candle builder
        asyncio.create_task(self._build_candles())
        
        return True
    
    async def stop(self) -> None:
        """Stop real-time streaming"""
        self._running = False
        if self.provider:
            await self.provider.disconnect()
    
    def on_tick(self, callback: Callable[[TickData], None]) -> None:
        """Register global tick callback"""
        if self.provider:
            self.provider.on_tick(callback)
    
    def on_candle(self, callback: Callable[[CandleData], None]) -> None:
        """Register global candle callback"""
        if self.provider:
            self.provider.on_candle(callback)
    
    async def _on_tick(self, tick: TickData) -> None:
        """Internal tick handler - buffer for candle building"""
        # Buffer ticks for candle building
        key = f"{tick.symbol}_{tick.token}"
        if key not in self._tick_buffer:
            self._tick_buffer[key] = []
        self._tick_buffer[key].append(tick)
        
        # Keep only last 1000 ticks per symbol
        if len(self._tick_buffer[key]) > 1000:
            self._tick_buffer[key] = self._tick_buffer[key][-1000:]
    
    async def _on_connection_change(self, connected: bool) -> None:
        logger.info(f"Real-time connection: {'connected' if connected else 'disconnected'}")
        if not connected and self._running:
            # Attempt reconnect
            await asyncio.sleep(5)
            if self._running and self.provider:
                await self.provider.connect()
    
    async def _build_candles(self) -> None:
        """Build 1-minute candles from ticks"""
        while self._running:
            await asyncio.sleep(60)  # Build candles every minute
            
            now = datetime.now()
            minute_start = now.replace(second=0, microsecond=0)
            
            for key, ticks in self._tick_buffer.items():
                if not ticks:
                    continue
                
                # Filter ticks for last minute
                minute_ticks = [t for t in ticks if t.timestamp >= minute_start]
                if not minute_ticks:
                    continue
                
                # Build candle
                prices = [t.ltp for t in minute_ticks]
                volumes = [t.ltq for t in minute_ticks]
                
                candle = CandleData(
                    symbol=minute_ticks[0].symbol,
                    token=minute_ticks[0].token,
                    timeframe="1m",
                    timestamp=minute_start,
                    open=prices[0],
                    high=max(prices),
                    low=min(prices),
                    close=prices[-1],
                    volume=sum(volumes),
                )
                
                # Emit candle
                if self.provider:
                    await self.provider._emit_candle(candle)
                
                # Clear old ticks (keep last 5 minutes)
                cutoff = now - timedelta(minutes=5)
                self._tick_buffer[key] = [t for t in ticks if t.timestamp > cutoff]


# Provider factory
def create_provider(config: Dict[str, Any]) -> BaseRealTimeProvider:
    """Create a real-time provider from config"""
    manager = RealTimeManager(config)
    return manager.create_provider()


# Example usage
async def example_usage():
    """Example of how to use real-time providers"""
    config = {
        "realtime": {
            "enabled": True,
            "provider": "mock",  # or "kite", "fyers", "upstox", "angel"
            "mode": "full",
            "symbols": ["RELIANCE.NS", "TCS.NS", "INFY.NS"],
            "kite": {
                "api_key": "your_api_key",
                "access_token": "your_access_token"
            },
            "fyers": {
                "client_id": "your_client_id",
                "access_token": "your_access_token"
            },
            "upstox": {
                "access_token": "your_access_token"
            },
            "angel": {
                "api_key": "your_api_key",
                "client_id": "your_client_id",
                "password": "your_password",
                "totp": "your_totp_secret"
            }
        }
    }
    
    manager = RealTimeManager(config)
    provider = manager.create_provider()
    
    # Register callbacks
    async def on_tick(tick: TickData):
        print(f"Tick: {tick.symbol} @ ₹{tick.ltp}")
    
    async def on_candle(candle: CandleData):
        print(f"Candle: {candle.symbol} {candle.timeframe} O:{candle.open} H:{candle.high} L:{candle.low} C:{candle.close}")
    
    provider.on_tick(on_tick)
    provider.on_candle(on_candle)
    
    # Start streaming
    await manager.start(config["realtime"]["symbols"], config["realtime"]["mode"])
    
    # Run for 30 seconds
    await asyncio.sleep(30)
    
    # Stop
    await manager.stop()


if __name__ == "__main__":
    asyncio.run(example_usage())