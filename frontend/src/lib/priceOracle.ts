type CacheKey = string;
type PriceSource = "cryptocompare" | "coingecko" | "fallback";

enum PriceErrorType {
  API_DOWN = "API_DOWN",
  NOT_FOUND = "NOT_FOUND",
}

class PriceOracle {
  private priceCache = new Map<CacheKey, { value: number; ts: number }>();
  private fxCache = new Map<string, { value: number; ts: number }>();
  private inflight = new Map<CacheKey, Promise<number>>();
  private lastSource: PriceSource | null = null;

  private static PRICE_TTL = 24 * 60 * 60 * 1000;
  private static FX_TTL = 7 * 24 * 60 * 60 * 1000;

  async getPrice(symbol: string, timestamp: number): Promise<number> {
    const { normalizedSymbol } = this.parseSymbol(symbol);
    const dateKey = this.normalizeDate(timestamp);
    const cacheKey = `${normalizedSymbol}-${dateKey}`;

    const cached = this.priceCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < PriceOracle.PRICE_TTL) {
      return cached.value;
    }

    if (this.inflight.has(cacheKey)) {
      return this.inflight.get(cacheKey)!;
    }

    const promise = this.resolvePrice(
      normalizedSymbol,
      timestamp,
      dateKey,
      symbol
    );

    this.inflight.set(cacheKey, promise);
    const value = await promise;
    this.inflight.delete(cacheKey);

    this.priceCache.set(cacheKey, {
      value,
      ts: Date.now(),
    });

    return value;
  }

  private async resolvePrice(
    symbol: string,
    timestamp: number,
    dateKey: string,
    rawSymbol: string
  ): Promise<number> {
    let usdPrice =
      (await this.fetchFromCryptoCompare(symbol, timestamp)) ??
      (await this.fetchFromCoinGecko(symbol, dateKey));

    if (usdPrice == null) {
      this.lastSource = "fallback";
      console.warn("[PriceOracle] Fallback price used for", rawSymbol);
      usdPrice = this.getLegacyFallbackUsdPrice(symbol);
    }

    const fx = await this.getUsdToIdrRate(dateKey);
    return usdPrice * fx;
  }

  private parseSymbol(raw: string): {
    normalizedSymbol: string;
    chain?: string;
  } {
    const [sym, chain] = raw.toUpperCase().split("-");
    return {
      normalizedSymbol: this.normalizeSymbol(sym),
      chain,
    };
  }

  private normalizeSymbol(raw: string): string {
    let s = raw.toUpperCase().trim();
    s = s.replace(/\.E$/, "");
    s = s.replace(/^W/, "");

    const alias: Record<string, string> = {
      STETH: "ETH",
      WSTETH: "ETH",
      RETH: "ETH",
      CBETH: "ETH",
      WBTC: "BTC",
      TBTC: "BTC",
    };

    return alias[s] ?? s;
  }

  private normalizeDate(ts: number): string {
    return new Date(ts * 1000).toISOString().slice(0, 10);
  }

  private formatForCoinGecko(date: string): string {
    const [y, m, d] = date.split("-");
    return `${d}-${m}-${y}`;
  }

  private async fetchFromCryptoCompare(
    symbol: string,
    ts: number
  ): Promise<number | null> {
    try {
      const res = await fetch(
        `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${symbol}&tsyms=USD&ts=${ts}`
      );
      const data = await res.json();
      if (typeof data?.[symbol]?.USD === "number") {
        this.lastSource = "cryptocompare";
        return data[symbol].USD;
      }
    } catch { }
    return null;
  }

  private async fetchFromCoinGecko(
    symbol: string,
    date: string
  ): Promise<number | null> {
    const id = this.mapSymbolToCoinGeckoId(symbol);
    if (!id) return null;

    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/history?date=${this.formatForCoinGecko(
          date
        )}`
      );
      const data = await res.json();
      const price = data?.market_data?.current_price?.usd;
      if (typeof price === "number") {
        this.lastSource = "coingecko";
        return price;
      }
    } catch { }
    return null;
  }

  private getLegacyFallbackUsdPrice(symbol: string): number {
    const map: Record<string, number> = {
      ETH: 2000,
      BTC: 30000,
      USDC: 1,
      USDT: 1,
      DAI: 1,
      BNB: 300,
      SOL: 30,
      MATIC: 1,
      AVAX: 15,
      OP: 2,
      ARB: 1.5,
      LINK: 7,
    };
    return map[symbol] ?? 1;
  }

  private async getUsdToIdrRate(date: string): Promise<number> {
    const cached = this.fxCache.get(date);
    if (cached && Date.now() - cached.ts < PriceOracle.FX_TTL) {
      return cached.value;
    }

    try {
      const res = await fetch(
        `https://api.exchangerate.host/${date}?base=USD&symbols=IDR`
      );
      const data = await res.json();
      const rate = data?.rates?.IDR;
      if (typeof rate === "number") {
        this.fxCache.set(date, { value: rate, ts: Date.now() });
        return rate;
      }
    } catch { }

    if (cached) return cached.value;
    return 15000;
  }

  private mapSymbolToCoinGeckoId(symbol: string): string | null {
    const map: Record<string, string> = {
      ETH: "ethereum",
      BTC: "bitcoin",
      USDC: "usd-coin",
      USDT: "tether",
      DAI: "dai",
      BNB: "binancecoin",
      SOL: "solana",
      MATIC: "matic-network",
      AVAX: "avalanche-2",
      OP: "optimism",
      ARB: "arbitrum",
      LINK: "chainlink",
    };
    return map[symbol] ?? null;
  }
}

export const priceOracle = new PriceOracle();