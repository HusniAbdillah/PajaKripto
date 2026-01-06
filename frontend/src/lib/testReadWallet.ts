import {
  Alchemy,
  Network,
  AssetTransfersCategory,
  AssetTransfersWithMetadataResponse,
} from "alchemy-sdk";
import { v4 as uuidv4 } from "uuid"; // pnpm add uuid @types/uuid
import { RawTransaction } from "../types/index";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.ALCHEMY_RPC_URL
  ? process.env.ALCHEMY_RPC_URL.split("/").pop()
  : undefined;

if (!apiKey) {
  console.error(
    "Error: ALCHEMY_API_KEY is not defined in the environment variables.",
  );
  process.exit(1);
}

const config = {
  apiKey: apiKey,
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

export const fetchAndFormatTransactions = async (
  address: string,
): Promise<RawTransaction[]> => {
  // 1. Ambil data transfer dasar dengan metadata (timestamp)
  const response = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    fromAddress: address,
    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
    withMetadata: true,
    maxCount: 10, // Limit untuk testing
  });

  const rawTransactions: RawTransaction[] = await Promise.all(
    response.transfers.map(async (tx): Promise<RawTransaction> => {
      // Tambahkan return type di sini
      const receipt = await alchemy.core.getTransactionReceipt(tx.hash);

      return {
        id: uuidv4() as any, // Cast ke UUID jika UUID adalah branded type
        chain: "BASE" as any,
        hash: tx.hash as `0x${string}`, // SOLUSI: Cast string ke format 0x...
        block_number: parseInt(tx.blockNum, 16),
        timestamp: Math.floor(
          new Date(tx.metadata.blockTimestamp).getTime() / 1000,
        ) as any,
        from: tx.from as `0x${string}`,
        to: (tx.to ||
          "0x0000000000000000000000000000000000000000") as `0x${string}`,
        value: tx.value?.toString() || "0",
        gas_used: receipt?.gasUsed.toString() || "0",
        gas_price: receipt?.effectiveGasPrice.toString() || "0",
        method: tx.asset || "UNKNOWN",
        input_data: "0x",
        logs: receipt?.logs || [],
        status: receipt?.status === 1 ? "SUCCESS" : "FAILED",
        source: "ON_CHAIN" as any,
        explorer_url: `https://basescan.org/tx/${tx.hash}`,
        internal_transactions: [], // Jangan gunakan 'never[]', gunakan empty array
      };
    }),
  );

  return rawTransactions;
};

async function runTaxBase() {
  const walletAddress = "0xffa8DB7B38579e6A2D14f9B347a9acE4d044cD54";

  console.log("⏳ Sedang mengambil data transaksi dari Base...");

  try {
    const transactions = await fetchAndFormatTransactions(walletAddress);

    console.log(`✅ Berhasil mendapatkan ${transactions.length} transaksi.`);

    // Cetak 1 contoh transaksi untuk verifikasi
    if (transactions.length > 0) {
      console.log("Contoh Transaksi Pertama:", {
        hash: transactions[0].hash,
        status: transactions[0].status,
        value: transactions[0].value,
        timestamp: new Date(transactions[0].timestamp * 1000).toLocaleString(
          "id-ID",
        ),
      });
    }

    // Di sini Anda bisa memanggil fungsi kalkulator pajak nantinya
    // const totalTax = calculateTax(transactions);
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat memanggil fungsi:", err);
  }
}

runTaxBase();
