import { ProcessedTransaction, TransactionAssetLeg, Token } from "../types";

export type CostBasisMethod = "FIFO" | "AVERAGE";

export interface PositionEngineConfig {
  costBasisMethod?: CostBasisMethod;
  washSaleWindowDays?: number;
  minLossIdr?: number;
}

const DEFAULT_CONFIG: Required<PositionEngineConfig> = {
  costBasisMethod: "FIFO",
  washSaleWindowDays: 30,
  minLossIdr: 50_000,
};

export interface PositionLot {
  token: Token;
  amount: number;
  cost_idr: number;
  acquired_at: string;
  source_transaction_id: string;
}

export interface TokenPosition {
  token: Token;
  total_amount: number;
  total_cost_idr: number;
  average_cost_idr: number;
  lots: PositionLot[];
  last_updated: string;

  holding_days?: number;
  realized_cost_removed_idr?: number;
  flags?: {
    has_wash_sale_risk?: boolean;
    low_confidence?: boolean;
  };
}

export class PositionEngine {
  private config: Required<PositionEngineConfig>;

  constructor(config?: PositionEngineConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  buildPositions(
    transactions: ProcessedTransaction[]
  ): Map<string, TokenPosition> {
    const positions = new Map<string, TokenPosition>();

    const sortedTx = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const tx of sortedTx) {
      for (const leg of tx.legs as TransactionAssetLeg[]) {
        if (leg.is_fee || leg.wallet_effect === "NEUTRAL") continue;

        const key = this.tokenKey(leg.token);
        if (!positions.has(key)) {
          positions.set(key, this.createEmptyPosition(leg.token));
        }

        const position = positions.get(key)!;

        if (leg.wallet_effect === "IN") {
          this.handleBuy(position, leg, tx);
        } else {
          this.handleSell(position, leg, tx);
        }

        position.last_updated = tx.timestamp;
      }
    }

    this.postProcess(positions);

    return positions;
  }

  private handleBuy(
    position: TokenPosition,
    leg: TransactionAssetLeg,
    tx: ProcessedTransaction
  ) {
    position.total_amount += leg.amount;
    position.total_cost_idr += leg.total_idr;

    position.lots.push({
      token: leg.token,
      amount: leg.amount,
      cost_idr: leg.total_idr,
      acquired_at: tx.timestamp,
      source_transaction_id: tx.id,
    });

    position.average_cost_idr =
      position.total_cost_idr / position.total_amount;
  }

  private handleSell(
    position: TokenPosition,
    leg: TransactionAssetLeg,
    tx: ProcessedTransaction
  ) {
    let remaining = leg.amount;
    let costRemoved = 0;

    if (this.config.costBasisMethod === "AVERAGE") {
      costRemoved = leg.amount * position.average_cost_idr;
      position.total_amount -= leg.amount;
      position.total_cost_idr -= costRemoved;
    } else {
      while (remaining > 0 && position.lots.length > 0) {
        const lot = position.lots[0];
        if (lot.amount <= remaining) {
          remaining -= lot.amount;
          costRemoved += lot.cost_idr;
          position.lots.shift();
        } else {
          const ratio = remaining / lot.amount;
          const partialCost = lot.cost_idr * ratio;

          lot.amount -= remaining;
          lot.cost_idr -= partialCost;

          costRemoved += partialCost;
          remaining = 0;
        }
      }

      position.total_amount -= leg.amount;
      position.total_cost_idr -= costRemoved;
    }

    position.realized_cost_removed_idr =
      (position.realized_cost_removed_idr || 0) + costRemoved;

    if (position.total_amount > 0) {
      position.average_cost_idr =
        position.total_cost_idr / position.total_amount;
    } else {
      position.average_cost_idr = 0;
    }

    this.detectWashSaleRisk(position, tx.timestamp);
  }

  private postProcess(positions: Map<string, TokenPosition>) {
    for (const pos of positions.values()) {
      if (pos.lots.length > 0) {
        const firstLot = pos.lots[0];
        pos.holding_days = Math.floor(
          (Date.now() - new Date(firstLot.acquired_at).getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }

      if (pos.total_amount < 0 || pos.total_cost_idr < 0) {
        pos.flags = { ...pos.flags, low_confidence: true };
      }
    }
  }

  private detectWashSaleRisk(position: TokenPosition, sellTime: string) {
    const windowMs =
      this.config.washSaleWindowDays * 24 * 60 * 60 * 1000;
    const sellTs = new Date(sellTime).getTime();

    for (const lot of position.lots) {
      const buyTs = new Date(lot.acquired_at).getTime();
      if (Math.abs(buyTs - sellTs) <= windowMs) {
        position.flags = { ...position.flags, has_wash_sale_risk: true };
        return;
      }
    }
  }

  private createEmptyPosition(token: Token): TokenPosition {
    return {
      token,
      total_amount: 0,
      total_cost_idr: 0,
      average_cost_idr: 0,
      lots: [],
      last_updated: "",
    };
  }

  private tokenKey(token: Token): string {
    return `${token.chain}:${token.address}:${token.symbol}`;
  }
}

export const positionEngine = new PositionEngine();