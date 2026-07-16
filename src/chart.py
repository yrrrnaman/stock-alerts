"""
Chart Generator - Creates price charts with signals highlighted
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

import pandas as pd
import mplfinance as mpf
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
from loguru import logger

from src.config import Config


class ChartGenerator:
    """Generate candlestick charts with technical indicators and signal markers"""
    
    def __init__(self, config: Config):
        self.config = config
        self.chart_config = config.charts
        
        # Style configuration
        self.style = mpf.make_mpf_style(
            base_mpf_style=self.chart_config.style,
            marketcolors=mpf.make_marketcolors(
                up=self.chart_config.up_color,
                down=self.chart_config.down_color,
                edge='inherit',
                wick='inherit',
                volume='in',
                ohlc='inherit'
            ),
            gridstyle=self.chart_config.grid_style,
            gridcolor=self.chart_config.grid_color,
            facecolor=self.chart_config.background_color,
            figcolor=self.chart_config.background_color,
        )
        
        # Output directory
        self.output_dir = Path(self.chart_config.output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def generate(
        self,
        symbol: str,
        timeframe: str,
        df: pd.DataFrame,
        signal: Dict[str, Any]
    ) -> Optional[str]:
        """Generate chart and save to file, return file path"""
        
        if df is None or len(df) < 10:
            return None
        
        # Prepare data (last N candles)
        plot_df = df.tail(self.chart_config.candles).copy()
        
        # Add indicators to plot
        addplots = self._create_addplots(plot_df)
        
        # Add signal marker
        signal_marker = self._create_signal_marker(plot_df, signal)
        if signal_marker:
            addplots.append(signal_marker)
        
        # Generate filename
        safe_symbol = symbol.replace(".", "_").replace("/", "_")
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_symbol}_{timeframe}_{timestamp}.png"
        filepath = self.output_dir / filename
        
        # Plot
        try:
            fig, axes = mpf.plot(
                plot_df,
                type='candle',
                style=self.style,
                title=f'{symbol} - {timeframe} - {signal.get("pattern", "Signal")}',
                ylabel='Price (₹)',
                ylabel_lower='Volume',
                volume=True,
                addplot=addplots if addplots else None,
                figsize=self.chart_config.figsize,
                dpi=self.chart_config.dpi,
                savefig=dict(fname=str(filepath), dpi=self.chart_config.dpi, bbox_inches='tight'),
                returnfig=True
            )
            plt.close(fig)
            
            logger.debug(f"Chart generated: {filepath}")
            return str(filepath)
            
        except Exception as e:
            logger.error(f"Chart generation failed for {symbol} {timeframe}: {e}")
            return None
    
    def _create_addplots(self, df: pd.DataFrame) -> list:
        """Create additional plots (EMAs, Bollinger Bands, etc.)"""
        addplots = []
        
        # EMAs
        ema_colors = {
            'ema_9': '#FF6B6B',    # Red
            'ema_20': '#4ECDC4',   # Teal
            'ema_50': '#FFD93D',   # Yellow
            'ema_200': '#6C5CE7',  # Purple
        }
        
        for ema_col, color in ema_colors.items():
            if ema_col in df.columns:
                addplots.append(mpf.make_addplot(
                    df[ema_col],
                    color=color,
                    width=1,
                    alpha=0.8,
                    label=ema_col.upper()
                ))
        
        # Bollinger Bands
        if all(c in df.columns for c in ['bb_upper', 'bb_middle', 'bb_lower']):
            addplots.append(mpf.make_addplot(
                df['bb_upper'],
                color='#888888',
                width=0.8,
                alpha=0.5,
                label='BB Upper'
            ))
            addplots.append(mpf.make_addplot(
                df['bb_lower'],
                color='#888888',
                width=0.8,
                alpha=0.5,
                label='BB Lower'
            ))
        
        # MACD (on separate panel)
        if all(c in df.columns for c in ['macd', 'macd_signal', 'macd_hist']):
            addplots.append(mpf.make_addplot(
                df['macd'],
                panel=2,
                color='#00D2D3',
                width=1,
                ylabel='MACD'
            ))
            addplots.append(mpf.make_addplot(
                df['macd_signal'],
                panel=2,
                color='#FF6B6B',
                width=1
            ))
            addplots.append(mpf.make_addplot(
                df['macd_hist'],
                type='bar',
                panel=2,
                color='#A29BFE',
                width=0.7,
                alpha=0.6
            ))
        
        # RSI (on separate panel)
        if 'rsi' in df.columns:
            addplots.append(mpf.make_addplot(
                df['rsi'],
                panel=3,
                color='#E17055',
                width=1,
                ylabel='RSI',
                ylim=(0, 100)
            ))
            # RSI levels
            addplots.append(mpf.make_addplot(
                [70] * len(df),
                panel=3,
                color='#FF6B6B',
                width=0.5,
                linestyle='--',
                alpha=0.5
            ))
            addplots.append(mpf.make_addplot(
                [30] * len(df),
                panel=3,
                color='#00B894',
                width=0.5,
                linestyle='--',
                alpha=0.5
            ))
        
        return addplots
    
    def _create_signal_marker(
        self, 
        df: pd.DataFrame, 
        signal: Dict[str, Any]
    ) -> Optional[Any]:
        """Create a marker for the signal on the chart"""
        
        direction = signal.get('direction', 'neutral')
        pattern = signal.get('pattern', signal.get('strategy', ''))
        
        # Only mark the last candle where signal occurred
        if direction == 'bullish':
            marker_type = '^'  # Up triangle
            color = '#00B894'
            label = f'BUY: {pattern}'
        elif direction == 'bearish':
            marker_type = 'v'  # Down triangle
            color = '#FF6B6B'
            label = f'SELL: {pattern}'
        else:
            return None
        
        # Create marker series (NaN everywhere except last candle)
        marker_series = pd.Series([float('nan')] * len(df), index=df.index)
        marker_series.iloc[-1] = df['low'].iloc[-1] * 0.995 if direction == 'bullish' else df['high'].iloc[-1] * 1.005
        
        return mpf.make_addplot(
            marker_series,
            type='scatter',
            markersize=150,
            marker=marker_type,
            color=color,
            label=label
        )


async def test_chart():
    """Quick test"""
    import yfinance as yf
    from src.config import Config
    
    config = Config.load("config.yaml")
    generator = ChartGenerator(config)
    
    # Fetch some data
    ticker = yf.Ticker("RELIANCE.NS")
    df = ticker.history(period="1mo", interval="15m")
    df.columns = [c.lower() for c in df.columns]
    
    signal = {
        "pattern": "bullish_engulfing",
        "direction": "bullish",
        "price": df['close'].iloc[-1],
        "timestamp": df.index[-1]
    }
    
    path = await generator.generate("RELIANCE.NS", "15m", df, signal)
    print(f"Chart saved: {path}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_chart())