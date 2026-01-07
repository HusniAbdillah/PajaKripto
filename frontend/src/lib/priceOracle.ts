export interface HistoricalPrice {
  timestamp: number;
  priceUSD: number;
  priceIDR: number;
  source: 'COINGECKO' | 'CACHE' | 'FALLBACK';
}

export interface TokenPriceCache {
  [tokenSymbol: string]: {
    [timestamp: string]: HistoricalPrice;
  };
}

export class PriceOracle {
  private cache: TokenPriceCache = {};
  private USD_TO_IDR = 15000;

  async getHistoricalPriceIDR(
    tokenSymbol: string,
    timestamp: number
  ): Promise<number> {
    try {
      const priceData = await this.fetchHistoricalPrice(tokenSymbol, timestamp);
      return priceData.priceIDR;
    } catch (error) {
      console.warn(`[PriceOracle] Fallback untuk ${tokenSymbol} at ${timestamp}`);
      return this.getFallbackPrice(tokenSymbol);
    }
  }

  async getHistoricalPrice(
    tokenSymbol: string,
    timestamp: number
  ): Promise<HistoricalPrice> {
    return await this.fetchHistoricalPrice(tokenSymbol, timestamp);
  }

  private async fetchHistoricalPrice(
    tokenSymbol: string,
    timestamp: number
  ): Promise<HistoricalPrice> {
    const cacheKey = `${tokenSymbol}_${timestamp}`;
    if (this.cache[tokenSymbol]?.[cacheKey]) {
      return {
        ...this.cache[tokenSymbol][cacheKey],
        source: 'CACHE'
      };
    }

    const date = new Date(timestamp * 1000);
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    
    const coinId = this.mapTokenToCoinId(tokenSymbol);
    
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/history`;
    
    const response = await fetch(`${url}?date=${dateStr}&localization=false`);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.market_data?.current_price?.usd) {
      throw new Error('Harga tidak ditemukan untuk tanggal tersebut');
    }

    const priceUSD = data.market_data.current_price.usd;
    const priceIDR = priceUSD * this.USD_TO_IDR;

    const priceData: HistoricalPrice = {
      timestamp,
      priceUSD,
      priceIDR,
      source: 'COINGECKO'
    };

    if (!this.cache[tokenSymbol]) {
      this.cache[tokenSymbol] = {};
    }
    this.cache[tokenSymbol][cacheKey] = priceData;

    return priceData;
  }

  private mapTokenToCoinId(tokenSymbol: string): string {
    const mapping: { [key: string]: string } = {
      'ETH': 'ethereum',
      'USDC': 'usd-coin',
      'DAI': 'dai',
      'USDT': 'tether',
      'WBTC': 'wrapped-bitcoin',
      'IDRX': 'idrx',
      'DEGEN': 'degen',
      'AERO': 'aerodrome-finance'
    };

    return mapping[tokenSymbol.toUpperCase()] || 'ethereum';
  }

  private getFallbackPrice(tokenSymbol: string): number {
    const cleanSymbol = tokenSymbol
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
    
    const fallbackPrices: { [key: string]: number } = {
        'ETH': 3000 * this.USD_TO_IDR,
        'USDC': 1 * this.USD_TO_IDR,
        'USDT': 1 * this.USD_TO_IDR,
        'DAI': 1 * this.USD_TO_IDR,
        'IDRX': 1 * this.USD_TO_IDR,
        'COMMON': 1 * this.USD_TO_IDR,
    };
    
    const price = fallbackPrices[cleanSymbol] || (1 * this.USD_TO_IDR);
    
    console.log(`Fallback price for ${tokenSymbol} (${cleanSymbol}): Rp ${price.toLocaleString('id-ID')}`);
    return price;
  }

  setExchangeRate(rate: number) {
    this.USD_TO_IDR = rate;
    this.cache = {};
  }
}

export const priceOracle = new PriceOracle();