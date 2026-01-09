import {
  RawTransaction,
  ProcessedTransaction,
  TransactionAssetLeg,
  Token,
  Chain,
  Address,
  ISODateString,
  TransactionType
} from "../types";

const nowISO = (): ISODateString => new Date().toISOString();

const toISO = (unix: number): ISODateString =>
  new Date(unix * 1000).toISOString();

const generateUUID = (): string =>
  crypto.randomUUID();

const NATIVE_TOKEN_MAP: Record<Chain, Token> = {
  ETHEREUM: {
    id: "eth-native",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    chain: "ETHEREUM",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  BASE: {
    id: "eth-base-native",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    chain: "BASE",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  OPTIMISM: {
    id: "eth-op-native",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    chain: "OPTIMISM",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  ARBITRUM: {
    id: "eth-arb-native",
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    chain: "ARBITRUM",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  POLYGON: {
    id: "matic-native",
    symbol: "MATIC",
    name: "Polygon",
    decimals: 18,
    chain: "POLYGON",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  BSC: {
    id: "bnb-native",
    symbol: "BNB",
    name: "Binance Coin",
    decimals: 18,
    chain: "BSC",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  AVALANCHE: {
    id: "avax-native",
    symbol: "AVAX",
    name: "Avalanche",
    decimals: 18,
    chain: "AVALANCHE",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  SOLANA: {
    id: "sol-native",
    symbol: "SOL",
    name: "Solana",
    decimals: 9,
    chain: "SOLANA",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
  CUSTOM: {
    id: "native-custom",
    symbol: "NATIVE",
    name: "Native Token",
    decimals: 18,
    chain: "CUSTOM",
    address: "NATIVE",
    standard: "NATIVE",
    is_stablecoin: false,
  },
};

function inferTransactionType(
  tx: RawTransaction,
  wallet: Address
): TransactionType {
  const from = tx.from.toLowerCase();
  const to = tx.to.toLowerCase();
  const w = wallet.toLowerCase();

  if (from === w && to === w) return "SELF";
  if (from === w) return "TRANSFER_OUT";
  if (to === w) return "TRANSFER_IN";
  return "UNKNOWN";
}

function buildNativeTransferLeg(
  tx: RawTransaction,
  wallet: Address,
  chain: Chain
): TransactionAssetLeg | null {
  if (!tx.value || tx.value === "0") return null;

  const isOut = tx.from.toLowerCase() === wallet.toLowerCase();

  return {
    id: generateUUID(),
    token: NATIVE_TOKEN_MAP[chain],
    amount: Number(tx.value) / 1e18,
    amount_raw: tx.value,
    price_idr: 0,
    total_idr: 0,
    wallet_effect: isOut ? "OUT" : "IN",
    is_fee: false
  };
}

function buildGasFeeLeg(
  tx: RawTransaction,
  chain: Chain
): TransactionAssetLeg {
  const feeRaw =
    BigInt(tx.gas_used) * BigInt(tx.gas_price);

  return {
    id: generateUUID(),
    token: NATIVE_TOKEN_MAP[chain],
    amount: Number(feeRaw) / 1e18,
    amount_raw: feeRaw.toString(),
    price_idr: 0,
    total_idr: 0,
    wallet_effect: "OUT",
    is_fee: true
  };
}

function hasEconomicEffect(
  legs: TransactionAssetLeg[]
): boolean {
  return legs.some(
    leg => !leg.is_fee && leg.amount > 0
  );
}

export function processAlchemyTransactionToPosition(
  tx: RawTransaction,
  wallet: Address,
  chain: Chain
): ProcessedTransaction | null {

  const legs: TransactionAssetLeg[] = [];

  const nativeLeg = buildNativeTransferLeg(tx, wallet, chain);
  if (nativeLeg && nativeLeg.amount > 0) {
    legs.push(nativeLeg);
  }

  const gasFeeLeg = buildGasFeeLeg(tx, chain);
  if (gasFeeLeg.amount > 0) {
    legs.push(gasFeeLeg);
  }

  if (!hasEconomicEffect(legs)) {
    return null;
  }

  const type = inferTransactionType(tx, wallet);

  return {
    id: tx.hash,
    chain,
    wallet_address: wallet,
    raw_transaction: tx,
    type,
    legs,
    timestamp: toISO(tx.timestamp),
    transaction_value_idr: 0,
    fee_amount: gasFeeLeg.amount,
    fee_idr: 0,
    is_taxable: type === "SELL" || type === "TRANSFER_OUT",
    is_verified: true,
    source: "ALCHEMY",
    tags: [],
    imported_at: nowISO(),
    last_updated: nowISO(),
    fee_token: NATIVE_TOKEN_MAP[chain],
    main_token: nativeLeg?.token
  };
}

export function processAlchemyBatchForPosition(
  txs: RawTransaction[],
  wallet: Address,
  chain: Chain
): ProcessedTransaction[] {
  return txs
    .map(tx =>
      processAlchemyTransactionToPosition(tx, wallet, chain)
    )
    .filter(
      (tx): tx is ProcessedTransaction => tx !== null
    );
}