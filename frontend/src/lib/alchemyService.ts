import {
  Alchemy,
  Network,
  AssetTransfersCategory,
  AssetTransfersResult,
  SortingOrder,
} from "alchemy-sdk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import {
  Address,
  RawTransaction,
  ApiResponse,
  Chain,
  UUID,
  TransactionHash,
  TransactionSource,
  UnixTimestamp,
} from "../types";

dotenv.config({ path: ".env.local" });

// 1. Inisialisasi Alchemy
const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

// Tambahkan interface lokal untuk membantu TypeScript memahami metadata
interface AssetTransfersResultWithMetadata extends AssetTransfersResult {
  metadata: {
    blockTimestamp: string;
  };
}

/**
 * Mengubah format data mentah Alchemy menjadi interface RawTransaction.
 */
const mapToRawTransaction = (
  alchemyTx: AssetTransfersResult,
  receipt: any,
): RawTransaction => {
  const txWithMeta = alchemyTx as AssetTransfersResultWithMetadata;
  const unixTime: UnixTimestamp = Math.floor(
    new Date(txWithMeta.metadata.blockTimestamp).getTime() / 1000,
  );

  return {
    id: uuidv4() as UUID,
    chain: "BASE" as Chain,
    hash: alchemyTx.hash as TransactionHash,
    block_number: parseInt(alchemyTx.blockNum, 16),
    timestamp: unixTime,
    from: alchemyTx.from as Address,
    to: (alchemyTx.to ||
      "0x0000000000000000000000000000000000000000") as Address,
    value: alchemyTx.value?.toString() || "0",
    gas_used: receipt?.gasUsed ? receipt.gasUsed.toString() : "0",
    gas_price: receipt?.effectiveGasPrice
      ? receipt.effectiveGasPrice.toString()
      : "0",
    method: alchemyTx.asset || "UNKNOWN",
    input_data: "0x",
    logs: receipt?.logs || [],
    status:
      receipt?.status === 1
        ? "SUCCESS"
        : receipt?.status === 0
          ? "FAILED"
          : "PENDING",
    source: "ALCHEMY" as TransactionSource,
    explorer_url: `https://basescan.org/tx/${alchemyTx.hash}`,
    internal_transactions: [],
  };
};

/**
 * Mengambil history transaksi wallet dan mengonversinya ke format RawTransaction.
 * @param walletAddress Alamat 0x...
 * @param limit Jumlah transaksi yang ingin diambil (default 20)
 */
export const syncWalletTransactions = async (
  walletAddress: Address,
  limit: number = 20,
): Promise<ApiResponse<RawTransaction[]>> => {
  try {
    if (!walletAddress.startsWith("0x")) {
      throw new Error("Invalid wallet address format.");
    }

    const transferResponse = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: walletAddress,
      category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
      withMetadata: true,
      maxCount: limit,
      order: SortingOrder.DESCENDING,
    });

    const formattedTransactions: RawTransaction[] = await Promise.all(
      transferResponse.transfers.map(async (tx) => {
        const receipt = await alchemy.core.getTransactionReceipt(tx.hash);
        return mapToRawTransaction(tx, receipt);
      }),
    );

    return {
      success: true,
      data: formattedTransactions,
      message: `Successfully synced ${formattedTransactions.length} transactions from Base`,
      meta: {
        total: formattedTransactions.length,
        chain: "BASE" as Chain,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("Alchemy Service Error:", error);
    return {
      success: false,
      data: [],
      message: error.message || "Failed to fetch on-chain data",
    };
  }
};
