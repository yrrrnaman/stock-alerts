import { useState, useEffect, useRef, useCallback } from 'react';

export interface RealTimeQuote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  timestamp: number;
  source: 'live' | 'cached' | 'demo';
}

interface UseRealTimeOptions {
  symbols: string[];
  intervalMs?: number;
  enabled?: boolean;
  useProxy?: boolean;
}

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

// Generate demo data with realistic random walk
function makeDemo(symbol: string, prev?: RealTimeQuote): RealTimeQuote {
  const basePrice = prev?.price || 1000 + symbol.charCodeAt(0) * 10 + Math.random() * 500;
  const drift = (Math.random() - 0.5) * (basePrice * 0.005);
  const price = Math.max(1, basePrice + drift);
  const change = prev?.change != null ? price - (prev.price - prev.change) : drift;
  const changePct = (change / (price - change)) * 100;
  return {
    symbol,
    price: parseFloat(price.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePct: parseFloat(changePct.toFixed(2)),
    volume: prev?.volume ? prev.volume + Math.floor(Math.random() * 10000) : Math.floor(Math.random() * 1000000) + 100000,
    timestamp: Date.now(),
    source: 'demo',
  };
}

async function fetchYahoo(symbol: string): Promise<RealTimeQuote | null> {
  for (const proxy of CORS_PROXIES) {
    try {
      const url = `${proxy}https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1m&range=1d`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const data = await res.json();
      const result = data?.chart?.result?.[0];
      const meta = result?.meta;
      if (!meta?.regularMarketPrice) continue;
      return {
        symbol,
        price: meta.regularMarketPrice,
        change: meta.regularMarketChange || 0,
        changePct: meta.regularMarketChangePercent || 0,
        volume: meta.regularMarketVolume || 0,
        timestamp: Date.now(),
        source: 'live',
      };
    } catch {
      continue;
    }
  }
  return null;
}

export function useRealTimeQuotes({ symbols, intervalMs = 15000, enabled = true, useProxy = true }: UseRealTimeOptions) {
  const [quotes, setQuotes] = useState<Record<string, RealTimeQuote>>(() => {
    const initial: Record<string, RealTimeQuote> = {};
    symbols.forEach(s => { initial[s] = makeDemo(s); });
    return initial;
  });
  const [source, setSource] = useState<'live' | 'cached' | 'demo'>('demo');
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(async () => {
    if (!enabled) return;
    const newQuotes = { ...quotes };
    let anyLive = false;

    await Promise.all(symbols.map(async (sym) => {
      if (useProxy) {
        const live = await fetchYahoo(sym);
        if (live) { anyLive = true; newQuotes[sym] = live; return; }
      }
      newQuotes[sym] = makeDemo(sym, newQuotes[sym]);
    }));

    setQuotes(newQuotes);
    setSource(anyLive ? 'live' : 'demo');
    setLastUpdate(Date.now());
    setError(null);
  }, [symbols.join(','), enabled, useProxy, quotes]);

  useEffect(() => {
    if (!enabled) return;
    tick();
    intervalRef.current = setInterval(tick, intervalMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(','), intervalMs, enabled, useProxy]);

  const refresh = useCallback(() => tick(), [tick]);

  return { quotes, source, lastUpdate, error, refresh };
}
