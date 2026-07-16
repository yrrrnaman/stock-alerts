"""
FastAPI Backend for StockAlert Dashboard
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import asyncio
import json
import os
import sys
from pathlib import Path

# Add parent directory to path for importing stock-alerts modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.config import Config
from src.bot import StockAlertBot
from src.data_provider import DataProvider
from src.patterns import PatternAnalyzer
from src.realtime import RealTimeManager, create_provider

# Global instances
bot_instance: Optional[StockAlertBot] = None
realtime_manager: Optional[RealTimeManager] = None
connected_websockets: List[WebSocket] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    global bot_instance, realtime_manager
    
    # Load config
    config = Config.load("config.yaml")
    
    # Initialize bot
    bot_instance = StockAlertBot(config)
    
    # Initialize realtime manager
    realtime_manager = RealTimeManager(config.model_dump())
    
    # Start background tasks
    asyncio.create_task(broadcast_updates())
    
    yield
    
    # Cleanup
    if bot_instance:
        await bot_instance.close()
    if realtime_manager:
        await realtime_manager.stop()


app = FastAPI(
    title="StockAlert API",
    description="Real-time Indian stock market pattern detection API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SymbolModel(BaseModel):
    symbol: str
    name: str
    exchange: str = "NSE"
    enabled: bool = True
    timeframes: List[str] = ["15m", "1h", "1d"]
    alert_types: List[str] = ["pattern", "strategy"]
    min_confidence: int = 60

class StrategyConditionModel(BaseModel):
    type: str  # pattern or indicator
    pattern: Optional[str] = None
    indicator: Optional[str] = None
    operator: Optional[str] = None
    value: Optional[float] = None
    tolerance: Optional[float] = None

class StrategyModel(BaseModel):
    name: str
    description: str = ""
    timeframes: List[str] = ["15m"]
    enabled: bool = True
    conditions: List[StrategyConditionModel] = []

class AlertModel(BaseModel):
    id: str
    symbol: str
    pattern: str
    timeframe: str
    price: float
    direction: str
    strategy: Optional[str] = None
    timestamp: str
    confidence: int
    status: str = "new"

class ScanRequest(BaseModel):
    symbols: Optional[List[str]] = None
    timeframes: Optional[List[str]] = None

class ScanResponse(BaseModel):
    alerts: List[AlertModel]
    scanned: int
    duration: float
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    bot_running: bool
    symbols_count: int
    alerts_today: int

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# API Routes
@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        bot_running=bot_instance is not None,
        symbols_count=7,
        alerts_today=23
    )

@app.get("/api/symbols")
async def get_symbols():
    """Get all watched symbols"""
    if not bot_instance:
        raise HTTPException(status_code=503, detail="Bot not initialized")
    
    config = bot_instance.config
    symbols = config.symbols.symbols
    
    # Mock data - in real app, fetch from database
    return [
        {"id": "1", "symbol": "RELIANCE.NS", "name": "Reliance Industries", "exchange": "NSE", "enabled": True, "timeframes": ["15m", "1h", "1d"], "alert_types": ["pattern", "strategy"], "min_confidence": 60, "created_at": "2024-01-10"},
        {"id": "2", "symbol": "TCS.NS", "name": "Tata Consultancy Services", "exchange": "NSE", "enabled": True, "timeframes": ["15m", "1h"], "alert_types": ["pattern"], "min_confidence": 65, "created_at": "2024-01-10"},
        {"id": "3", "symbol": "INFY.NS", "name": "Infosys", "exchange": "NSE", "enabled": True, "timeframes": ["1h", "1d"], "alert_types": ["pattern", "strategy", "breakout"], "min_confidence": 70, "created_at": "2024-01-11"},
        {"id": "4", "symbol": "HDFCBANK.NS", "name": "HDFC Bank", "exchange": "NSE", "enabled": True, "timeframes": ["15m", "1h", "1d"], "alert_types": ["pattern", "strategy"], "min_confidence": 60, "created_at": "2024-01-11"},
        {"id": "5", "symbol": "ICICIBANK.NS", "name": "ICICI Bank", "exchange": "NSE", "enabled": True, "timeframes": ["15m", "1h"], "alert_types": ["strategy"], "min_confidence": 75, "created_at": "2024-01-12"},
        {"id": "6", "symbol": "^NSEI", "name": "NIFTY 50 Index", "exchange": "NSE", "enabled": True, "timeframes": ["15m", "1h", "1d"], "alert_types": ["pattern", "strategy", "breakout"], "min_confidence": 70, "created_at": "2024-01-10"},
        {"id": "7", "symbol": "^NSEBANK", "name": "NIFTY Bank Index", "exchange": "NSE", "enabled": True, "timeframes": ["15m", "1h", "1d"], "alert_types": ["pattern", "strategy", "breakout"], "min_confidence": 70, "created_at": "2024-01-10"},
    ]

@app.post("/api/symbols")
async def add_symbol(symbol: SymbolModel):
    """Add a new symbol to watchlist"""
    # In real app, save to database
    return {"success": True, "id": "new-id", "message": "Symbol added"}

@app.delete("/api/symbols/{symbol_id}")
async def delete_symbol(symbol_id: str):
    """Remove a symbol from watchlist"""
    return {"success": True, "message": "Symbol removed"}

@app.patch("/api/symbols/{symbol_id}")
async def update_symbol(symbol_id: str, updates: dict):
    """Update symbol settings"""
    return {"success": True, "message": "Symbol updated"}

@app.get("/api/strategies")
async def get_strategies():
    """Get all strategies"""
    return [
        {"id": "1", "name": "bullish_reversal", "description": "Hammer + RSI oversold near support", "timeframes": ["15m", "1h"], "enabled": True, "conditions": [{"type": "pattern", "pattern": "hammer"}, {"type": "indicator", "indicator": "rsi", "operator": "lt", "value": 35}], "created_at": "2024-01-10", "updated_at": "2024-01-15"},
        {"id": "2", "name": "bullish_engulfing_trend", "description": "Bullish engulfing above EMA20", "timeframes": ["15m", "1h", "1d"], "enabled": True, "conditions": [{"type": "pattern", "pattern": "bullish_engulfing"}, {"type": "indicator", "indicator": "price_vs_ema20", "operator": "gt", "value": 0}], "created_at": "2024-01-10", "updated_at": "2024-01-15"},
        {"id": "3", "name": "morning_star_reversal", "description": "Morning star pattern with volume confirmation", "timeframes": ["1h", "1d"], "enabled": True, "conditions": [{"type": "pattern", "pattern": "morning_star"}, {"type": "indicator", "indicator": "volume_spike", "operator": "gt", "value": 1.5}], "created_at": "2024-01-12", "updated_at": "2024-01-15"},
        {"id": "4", "name": "bearish_reversal_top", "description": "Shooting star / evening star at resistance", "timeframes": ["15m", "1h", "1d"], "enabled": True, "conditions": [{"type": "pattern", "pattern": ["shooting_star", "evening_star"]}, {"type": "indicator", "indicator": "rsi", "operator": "gt", "value": 65}], "created_at": "2024-01-12", "updated_at": "2024-01-15"},
        {"id": "5", "name": "breakout_volume", "description": "Price breaks above 20-day high with volume spike", "timeframes": ["1h", "1d"], "enabled": False, "conditions": [{"type": "indicator", "indicator": "breakout_20d_high", "operator": "eq", "value": 1}, {"type": "indicator", "indicator": "volume_spike", "operator": "gt", "value": 2.0}], "created_at": "2024-01-13", "updated_at": "2024-01-15"},
    ]

@app.post("/api/strategies")
async def create_strategy(strategy: StrategyModel):
    """Create a new strategy"""
    return {"success": True, "id": "new-id", "message": "Strategy created"}

@app.patch("/api/strategies/{strategy_id}")
async def update_strategy(strategy_id: str, updates: dict):
    """Update a strategy"""
    return {"success": True, "message": "Strategy updated"}

@app.delete("/api/strategies/{strategy_id}")
async def delete_strategy(strategy_id: str):
    """Delete a strategy"""
    return {"success": True, "message": "Strategy deleted"}

@app.get("/api/alerts")
async def get_alerts(
    limit: int = 50,
    symbol: Optional[str] = None,
    timeframe: Optional[str] = None,
    direction: Optional[str] = None,
    status: Optional[str] = None
):
    """Get recent alerts"""
    alerts = [
        {"id": "1", "symbol": "RELIANCE.NS", "pattern": "Bullish Engulfing", "timeframe": "15m", "price": 2543.20, "direction": "bullish", "strategy": "bullish_engulfing_trend", "timestamp": "2024-01-15 10:30:15", "confidence": 87, "status": "new"},
        {"id": "2", "symbol": "TCS.NS", "pattern": "Hammer", "timeframe": "1h", "price": 3890.50, "direction": "bullish", "strategy": "bullish_reversal", "timestamp": "2024-01-15 10:15:42", "confidence": 72, "status": "new"},
        {"id": "3", "symbol": "^NSEBANK", "pattern": "Bearish Engulfing", "timeframe": "1h", "price": 52180.30, "direction": "bearish", "strategy": "bearish_reversal_top", "timestamp": "2024-01-15 10:02:18", "confidence": 81, "status": "acknowledged"},
        {"id": "4", "symbol": "INFY.NS", "pattern": "Morning Star", "timeframe": "1d", "price": 1520.75, "direction": "bullish", "strategy": "morning_star_reversal", "timestamp": "2024-01-15 08:45:00", "confidence": 69, "status": "new"},
        {"id": "5", "symbol": "HDFCBANK.NS", "pattern": "Shooting Star", "timeframe": "15m", "price": 1645.90, "direction": "bearish", "timestamp": "2024-01-15 08:30:22", "confidence": 58, "status": "dismissed"},
    ]
    
    # Apply filters
    if symbol:
        alerts = [a for a in alerts if a["symbol"] == symbol]
    if timeframe:
        alerts = [a for a in alerts if a["timeframe"] == timeframe]
    if direction:
        alerts = [a for a in alerts if a["direction"] == direction]
    if status:
        alerts = [a for a in alerts if a["status"] == status]
    
    return alerts[:limit]

@app.post("/api/scan", response_model=ScanResponse)
async def run_scan(request: ScanRequest):
    """Run a manual scan"""
    if not bot_instance:
        raise HTTPException(status_code=503, detail="Bot not initialized")
    
    start = datetime.now()
    alerts = await bot_instance.scan_all()
    duration = (datetime.now() - start).total_seconds()
    
    # Convert to response model
    alert_models = []
    for alert in alerts:
        alert_models.append(AlertModel(
            id=alert.get("id", "temp"),
            symbol=alert["symbol"],
            pattern=alert["signal"].get("pattern", alert["signal"].get("strategy", "Unknown")),
            timeframe=alert["timeframe"],
            price=alert["signal"].get("price", 0),
            direction=alert["signal"].get("direction", "neutral"),
            strategy=alert["signal"].get("strategy"),
            timestamp=alert["signal"].get("timestamp", datetime.now()).isoformat() if hasattr(alert["signal"].get("timestamp"), "isoformat") else str(alert["signal"].get("timestamp")),
            confidence=80,
            status="new"
        ))
    
    return ScanResponse(
        alerts=alert_models,
        scanned=len(alert_models),
        duration=duration,
        timestamp=datetime.now().isoformat()
    )

@app.get("/api/stats")
async def get_stats():
    """Get dashboard statistics"""
    return {
        "active_symbols": 7,
        "alerts_today": 23,
        "win_rate": 68.5,
        "active_strategies": 5,
        "last_scan": datetime.now().isoformat(),
        "uptime": "2d 14h 32m",
        "data_provider": "yfinance",
        "telegram_connected": True
    }

@app.get("/api/market-overview")
async def get_market_overview():
    """Get market overview data"""
    return {
        "indices": [
            {"name": "NIFTY 50", "symbol": "^NSEI", "price": 24580.30, "change": 156.70, "change_pct": 0.64},
            {"name": "BANK NIFTY", "symbol": "^NSEBANK", "price": 52180.30, "change": -320.50, "change_pct": -0.61},
            {"name": "INDIA VIX", "symbol": "^INDIAVIX", "price": 14.32, "change": -0.31, "change_pct": -2.1},
        ],
        "top_gainers": [
            {"symbol": "TATAMOTORS", "price": 945.20, "change_pct": 3.2},
            {"symbol": "BAJFINANCE", "price": 7200.00, "change_pct": 2.8},
            {"symbol": "M&M", "price": 2100.50, "change_pct": 2.4},
        ],
        "top_losers": [
            {"symbol": "HDFCLIFE", "price": 580.30, "change_pct": -2.1},
            {"symbol": "BRITANNIA", "price": 4800.00, "change_pct": -1.8},
            {"symbol": "NESTLEIND", "price": 2200.50, "change_pct": -1.5},
        ],
        "fii_dii": {"fii": 1234, "dii": -567, "net": 667}
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "subscribe":
                # Handle subscription to symbols
                pass
            elif msg.get("type") == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now().isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def broadcast_updates():
    """Broadcast periodic updates to connected clients"""
    while True:
        await asyncio.sleep(5)
        if manager.active_connections:
            # Send mock tick data
            await manager.broadcast({
                "type": "tick",
                "data": {
                    "symbol": "RELIANCE.NS",
                    "price": 2543.20,
                    "change": 0.45,
                    "timestamp": datetime.now().isoformat()
                }
            })

# Serve frontend
frontend_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)