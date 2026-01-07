export type UUID = string;
export type ISODateString = string;
export type UnixTimestamp = number;
export type Address = `0x${string}`;
export type TransactionHash = `0x${string}`;
export type ENSName = string;
export type FarcasterID = string;

export type Status = "IDLE" | "LOADING" | "SUCCESS" | "ERROR" | "PENDING";
export type Language = "id" | "en";

export type Chain =
  | "BASE"
  | "ETHEREUM"
  | "OPTIMISM"
  | "POLYGON"
  | "ARBITRUM"
  | "BSC"
  | "AVALANCHE"
  | "SOLANA"
  | "CUSTOM";

export type WalletProvider =
  | "COINBASE_SMART_WALLET"
  | "METAMASK"
  | "RABBY"
  | "TRUST"
  | "WALLET_CONNECT"
  | "RAINBOW"
  | "PHANTOM"
  | "EMBEDDED"
  | "UNKNOWN";

export type PriceSource =
  | "PYTH"
  | "CHAINLINK"
  | "COINGECKO"
  | "COINMARKETCAP"
  | "BINANCE"
  | "DEX_POOL"
  | "CEX_CSV"
  | "MOCK"
  | "MANUAL";

export type TransactionSource =
  | "BASESCAN_API"
  | "GOLDSKY"
  | "THE_GRAPH"
  | "ALCHEMY"
  | "MORALIS"
  | "ANKR"
  | "CEX_CSV"
  | "MANUAL_ENTRY"
  | "MOCK";

export type TransactionType = 
  | "SWAP" | "RECEIVE" | "TRANSFER" | "MINT" 
  | "TRANSFER_IN" | "TRANSFER_OUT" | "SELF" 
  | "UNKNOWN" | "BUY" | "SELL" | "INCOME";

export type TokenStandard =
  | "ERC20"
  | "ERC721"
  | "ERC1155"
  | "SPL"
  | "BEP20"
  | "NATIVE";

export type ExchangeType =
  | "DEX"
  | "CEX"
  | "P2P"
  | "OTC";

export type ComplianceStatus =
  | "PENDING"
  | "CALCULATED"
  | "OPTIMIZED"
  | "PAID"
  | "REPORTED"
  | "AUDITED"
  | "VERIFIED";

export type TaxYear = number;

export interface UserProfile {
  id: UUID;
  farcaster_id?: FarcasterID;
  ens_name?: ENSName;
  email?: string;
  phone?: string;
  locale: Language;
  created_at: ISODateString;
  last_login: ISODateString;
}

export interface ConnectedWallet {
  id: UUID;
  user_id: UUID;
  address: Address;
  chain: Chain;
  provider: WalletProvider;
  is_connected: boolean;
  is_primary: boolean;
  nickname?: string;
  last_synced: ISODateString;
  ens_avatar?: string;
  farcaster_username?: string;
}

export interface WalletSession {
  session_id: UUID;
  wallet_address: Address;
  provider: WalletProvider;
  chain: Chain;
  connected_at: ISODateString;
  expires_at: ISODateString;
  user_agent: string;
  ip_address?: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  chain: string;
  address: string | "NATIVE";
  standard: TokenStandard;
  is_stablecoin: boolean;
}


export interface AssetBalance {
  token: Token;
  amount: number;
  amount_idr: number;
  amount_usd: number;
  cost_basis_idr?: number;
  current_price_idr: number;
  pnl_idr: number;
  pnl_percentage: number;
  is_loss: boolean;
  last_updated: ISODateString;
}

export interface AssetPrice {
  id: UUID;
  token_symbol: string;
  token_address: Address | "NATIVE";
  chain: Chain;
  price_idr: number;
  price_usd: number;
  source: PriceSource;
  confidence: number;
  timestamp: ISODateString;
  block_number?: number;
  exchange?: string;
  liquidity?: number;
  is_verified: boolean;
}

export interface HistoricalPriceRequest {
  token_address: Address | "NATIVE";
  chain: Chain;
  timestamp: UnixTimestamp;
  required_confidence?: number;
}
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
export interface TransactionAssetLeg {
  id: UUID;
  token: Token;
  amount: number;
  amount_raw: string;
  price_idr: number;
  total_idr: number;
  wallet_effect: "IN" | "OUT" | "NEUTRAL";
  is_fee: boolean;
}
export interface ProcessedTransaction {
  id: string;
  chain: string;
  wallet_address: string;
  raw_transaction: RawTransaction;  
  type: string;
  legs: any[];
  timestamp: string;
  transaction_value_idr?: number;
  fee_amount: number;
  fee_idr: number;
  
