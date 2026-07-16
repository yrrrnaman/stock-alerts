"""
Alert Manager - Formats and sends alerts via Telegram
"""

import asyncio
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from loguru import logger

try:
    from telegram import Bot
    from telegram.error import TelegramError
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False
    logger.warning("python-telegram-bot not installed, alerts will be logged only")

from src.config import Config, AlertsConfig
from src.chart import ChartGenerator


class AlertManager:
    """Manages alert formatting, deduplication, and delivery"""
    
    def __init__(self, config: Config):
        self.config = config
        self.alert_config = config.alerts
        self.telegram_config = config.telegram
        
        # Initialize Telegram bot if configured
        self.bot: Optional[Bot] = None
        if TELEGRAM_AVAILABLE and self.telegram_config.bot_token and self.telegram_config.chat_id:
            self.bot = Bot(token=self.telegram_config.bot_token)
            logger.info("Telegram bot initialized")
        else:
            logger.warning("Telegram not configured - alerts will be logged only")
        
        # Initialize chart generator
        self.chart_generator = ChartGenerator(config) if self.alert_config.include_chart else None
        
        # Alert deduplication cache
        self._alert_cache: Dict[str, datetime] = {}
    
    def _get_cache_key(self, symbol: str, pattern: str, timeframe: str) -> str:
        return f"{symbol}:{pattern}:{timeframe}"
    
    def _is_duplicate(self, symbol: str, pattern: str, timeframe: str) -> bool:
        key = self._get_cache_key(symbol, pattern, timeframe)
        if key in self._alert_cache:
            last_time = self._alert_cache[key]
            elapsed = (datetime.now() - last_time).total_seconds() / 60
            if elapsed < self.alert_config.cooldown_minutes:
                return True
        return False
    
    def _mark_sent(self, symbol: str, pattern: str, timeframe: str) -> None:
        key = self._get_cache_key(symbol, pattern, timeframe)
        self._alert_cache[key] = datetime.now()
        
        # Clean old entries (keep last 1000)
        if len(self._alert_cache) > 1000:
            oldest = sorted(self._alert_cache.items(), key=lambda x: x[1])[:100]
            for k, _ in oldest:
                del self._alert_cache[k]
    
    def format_signal_message(
        self, 
        symbol: str, 
        timeframe: str, 
        signal: Dict[str, Any],
        price: float,
        timestamp: datetime
    ) -> str:
        """Format a signal into a Telegram message"""
        pattern = signal.get("pattern", signal.get("strategy", "Unknown"))
        direction = signal.get("direction", "neutral")
        details = signal.get("details", {})
        description = signal.get("description", "")
        
        # Direction emoji
        dir_emoji = "🟢" if direction == "bullish" else "🔴" if direction == "bearish" else "⚪"
        signal_type = "BULLISH" if direction == "bullish" else "BEARISH" if direction == "bearish" else "NEUTRAL"
        
        # Format timestamp
        ts_str = timestamp.strftime("%Y-%m-%d %H:%M:%S IST")
        
        # Build extra info
        extra_lines = []
        if description:
            extra_lines.append(f"<b>Strategy:</b> {description}")
        for key, value in details.items():
            extra_lines.append(f"<b>{key}:</b> {value}")
        extra_info = "\n".join(extra_lines) if extra_lines else ""
        
        # Use template from config or default
        template = self.alert_config.message_template or """
<b>{dir_emoji} {signal_type} Signal</b>
<b>Symbol:</b> {symbol}
<b>Timeframe:</b> {timeframe}
<b>Pattern:</b> {pattern}
<b>Price:</b> ₹{price:.2f}
<b>Time:</b> {timestamp}
{extra_info}
"""
        
        return template.format(
            dir_emoji=dir_emoji,
            signal_type=signal_type,
            symbol=symbol,
            timeframe=timeframe,
            pattern=pattern.replace("_", " ").title(),
            price=price,
            timestamp=ts_str,
            extra_info=extra_info
        ).strip()
    
    async def send_alert(
        self, 
        symbol: str, 
        timeframe: str, 
        signal: Dict[str, Any],
        df: Optional[Any] = None
    ) -> bool:
        """Send a single alert"""
        pattern = signal.get("pattern", signal.get("strategy", "Unknown"))
        
        # Check deduplication
        if self._is_duplicate(symbol, pattern, timeframe):
            logger.debug(f"Alert suppressed (cooldown): {symbol} {pattern} {timeframe}")
            return False
        
        price = signal.get("price", 0)
        timestamp = signal.get("timestamp", datetime.now())
        
        # Format message
        message = self.format_signal_message(symbol, timeframe, signal, price, timestamp)
        
        # Generate chart if enabled and data available
        chart_path = None
        if self.chart_generator and df is not None and len(df) > 10:
            try:
                chart_path = await self.chart_generator.generate(
                    symbol, timeframe, df, signal
                )
            except Exception as e:
                logger.warning(f"Chart generation failed: {e}")
        
        # Send via Telegram
        sent = False
        if self.bot:
            try:
                if chart_path and os.path.exists(chart_path):
                    with open(chart_path, "rb") as photo:
                        await self.bot.send_photo(
                            chat_id=self.telegram_config.chat_id,
                            photo=photo,
                            caption=message,
                            parse_mode=self.telegram_config.parse_mode
                        )
                else:
                    await self.bot.send_message(
                        chat_id=self.telegram_config.chat_id,
                        text=message,
                        parse_mode=self.telegram_config.parse_mode
                    )
                sent = True
                logger.info(f"Alert sent: {symbol} {pattern} {timeframe}")
            except TelegramError as e:
                logger.error(f"Telegram send failed: {e}")
            except Exception as e:
                logger.error(f"Alert send error: {e}")
        else:
            # Log only
            logger.info(f"ALERT (logged): {symbol} {pattern} {timeframe} @ ₹{price:.2f}")
            sent = True
        
        if sent:
            self._mark_sent(symbol, pattern, timeframe)
        
        # Cleanup chart
        if chart_path and os.path.exists(chart_path):
            try:
                os.remove(chart_path)
            except:
                pass
        
        return sent
    
    async def send_bulk(
        self, 
        alerts: List[Dict[str, Any]],
        data_frames: Dict[str, Any]
    ) -> int:
        """Send multiple alerts with rate limiting"""
        sent_count = 0
        max_alerts = self.alert_config.max_alerts_per_run
        
        for i, alert in enumerate(alerts):
            if sent_count >= max_alerts:
                logger.warning(f"Max alerts per run reached ({max_alerts})")
                break
            
            symbol = alert["symbol"]
            timeframe = alert["timeframe"]
            signal = alert["signal"]
            
            df = data_frames.get(f"{symbol}_{timeframe}")
            
            if await self.send_alert(symbol, timeframe, signal, df):
                sent_count += 1
            
            # Small delay between sends
            if i < len(alerts) - 1:
                await asyncio.sleep(0.5)
        
        return sent_count
    
    async def send_startup_message(self) -> None:
        """Send startup notification"""
        if not self.bot:
            return
        
        symbols = ", ".join(self.config.symbols.symbols[:10])
        if len(self.config.symbols.symbols) > 10:
            symbols += f" +{len(self.config.symbols.symbols) - 10} more"
        
        message = (
            f"🤖 <b>Stock Alert Bot Started</b>\n\n"
            f"<b>Symbols:</b> {symbols}\n"
            f"<b>Timeframes:</b> {', '.join(self.config.symbols.timeframes)}\n"
            f"<b>Check Interval:</b> {self.config.scheduler.interval_minutes} min\n"
            f"<b>Patterns:</b> {len(self.config.patterns.candlestick.patterns)} enabled\n"
            f"<b>Strategies:</b> {len(self.config.patterns.strategies)} configured"
        )
        
        try:
            await self.bot.send_message(
                chat_id=self.telegram_config.chat_id,
                text=message,
                parse_mode=self.telegram_config.parse_mode
            )
        except Exception as e:
            logger.warning(f"Startup message failed: {e}")
    
    async def send_shutdown_message(self) -> None:
        """Send shutdown notification"""
        if not self.bot:
            return
        
        message = "🤖 <b>Stock Alert Bot Stopped</b>"
        try:
            await self.bot.send_message(
                chat_id=self.telegram_config.chat_id,
                text=message,
                parse_mode=self.telegram_config.parse_mode
            )
        except Exception as e:
            logger.warning(f"Shutdown message failed: {e}")
    
    async def close(self) -> None:
        """Cleanup"""
        if self.bot:
            await self.bot.close()