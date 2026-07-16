"""
Scheduler - Runs periodic scans using APScheduler
"""

import asyncio
from datetime import datetime
from typing import Optional
from loguru import logger

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from src.config import Config, SchedulerConfig
from src.bot import StockAlertBot


class AlertScheduler:
    """Manages scheduled scanning jobs"""
    
    def __init__(self, config: Config, bot: StockAlertBot):
        self.config = config
        self.bot = bot
        self.scheduler_config = config.scheduler
        self.scheduler = AsyncIOScheduler(timezone=self.scheduler_config.timezone)
        self._running = False
    
    async def start(self) -> None:
        """Start the scheduler"""
        if self._running:
            logger.warning("Scheduler already running")
            return
        
        # Add interval job
        self.scheduler.add_job(
            self._run_scan,
            IntervalTrigger(minutes=self.scheduler_config.interval_minutes),
            id="market_scan",
            name="Market Scan",
            max_instances=1,
            coalesce=True,
            next_run_time=datetime.now()  # Run immediately
        )
        
        self.scheduler.start()
        self._running = True
        logger.info(f"Scheduler started (interval: {self.scheduler_config.interval_minutes} min, timezone: {self.scheduler_config.timezone})")
    
    async def _run_scan(self) -> None:
        """Run a market scan job"""
        logger.info("Scheduled scan triggered")
        try:
            await self.bot.scan_all()
        except Exception as e:
            logger.exception(f"Scheduled scan failed: {e}")
    
    async def run_now(self) -> None:
        """Trigger an immediate scan"""
        logger.info("Manual scan triggered")
        await self._run_scan()
    
    async def shutdown(self) -> None:
        """Stop the scheduler"""
        if self._running:
            self.scheduler.shutdown(wait=True)
            self._running = False
            logger.info("Scheduler stopped")
    
    def get_next_run(self) -> Optional[datetime]:
        """Get next scheduled run time"""
        job = self.scheduler.get_job("market_scan")
        if job and job.next_run_time:
            return job.next_run_time
        return None
    
    def get_jobs(self) -> list:
        """Get all scheduled jobs"""
        return self.scheduler.get_jobs()