  is_taxable: boolean;
  is_verified: boolean;
  source: string;
  tags: string[];
  imported_at: string;
  last_updated: string;
  
  fee_token: Token;
  main_token?: Token;
}

export interface CostBasis {
  id: UUID;
  wallet_address: Address;
  token: Token;
  acquired_at: ISODateString;
  amount: number;
  cost_idr: number;
  source_transaction_id: UUID;
  is_fully_sold: boolean;
  remaining_amount: number;
  tax_lot_id: UUID;
}

export interface TaxCalculation {
  id: UUID;
  transaction_id: UUID;
  wallet_address: Address;
  tax_year: TaxYear;
  token_sold: Token;
  amount_sold: number;
  proceeds_idr: number;
  cost_basis_idr: number;
  capital_gain_idr: number;
  tax_rate_pph: number;
  tax_rate_ppn?: number;
  tax_amount_pph: number;
  tax_amount_ppn?: number;
  total_tax_idr: number;
  is_profit: boolean;
  is_optimized: boolean;
  harvest_id?: UUID;
  calculated_at: ISODateString;
}

export interface TaxHarvestOpportunity {
  id: UUID;
  wallet_address: Address;
  token: Token;
  current_amount: number;
  current_price_idr: number;
  current_value_idr: number;
  cost_basis_idr: number;
  unrealized_loss_idr: number;
  loss_percentage: number;
  estimated_tax_saving_idr: number;
  suggested_action: "HARVEST" | "HOLD" | "IGNORE";
  reason: string;
  expiry_time?: ISODateString;
  created_at: ISODateString;
}

export interface TaxHarvestExecution {
  id: UUID;
  opportunity_id: UUID;
  wallet_address: Address;
  token: Token;
  amount_harvested: number;
  loss_realized_idr: number;
  tax_saved_estimate_idr: number;
  sell_transaction_id: UUID;
  buy_transaction_id: UUID;
  executed_at: ISODateString;
  status: "PENDING" | "EXECUTED" | "FAILED";
  gas_fee_idr?: number;
  smart_contract_address?: Address;
}

export interface TaxSummary {
  period_start: ISODateString;
  period_end: ISODateString;
  tax_year: TaxYear;
  total_transactions: number;
  taxable_transactions: number;
  total_volume_idr: number;
  total_proceeds_idr: number;
  total_cost_basis_idr: number;
  total_gain_idr: number;
  total_loss_idr: number;
  net_gain_idr: number;
  total_tax_pph: number;
  total_tax_ppn: number;
  total_tax_idr: number;
  tax_paid_idr: number;
  tax_due_idr: number;
  harvest_savings_idr: number;
  compliance_score: number;
  last_calculated: ISODateString;
}

export interface TaxReport {
  id: UUID;
  report_id: UUID;
  user_id: UUID;
  wallet_addresses: Address[];
  chain_scope: Chain[];
  tax_year: TaxYear;
  generated_at: ISODateString;
  period_start: ISODateString;
  period_end: ISODateString;
  summary: TaxSummary;
  transactions: ProcessedTransaction[];
  calculations: TaxCalculation[];
  harvests: TaxHarvestExecution[];
  file_name: string;
  file_hash: string;
  ipfs_cid?: string;
  is_final: boolean;
  downloaded_at?: ISODateString;
  submitted_to_djp?: boolean;
  djp_submission_id?: string;
}

export interface TaxVault {
  id: UUID;
  wallet_address: Address;
  contract_address: Address;
  chain: Chain;
  token: Token;
  balance_raw: string;
  balance_idr: number;
  apy?: number;
  yield_earned_idr: number;
  pending_deposits_idr: number;
  pending_withdrawals_idr: number;
  last_updated: ISODateString;
  is_active: boolean;
}

