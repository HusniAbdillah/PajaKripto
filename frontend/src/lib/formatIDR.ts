export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Test
import { loadMockTransactions } from "./readMockupDataTransaction";

const txs = loadMockTransactions();
txs.forEach((tx) => {
  if (tx.amount_received && tx.asset_received === "IDRX") {
    console.log(`Penerimaan: ${formatIDR(tx.amount_received)}`);
  }
});
