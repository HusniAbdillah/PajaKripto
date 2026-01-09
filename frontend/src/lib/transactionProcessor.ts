import {
  RawTransaction,
  ProcessedTransaction,
  Address,
  TransactionType,
  UUID,
  ISODateString,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { priceOracle } from "./priceOracle"; 

const detectTokenFromTransaction = (tx: RawTransaction): string => {
  if (!tx.method || tx.method === 'UNKNOWN') {
    return 'ETH';
  }
  
  const method = tx.method.trim();
  
  console.log(`Token Detection: "${method}"`);
  
  if (method === 'ETH' || method === 'ETHER' || method === '0x') {
    return 'ETH';
  }
  
  if (method.includes('USDC') || method.includes('USD') || 
      method.includes('ꓴꓢꓓC') || method.includes('USDⅭ')) {
    console.log(`-> Detected as USDC (from "${method}")`);
    return 'USDC';
  }
  
  if (method === 'COMMON') {
    console.log(`-> Detected as USDC (COMMON token to ${tx.to.substring(0, 10)}...)`);
    return 'USDC';
  }
  
  const normalized = method
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
  
  if (normalized && normalized !== 'ETH') {
    console.log(`-> Normalized to: ${normalized}`);
    return normalized;
  }
  
  return 'ETH';
};

const detectTransactionType = (
  tx: RawTransaction,
  walletAddress: Address,
): TransactionType => {
  const isFromMe = tx.from.toLowerCase() === walletAddress.toLowerCase();
  const isToMe = tx.to.toLowerCase() === walletAddress.toLowerCase();

  if (tx.from === "0x0000000000000000000000000000000000000000" && isToMe) {
    return "MINT";
  }

  if (tx.method !== "ETH" && tx.method !== "UNKNOWN") {
    return "SWAP";
  }

  if (isFromMe && isToMe) return "SELF";
  if (isFromMe) return "TRANSFER_OUT";
  if (isToMe) return "TRANSFER_IN";

  return "UNKNOWN";
};

const calculateTransactionValueIDR = async (
  tx: RawTransaction,
  tokenSymbol: string
): Promise<number> => {
  try {
    let decimals = 18;
    
    if (tokenSymbol === 'USDC' || tokenSymbol === 'USDT' || tokenSymbol === 'DAI') {
      decimals = 6;
    } else if (tokenSymbol === 'ETH') {
      decimals = 18;
    } else {
      const valueNum = parseFloat(tx.value);
      if (valueNum < 1e12) {
        decimals = 6;
      } else {
        decimals = 18;
      }
    }
    
    const tokenAmount = parseFloat(tx.value) / Math.pow(10, decimals);
    
    console.log(`${tx.hash.substring(0, 10)}...`);
    console.log(`Token: ${tokenSymbol}, Decimals: ${decimals}`);
    console.log(`Raw: ${tx.value} wei -> ${tokenAmount} ${tokenSymbol}`);
    
    const priceIDR = await priceOracle.getPrice(tokenSymbol, tx.timestamp);
    const valueIDR = tokenAmount * priceIDR;
    
    console.log(`Price: Rp ${priceIDR.toLocaleString('id-ID')}`);
    console.log(`Value: Rp ${valueIDR.toLocaleString('id-ID')}`);
    
    return valueIDR;
    
  } catch (error) {
    console.warn(`Gagal hitung ${tx.hash}:`, error);
    return 0;
  }
};

export const processRawTransactions = async (
  rawTxs: RawTransaction[],
  walletAddress: Address,
): Promise<ProcessedTransaction[]> => {
  const now = new Date().toISOString() as ISODateString;
  const processedTxs: ProcessedTransaction[] = [];

  for (const raw of rawTxs) {
    try {
      const type = detectTransactionType(raw, walletAddress);
      const tokenSymbol = detectTokenFromTransaction(raw);
      
      const valueIDR = await calculateTransactionValueIDR(raw, tokenSymbol);
      
      const gasUsedETH = parseFloat(raw.gas_used) / 1e18;
      const gasPriceETH = parseFloat(raw.gas_price) / 1e18;
      const gasFeeETH = gasUsedETH * gasPriceETH;
      
      const ethPriceIDR = await priceOracle.getPrice(
      "ETH",
      raw.timestamp
    );
      const gasFeeIDR = gasFeeETH * ethPriceIDR;

      const isTaxable = ["SWAP", "TRANSFER_OUT", "MINT"].includes(type);

      const processedTx: ProcessedTransaction = {
        id: uuidv4() as UUID,
        chain: raw.chain,
        wallet_address: walletAddress,
        raw_transaction: raw,
        type: type,
        legs: [],
        timestamp: new Date(raw.timestamp * 1000).toISOString() as ISODateString,
        fee_amount: gasFeeETH,
        fee_idr: gasFeeIDR,
        transaction_value_idr: valueIDR,
        is_taxable: isTaxable,
        is_verified: raw.status === "SUCCESS",
        source: "onchain",
        tags: [type.toLowerCase(), raw.chain.toLowerCase(), tokenSymbol.toLowerCase()],
        imported_at: now,
        last_updated: now,
        fee_token: {
          symbol: "ETH",
          name: "Ethereum",
          decimals: 18,
          chain: "BASE",
          address: "NATIVE",
          standard: "NATIVE",
          is_stablecoin: false,
          id: uuidv4() as UUID,
        },
        main_token: {
          symbol: tokenSymbol,
          name: tokenSymbol,
          decimals: tokenSymbol === 'ETH' ? 18 : 6,
          chain: "BASE",
          address: "NATIVE",
          standard: tokenSymbol === 'ETH' ? "NATIVE" : "ERC20",
          is_stablecoin: ["USDC", "USDT", "DAI", "IDRX"].includes(tokenSymbol),
          id: uuidv4() as UUID,
        }
      };

      processedTxs.push(processedTx);
      
    } catch (error) {
      console.error(`[TransactionProcessor] Gagal memproses tx ${raw.hash}:`, error);
    }
  }

  console.log(`Berhasil memproses ${processedTxs.length}/${rawTxs.length} transaksi`);
  return processedTxs;
};