export interface VaultTransaction {
  id: UUID;
  vault_id: UUID;
  user_address: Address;
  type: "DEPOSIT" | "WITHDRAWAL" | "YIELD" | "TAX_PAYMENT";
  amount_idr: number;
  amount_raw: string;
  token: Token;
  transaction_hash?: TransactionHash;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  gas_fee_idr?: number;
  created_at: ISODateString;
  confirmed_at?: ISODateString;
  note?: string;
}

export interface ComplianceAttestation {
  id: UUID;
  user_id: UUID;
  wallet_address: Address;
  attestation_uid: string;
  nft_contract_address: Address;
  nft_token_id: string;
  tax_year: TaxYear;
  report_id: UUID;
  attestation_data: any;
  is_valid: boolean;
  verified_at: ISODateString;
  expires_at?: ISODateString;
  metadata: {
    compliance_score: number;
    total_tax_paid_idr: number;
    total_transactions: number;
    wallet_age_days: number;
    chains_used: Chain[];
  };
}

export interface ExchangeConnection {
  id: UUID;
  user_id: UUID;
  exchange_name: string;
  api_key_hashed: string;
  is_active: boolean;
  last_sync: ISODateString;
  sync_status: "IDLE" | "SYNCING" | "SUCCESS" | "ERROR";
  error_message?: string;
}

export interface CSVImportJob {
  id: UUID;
  user_id: UUID;
  file_name: string;
  file_size: number;
  exchange_name: string;
  status: "UPLOADING" | "PARSING" | "PROCESSING" | "COMPLETED" | "FAILED";
  rows_total: number;
  rows_processed: number;
  rows_failed: number;
  imported_transactions: UUID[];
  started_at: ISODateString;
  completed_at?: ISODateString;
  error_log?: string;
}

export interface FarcasterFrameSession {
  id: UUID;
  farcaster_id: FarcasterID;
  wallet_address: Address;
  frame_url: string;
  button_index?: number;
  input_text?: string;
  session_data: any;
  created_at: ISODateString;
  expires_at: ISODateString;
}

export interface TaxHealthScore {
  score: number;
  category: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "CRITICAL";
  factors: {
    completeness: number;
    timeliness: number;
    optimization: number;
    vault_coverage: number;
  };
  recommendations: string[];
  updated_at: ISODateString;
}

export interface AsyncState<T> {
  status: Status;
  data?: T;
  error?: string;
  timestamp: ISODateString;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: any;
}

export interface AppConfig {
  tax_rates: {
    pph: number;
    ppn: number;
    threshold_idr: number;
  };
  supported_chains: Chain[];
  supported_wallets: WalletProvider[];
  oracle_priority: PriceSource[];
  harvest_settings: {
    min_loss_percentage: number;
    min_tax_saving_idr: number;
    wash_sale_period_days: number;
  };
  vault_settings: {
    auto_deposit_percentage: number;
    min_deposit_idr: number;
    yield_strategy: "NONE" | "LOW_RISK_LP" | "STAKING";
  };
}

export interface UserSettings {
  user_id: UUID;
  language: Language;
  currency: "IDR" | "USD";
  tax_year: TaxYear;
  auto_sync: boolean;
  auto_harvest: boolean;
  harvest_threshold_idr: number;
  vault_auto_deposit: boolean;
  vault_percentage: number;
  notification_email: boolean;
  notification_push: boolean;
  notification_tax_due: boolean;
  notification_harvest: boolean;
  data_retention_months: number;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AppEvent {
  id: UUID;
  event_type: string;
  user_id?: UUID;
  wallet_address?: Address;
  data: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: ISODateString;
}

export interface ErrorLog {
  id: UUID;
  error_code: string;
  error_message: string;
  stack_trace?: string;
  user_id?: UUID;
  wallet_address?: Address;
  context: any;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  resolved: boolean;
  occurred_at: ISODateString;
  resolved_at?: ISODateString;
}

export interface TransactionMockFile {
  version: string;
  generated_at: ISODateString;
  description: string;
  wallet_address: Address;
  chain: Chain;
  transactions: ProcessedTransaction[];
}

export interface PriceMockFile {
  version: string;
  generated_at: ISODateString;
  description: string;
  prices: AssetPrice[];
}

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  wallet_address: Address;
  tax_year: TaxYear;
  total_tax_idr: number;
  harvest_saving_idr: number;
  compliance_score: number;
  is_complex: boolean;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type Nullable<T> = { [K in keyof T]: T[K] | null };
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
