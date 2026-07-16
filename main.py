"""
Stock Alert Bot - Main Entry Point
Monitors NSE stocks for candlestick patterns and technical signals
"""

import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from src.config import Config
from src.bot import StockAlertBot
from src.scheduler import AlertScheduler
from loguru import logger


async def main():
    """Main entry point"""
    # Load configuration
    config = Config.load("config.yaml")
    
    # Setup logging
    logger.remove()
    logger.add(
        sys.stderr,
        level=config.logging.level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )
    logger.add(
        config.logging.file,
        level=config.logging.level,
        rotation=config.logging.rotation,
        retention=config.logging.retention,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
    )
    
    logger.info("Starting Stock Alert Bot...")
    
    # Initialize bot
    bot = StockAlertBot(config)
    
    # Initialize scheduler
    scheduler = AlertScheduler(config, bot)
    
    try:
        # Run initial check if configured
        if config.scheduler.run_on_start:
            logger.info("Running initial scan...")
            await bot.scan_all()
        
        # Start scheduler
        if config.scheduler.enabled:
            logger.info(f"Starting scheduler (interval: {config.scheduler.interval_minutes} min)")
            await scheduler.start()
            
            # Keep running
            while True:
                await asyncio.sleep(60)
        else:
            logger.info("Scheduler disabled. Running single scan.")
            await bot.scan_all()
            
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.exception(f"Fatal error: {e}")
    finally:
        await scheduler.shutdown()
        await bot.close()


if __name__ == "__main__":
    asyncio.run(main())