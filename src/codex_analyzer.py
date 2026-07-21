"""
Codex API Integration for StockAlert Bot
Uses OpenAI's Codex/Chat models for AI-powered analysis
"""

import os
import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

from openai import OpenAI

logger = logging.getLogger(__name__)


@dataclass
class CodexAnalysis:
    """Result from Codex analysis"""
    summary: str
    signals: List[Dict[str, Any]]
    risk_assessment: str
    recommendation: str
    confidence: float
    timestamp: datetime
    model_used: str


class CodexAnalyzer:
    """
    Codex-powered market analyzer for StockAlert bot.
    Uses OpenAI's models to analyze patterns, generate insights, and provide recommendations.
    """
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        """
        Initialize Codex analyzer.
        
        Args:
            api_key: OpenAI API key (can also be set via OPENAI_API_KEY env var)
            model: Model to use (gpt-4o, gpt-4o-mini, gpt-3.5-turbo, o1-preview)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OpenAI API key required. Set OPENAI_API_KEY env var or pass api_key parameter.")
        
        self.client = OpenAI(api_key=self.api_key)
        self.model = model
        self.max_tokens = 2000
        self.temperature = 0.3
        
    def analyze_pattern(self, 
                       symbol: str,
                       pattern_name: str,
                       pattern_data: Dict,
                       market_context: Dict,
                       timeframe: str = "1h") -> CodexAnalysis:
        """
        Analyze a detected candlestick pattern with Codex.
        
        Args:
            symbol: Trading symbol (e.g., RELIANCE.NS)
            pattern_name: Name of detected pattern
            pattern_data: Pattern details (OHLC, confidence, etc.)
            market_context: Broader market data (indices, sector, etc.)
            timeframe: Chart timeframe
            
        Returns:
            CodexAnalysis with AI insights
        """
        
        prompt = self._build_pattern_prompt(
            symbol, pattern_name, pattern_data, market_context, timeframe
        )
        
        return self._call_codex(prompt, "pattern_analysis")
    
    def analyze_strategy(self,
                        strategy_name: str,
                        conditions: List[Dict],
                        backtest_results: Optional[Dict] = None,
                        current_market: Optional[Dict] = None) -> CodexAnalysis:
        """
        Analyze a trading strategy with Codex.
        
        Args:
            strategy_name: Name of the strategy
            conditions: List of pattern/indicator conditions
            backtest_results: Optional historical performance
            current_market: Current market conditions
            
        Returns:
            CodexAnalysis with strategy assessment
        """
        
        prompt = self._build_strategy_prompt(
            strategy_name, conditions, backtest_results, current_market
        )
        
        return self._call_codex(prompt, "strategy_analysis")
    
    def generate_alert_message(self,
                              symbol: str,
                              pattern: str,
                              analysis: CodexAnalysis,
                              channel: str = "telegram") -> str:
        """
        Generate formatted alert message for delivery.
        
        Args:
            symbol: Trading symbol
            pattern: Pattern name
            analysis: Codex analysis result
            channel: Delivery channel (telegram, email, discord)
            
        Returns:
            Formatted message string
        """
        
        if channel == "telegram":
            return self._format_telegram_alert(symbol, pattern, analysis)
        elif channel == "email":
            return self._format_email_alert(symbol, pattern, analysis)
        else:
            return self._format_plain_alert(symbol, pattern, analysis)
    
    def analyze_portfolio_risk(self,
                              positions: List[Dict],
                              market_data: Dict) -> CodexAnalysis:
        """Analyze portfolio-level risk using Codex."""
        
        prompt = f"""
        Analyze this portfolio for risk:
        
        Positions:
        {json.dumps(positions, indent=2)}
        
        Market Data:
        {json.dumps(market_data, indent=2)}
        
        Provide:
        1. Overall risk assessment
        2. Concentration risks
        3. Correlation concerns
        4. Recommended adjustments
        5. Risk score (0-100)
        """
        
        return self._call_codex(prompt, "portfolio_risk")
    
    def explain_signal(self, 
                       symbol: str,
                       signal_data: Dict,
                       user_question: str) -> str:
        """Answer user questions about a specific signal."""
        
        prompt = f"""
        User asked about {symbol} signal:
        Signal Data: {json.dumps(signal_data, indent=2)}
        Question: {user_question}
        
        Provide a clear, educational explanation suitable for a trader.
        """
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a knowledgeable trading mentor. Explain concepts clearly with practical examples."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.4
        )
        
        return response.choices[0].message.content
    
    def _call_codex(self, prompt: str, analysis_type: str) -> CodexAnalysis:
        """Make the actual API call to Codex."""
        
        system_prompts = {
            "pattern_analysis": """You are an expert technical analyst specializing in Indian markets (NSE/BSE). 
            Analyze candlestick patterns with context of broader market trends, sector performance, and risk management.
            Return JSON with: summary, signals (list), risk_assessment, recommendation, confidence (0-1)""",
            
            "strategy_analysis": """You are a quantitative strategy researcher. 
            Evaluate trading strategies for robustness, risk-adjusted returns, and practical viability.
            Return JSON with: summary, signals (list), risk_assessment, recommendation, confidence (0-1)""",
            
            "portfolio_risk": """You are a portfolio risk manager.
            Assess portfolio-level risks including concentration, correlation, and tail risks.
            Return JSON with: summary, signals (list), risk_assessment, recommendation, confidence (0-1)""",
        }
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompts.get(analysis_type, system_prompts["pattern_analysis"])},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            
            return CodexAnalysis(
                summary=result.get("summary", ""),
                signals=result.get("signals", []),
                risk_assessment=result.get("risk_assessment", ""),
                recommendation=result.get("recommendation", ""),
                confidence=float(result.get("confidence", 0.5)),
                timestamp=datetime.now(),
                model_used=self.model
            )
            
        except Exception as e:
            logger.error(f"Codex API error: {e}")
            return CodexAnalysis(
                summary=f"Analysis failed: {str(e)}",
                signals=[],
                risk_assessment="Unable to assess",
                recommendation="Manual review required",
                confidence=0.0,
                timestamp=datetime.now(),
                model_used=self.model
            )
    
    def _build_pattern_prompt(self, symbol, pattern_name, pattern_data, market_context, timeframe):
        """Build prompt for pattern analysis."""
        
        return f"""
        Analyze this {timeframe} candlestick pattern for {symbol}:
        
        Pattern: {pattern_name}
        Pattern Data: {json.dumps(pattern_data, indent=2)}
        
        Market Context:
        - NIFTY 50: {market_context.get('nifty', 'N/A')}
        - Sector: {market_context.get('sector', 'N/A')}
        - Market Trend: {market_context.get('trend', 'N/A')}
        - Volume Profile: {market_context.get('volume', 'N/A')}
        - Key Levels: Support: {market_context.get('support', 'N/A')}, Resistance: {market_context.get('resistance', 'N/A')}
        
        Provide analysis as JSON:
        {{
            "summary": "Brief 2-3 sentence summary",
            "signals": [
                {{"type": "entry/exit/stop", "price": 0, "reason": "why"}}
            ],
            "risk_assessment": "Risk level and key concerns",
            "recommendation": "BUY/SELL/HOLD with rationale",
            "confidence": 0.0-1.0
        }}
        """
    
    def _build_strategy_prompt(self, strategy_name, conditions, backtest_results, current_market):
        """Build prompt for strategy analysis."""
        
        return f"""
        Evaluate this trading strategy:
        
        Strategy: {strategy_name}
        Conditions: {json.dumps(conditions, indent=2)}
        {f'Backtest Results: {json.dumps(backtest_results, indent=2)}' if backtest_results else 'No backtest data provided'}
        {f'Current Market: {json.dumps(current_market, indent=2)}' if current_market else ''}
        
        Provide assessment as JSON:
        {{
            "summary": "Strategy overview",
            "signals": [
                {{"type": "strength/weakness", "detail": "specific point", "impact": "high/medium/low"}}
            ],
            "risk_assessment": "Key risks and mitigation",
            "recommendation": "DEPLOY/MODIFY/REJECT with rationale",
            "confidence": 0.0-1.0
        }}
        """
    
    def _format_telegram_alert(self, symbol, pattern, analysis: CodexAnalysis) -> str:
        """Format alert for Telegram with HTML formatting."""
        
        direction = "🟢 BULLISH" if "BUY" in analysis.recommendation.upper() else "🔴 BEARISH" if "SELL" in analysis.recommendation.upper() else "🟡 NEUTRAL"
        
        msg = f"<b>{direction} | {symbol}</b>\n"
        msg += f"<b>Pattern:</b> {pattern}\n"
        msg += f"<b>AI Confidence:</b> {analysis.confidence:.0%}\n\n"
        msg += f"<b>Summary:</b> {analysis.summary}\n\n"
        msg += f"<b>Risk:</b> {analysis.risk_assessment}\n\n"
        msg += f"<b>Recommendation:</b> {analysis.recommendation}\n\n"
        
        if analysis.signals:
            msg += "<b>Key Signals:</b>\n"
            for sig in analysis.signals[:3]:
                if isinstance(sig, dict):
                    msg += f"• {sig.get('reason', sig.get('detail', 'Signal'))}\n"
        
        msg += f"\n<i>🤖 Powered by Codex ({analysis.model_used}) | {analysis.timestamp.strftime('%H:%M:%S')}</i>"
        
        return msg
    
    def _format_email_alert(self, symbol, pattern, analysis: CodexAnalysis) -> str:
        """Format alert for email."""
        
        return f"""
        StockAlert Pro - AI Analysis
        ============================
        
        Symbol: {symbol}
        Pattern: {pattern}
        Time: {analysis.timestamp.strftime('%Y-%m-%d %H:%M:%S')}
        Model: {analysis.model_used}
        Confidence: {analysis.confidence:.0%}
        
        SUMMARY
        -------
        {analysis.summary}
        
        RISK ASSESSMENT
        ---------------
        {analysis.risk_assessment}
        
        RECOMMENDATION
        --------------
        {analysis.recommendation}
        
        KEY SIGNALS
        -----------
        {chr(10).join([f"• {s.get('reason', s.get('detail', 'Signal'))}" for s in analysis.signals[:5]])}
        """
    
    def _format_plain_alert(self, symbol, pattern, analysis: CodexAnalysis) -> str:
        """Format alert as plain text."""
        
        return f"""
{symbol} - {pattern}
Confidence: {analysis.confidence:.0%}
{analysis.summary}
Risk: {analysis.risk_assessment}
Action: {analysis.recommendation}
---
Codex AI ({analysis.model_used})
        """.strip()


def create_codex_analyzer_from_config(config: Dict) -> CodexAnalyzer:
    """Factory function to create analyzer from config dict."""
    
    return CodexAnalyzer(
        api_key=config.get("openai_api_key") or os.getenv("OPENAI_API_KEY"),
        model=config.get("codex_model", "gpt-4o")
    )


# Example usage and testing
if __name__ == "__main__":
    import sys
    
    # Test with API key from environment
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("Set OPENAI_API_KEY environment variable to test")
        sys.exit(1)
    
    analyzer = CodexAnalyzer(api_key=api_key)
    
    # Test pattern analysis
    result = analyzer.analyze_pattern(
        symbol="RELIANCE.NS",
        pattern_name="Bullish Engulfing",
        pattern_data={
            "open": 2500,
            "high": 2550,
            "low": 2490,
            "close": 2540,
            "volume": 1500000,
            "confidence": 0.85
        },
        market_context={
            "nifty": "24500 (+0.5%)",
            "sector": "Energy (+1.2%)",
            "trend": "Uptrend",
            "volume": "Above average",
            "support": 2480,
            "resistance": 2580
        },
        timeframe="1h"
    )
    
    print("=== Pattern Analysis ===")
    print(f"Summary: {result.summary}")
    print(f"Recommendation: {result.recommendation}")
    print(f"Confidence: {result.confidence:.0%}")
    print(f"Risk: {result.risk_assessment}")
    print()
    
    # Test Telegram formatting
    telegram_msg = analyzer.generate_alert_message("RELIANCE.NS", "Bullish Engulfing", result, "telegram")
    print("=== Telegram Alert ===")
    print(telegram_msg)