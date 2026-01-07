import { syncWalletTransactions } from "./alchemyService";
import { processRawTransactions } from "./transactionProcessor";

const wallet = "0xffa8DB7B38579e6A2D14f9B347a9acE4d044cD54";

// 1. Tarik data mentah dari blockchain
const rawData = await syncWalletTransactions(wallet);

if (rawData.success) {
  // 2. Olah menjadi data siap pajak
  const processedData = processRawTransactions(rawData.data, wallet);

  const contohData = processedData[0];
  console.log(contohData);
}
