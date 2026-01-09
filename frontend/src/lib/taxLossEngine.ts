import { TokenPosition } from "./positionEngine";
import { priceOracle } from "./priceOracle";

export interface TaxLossCandidate {
  token: {
    symbol: string;
    chain: string;
    address: string;
  };

  amount: number;

  average_cost_idr: number;
  current_price_idr: number;

  unrealized_loss_idr: number;
  unrealized_loss_percent: number;

  estimated_tax_saving_idr: number;

  holding_days?: number;

  flags: {
    wash_sale_risk?: boolean;
    low_confidence?: boolean;
    illiquid?: boolean;
  };

  recommendation: "STRONG_SELL" | "SELL" | "HOLD" | "IGNORE";
}

export interface TaxLossConfig {
  taxRate?: number;
  minLossIdr?: number;
  minLossPercent?: number;
  ignoreStablecoin?: boolean;
}

const DEFAULT_CONFIG: Required<TaxLossConfig> = {
  taxRate: 0.1,
  minLossIdr: 100_000,
  minLossPercent: 5,
  ignoreStablecoin: true,
};

export class TaxLossEngine {
  private config: Required<TaxLossConfig>;

  constructor(config?: TaxLossConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async detectTaxLoss(
    positions: Iterable<TokenPosition>,
    timestamp: number
  ): Promise<TaxLossCandidate[]> {
    const results: TaxLossCandidate[] = [];

    for (const pos of positions) {
      if (pos.total_amount <= 0) continue;

      if (this.config.ignoreStablecoin && this.isStablecoin(pos.token.symbol)) {
        continue;
      }

      const currentPrice = await priceOracle.getPrice(
        pos.token.symbol,
        timestamp
      );

      const avgCost = pos.average_cost_idr;
      if (currentPrice >= avgCost) continue;

      const lossPerUnit = avgCost - currentPrice;
      const unrealizedLoss = lossPerUnit * pos.total_amount;
      const lossPercent = (lossPerUnit / avgCost) * 100;

      if (
        unrealizedLoss < this.config.minLossIdr ||
        lossPercent < this.config.minLossPercent
      ) {
        continue;
      }

      const estimatedTaxSaving =
        unrealizedLoss * this.config.taxRate;

      const candidate: TaxLossCandidate = {
        token: pos.token,
        amount: pos.total_amount,
        average_cost_idr: avgCost,
        current_price_idr: currentPrice,
        unrealized_loss_idr: unrealizedLoss,
        unrealized_loss_percent: lossPercent,
        estimated_tax_saving_idr: estimatedTaxSaving,
        holding_days: pos.holding_days,
        flags: {
          wash_sale_risk: pos.flags?.has_wash_sale_risk,
          low_confidence: pos.flags?.low_confidence,
        },
        recommendation: this.classify(unrealizedLoss, lossPercent, pos),
      };

      results.push(candidate);
    }

    return this.rank(results);
  }

  private classify(
    lossIdr: number,
    lossPercent: number,
    pos: TokenPosition
  ): TaxLossCandidate["recommendation"] {
    if (pos.flags?.has_wash_sale_risk) return "HOLD";
    if (lossIdr > 10_000_000 || lossPercent > 30) return "STRONG_SELL";
    if (lossIdr > 1_000_000 || lossPercent > 10) return "SELL";
    return "HOLD";
  }

  private rank(
    list: TaxLossCandidate[]
  ): TaxLossCandidate[] {
    return list.sort(
      (a, b) =>
        b.estimated_tax_saving_idr -
        a.estimated_tax_saving_idr
    );
  }

  private isStablecoin(symbol: string): boolean {
    return ["USDT", "USDC", "DAI", "BUSD"].includes(symbol);
  }
}

export const taxLossEngine = new TaxLossEngine();

export async function detectTaxLoss(
  positions: Iterable<TokenPosition>,
  timestamp: number
) {
  return taxLossEngine.detectTaxLoss(positions, timestamp);
}