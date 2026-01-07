export interface RawTransaction {
  id: string;
  chain: string;
  hash: string;
  block_number: number;
  timestamp: number; 
  from: string;
  to: string;
  value: string; 
  gas_used: string;
  gas_price: string;
  method?: string;
  input_data?: string;
  logs: any[];
  status: "SUCCESS" | "FAILED" | "PENDING";
  source: string;
  explorer_url: string;
  internal_transactions: RawTransaction[];
}

export interface ProcessedTransaction {
  id: string;
  chain: string;
  wallet_address: string;
  raw_transaction: RawTransaction;
  type: string;
  legs: any[];
  timestamp: string; 
  fee_amount: number; 
  fee_idr: number;
  is_taxable: boolean;
  is_verified: boolean;
  source: string;
  tags: string[];
  imported_at: string;
  last_updated: string;
  fee_token: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}