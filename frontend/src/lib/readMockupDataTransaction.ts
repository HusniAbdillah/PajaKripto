import * as fs from "fs";
import * as path from "path";
import { CryptoTransaction } from "./typesTransaction";

export const loadMockTransactions = (): CryptoTransaction[] => {
  try {
    const filePath = path.join(
      __dirname,
      "..",
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
const data = loadMockTransactions();
console.log(`Banyak Data: ${data.length}`);
