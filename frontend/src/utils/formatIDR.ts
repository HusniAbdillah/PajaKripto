export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Test
import { loadTransactions } from "../lib/readData";

const txs = loadTransactions();
txs.forEach((tx) => {
  if (tx.amount_received && tx.asset_received === "IDRX") {
    console.log(`Penerimaan: ${formatIDR(tx.amount_received)}`);
  }
});
