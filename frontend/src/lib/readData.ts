import * as fs from "fs";
import * as path from "path";
import { CryptoTransaction } from "../types/transaction";

export const loadTransactions = (): CryptoTransaction[] => {
  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "mock",
      "transactions.json",
    );
    const rawData = fs.readFileSync(filePath, "utf-8");
    const transactions: CryptoTransaction[] = JSON.parse(rawData);

    return transactions;
  } catch (error) {
    console.error("Gagal membaca file JSON:", error);
    return [];
  }
};

// Test
const data = loadTransactions();
console.log(`Banyak Data: ${data.length}`);
