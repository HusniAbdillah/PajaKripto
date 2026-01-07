import {
  RawTransaction,
  ProcessedTransaction,
  Address,
  TransactionType,
  UUID,
  ISODateString,
} from "../types";
import { v4 as uuidv4 } from "uuid";

/**
 * Mendeteksi jenis transaksi berdasarkan arah alur dana dan data input.
 */
const detectTransactionType = (
  tx: RawTransaction,
  walletAddress: Address,
): TransactionType => {
  const isFromMe = tx.from.toLowerCase() === walletAddress.toLowerCase();
  const isToMe = tx.to.toLowerCase() === walletAddress.toLowerCase();

  // 1. Deteksi Minting (Berasal dari alamat nol)
  if (tx.from === "0x0000000000000000000000000000000000000000" && isToMe) {
    return "MINT";
  }

  // 2. Deteksi Swap (Logika sederhana: Jika berinteraksi dengan Router/Contract)
  if (tx.method !== "ETH" && tx.method !== "UNKNOWN") {
    return "SWAP";
  }

  // 3. Alur Dana Dasar
  if (isFromMe && isToMe) return "SELF";
  if (isFromMe) return "TRANSFER_OUT";
  if (isToMe) return "TRANSFER_IN";

  return "UNKNOWN";
};

/**
 * Mengubah RawTransaction[] menjadi ProcessedTransaction[]
 */
export const processRawTransactions = (
  rawTxs: RawTransaction[],
  walletAddress: Address,
): ProcessedTransaction[] => {
  const now = new Date().toISOString() as ISODateString;

  return rawTxs.map((raw) => {
    const type = detectTransactionType(raw, walletAddress);

    return {
      id: uuidv4() as UUID,
      chain: raw.chain,
      wallet_address: walletAddress,
      raw_transaction: raw,
      type: type,
      legs: [],
      timestamp: new Date(raw.timestamp * 1000).toISOString() as ISODateString,

      fee_amount: (Number(raw.gas_used) * Number(raw.gas_price)) / 1e18,
      fee_idr: 0, // Butuh Price Oracle untuk mengisi ini

      // Metadata
      is_taxable: ["SWAP", "SELL", "MINT", "INCOME"].includes(type),
      is_verified: false,
      source: "onchain",
      tags: [type.toLowerCase(), "base-network"],
      imported_at: now,
      last_updated: now,

      // Placeholder untuk Token Fee (Default ke Native ETH di Base)
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
    };
  });
};
