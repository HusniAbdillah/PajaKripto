export type TransactionType = "SWAP" | "RECEIVE" | "TRANSFER" | "MINT";

export interface CryptoTransaction {
  id: string;
  timestamp: string;
  type: TransactionType;
  asset?: string;
  amount?: number;
  price_at_date?: number;
  asset_sent?: string;
  amount_sent?: number;
  asset_received?: string;
  amount_received?: number;
  price_sent_at_date?: number;
  cost_eth?: number;
  price_eth_at_date?: number;
  fee_eth: number;
  to?: string;
  from?: string;
  note?: string;
}
