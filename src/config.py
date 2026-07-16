"""
Configuration Management
Loads and validates config.yaml with Pydantic models
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings
import yaml


class TelegramConfig(BaseModel):
    bot_token: str = ""
    chat_id: str = ""
    parse_mode: str = "HTML"


class DataConfig(BaseModel):
    provider: str = "yfinance"
    cache_dir: str = "data/cache"
    cache_ttl_seconds: int = 300


class SymbolsConfig(BaseModel):
    symbols: List[str] = Field(default_factory=list)
    timeframes: List[str] = Field(default_factory=lambda: ["15m", "1h", "1d"])
    lookback_periods: Dict[str, int] = Field(default_factory=lambda: {
        "15m": 100, "1h": 200, "1d": 500
    })


class CandlestickPatternConfig(BaseModel):
    enabled: bool = True
    patterns: List[str] = Field(default_factory=list)


class IndicatorConfig(BaseModel):
    rsi: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True, "period": 14, "oversold": 30, "overbought": 70
    })
    macd: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True, "fast": 12, "slow": 26, "signal": 9
    })
    ema: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True, "periods": [9, 20, 50, 200]
    })
    sma: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True, "periods": [20, 50, 200]
    })
    bollinger: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True, "period": 20, "std_dev": 2
    })


class StrategyCondition(BaseModel):
    pattern: Any = None  # string or list
    indicator: Optional[str] = None
    condition: Optional[str] = None
    value: Optional[float] = None
    tolerance_pct: Optional[float] = None
    multiplier: Optional[float] = None


class StrategyConfig(BaseModel):
    name: str
    description: str = ""
    timeframes: List[str] = Field(default_factory=list)
    conditions: List[StrategyCondition] = Field(default_factory=list)


class PatternsConfig(BaseModel):
    candlestick: CandlestickPatternConfig = Field(default_factory=CandlestickPatternConfig)
    indicators: IndicatorConfig = Field(default_factory=IndicatorConfig)
    strategies: List[StrategyConfig] = Field(default_factory=list)


class AlertsConfig(BaseModel):
    cooldown_minutes: int = 15
    max_alerts_per_run: int = 20
    include_chart: bool = True
    chart_lookback: int = 50
    message_template: str = ""


class SchedulerConfig(BaseModel):
    enabled: bool = True
    interval_minutes: int = 15
    run_on_start: bool = True
    timezone: str = "Asia/Kolkata"


class LoggingConfig(BaseModel):
    level: str = "INFO"
    file: str = "logs/stock_alerts.log"
    rotation: str = "10 MB"
    retention: str = "1 week"


class ChartsConfig(BaseModel):
    style: str = "charles"
    up_color: str = "#00b894"
    down_color: str = "#ff6b6b"
    grid_style: str = "--"
    grid_color: str = "#444444"
    background_color: str = "#1e1e1e"
    figsize: tuple = (12, 8)
    dpi: int = 100
    output_dir: str = "data/charts"


class Config(BaseModel):
    telegram: TelegramConfig = Field(default_factory=TelegramConfig)
    data: DataConfig = Field(default_factory=DataConfig)
    symbols: SymbolsConfig = Field(default_factory=SymbolsConfig)
    patterns: PatternsConfig = Field(default_factory=PatternsConfig)
    alerts: AlertsConfig = Field(default_factory=AlertsConfig)
    scheduler: SchedulerConfig = Field(default_factory=SchedulerConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    charts: ChartsConfig = Field(default_factory=ChartsConfig)

    @classmethod
    def load(cls, path: str) -> "Config":
        """Load config from YAML file"""
        config_path = Path(path)
        if not config_path.exists():
            raise FileNotFoundError(f"Config file not found: {path}")
        
        with open(config_path, "r") as f:
            data = yaml.safe_load(f)
        
        # Also check for local override
        local_path = config_path.with_name("config.local.yaml")
        if local_path.exists():
            with open(local_path, "r") as f:
                local_data = yaml.safe_load(f)
            # Deep merge
            data = cls._deep_merge(data, local_data)
        
        return cls(**data)

    @staticmethod
    def _deep_merge(base: dict, override: dict) -> dict:
        """Deep merge two dictionaries"""
        result = base.copy()
        for key, value in override.items():
            if key in result and isinstance(result[key], dict) and isinstance(value, dict):
                result[key] = Config._deep_merge(result[key], value)
            else:
                result[key] = value
        return result