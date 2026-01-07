import type { ProcessedTransaction, RawTransaction, Address } from "../types";
import { formatIDR } from "../utils/formatIDR";

const PPH_RATE_UNREGULATED = 0.01;
const PTKP_THRESHOLD_IDR = 54000000;

export interface RealTaxResult {
  transactionId: string;
  hash: string;
  timestamp: string;
  type: string;
  taxable: boolean;
  taxReason: string;
  from: string;
  to: string;
  tokenSymbol: string;
  tokenAmount: number;
  valueIDR: number;
  pphRate: number;
  pphAmountIDR: number;
  totalTaxIDR: number;
  blockNumber: number;
  gasFeeETH: number;
  gasFeeIDR: number;
  explorerUrl: string;
  success: boolean;
}

export interface RealTaxSummary {
  walletAddress: string;
  taxYear: number;
  totalTransactions: number;
  taxableTransactions: number;
  nonTaxableTransactions: number;
  totalValueIDR: number;
  totalTaxableValueIDR: number;
  totalPphIDR: number;
  totalGasFeeIDR: number;
  totalTaxIDR: number;
  periodStart: string;
  periodEnd: string;
  averageTaxRate: number;
  averageTransactionValueIDR: number;
  formatted: {
    totalValue: string;
    totalTaxableValue: string;
    totalPph: string;
    totalGasFee: string;
    totalTax: string;
    period: string;
    taxYear: string;
  };
}

export function calculateRealTax(
  transactions: ProcessedTransaction[],
  taxYear?: number
): {
  perTransaction: RealTaxResult[];
  summary: RealTaxSummary;
} {
  const taxResults: RealTaxResult[] = [];
  
  let totalTaxable = 0;
  let totalNonTaxable = 0;
  let totalValueIDR = 0;
  let totalTaxableValueIDR = 0;
  let totalPph = 0;
  let totalGasFee = 0;
  
  const currentYear = taxYear || new Date().getFullYear();
  const filteredTransactions = taxYear
    ? transactions.filter(tx => {
        const txYear = new Date(tx.timestamp).getFullYear();
        return txYear === taxYear;
      })
    : transactions;
  
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const dates = sortedTransactions.map(tx => new Date(tx.timestamp));
  const periodStart = dates.length > 0 
    ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const periodEnd = dates.length > 0
    ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  const walletAddress = sortedTransactions[0]?.wallet_address || 'Unknown';
  
  sortedTransactions.forEach(tx => {
    const raw = tx.raw_transaction;
    const valueIDR = tx.transaction_value_idr || 0;
    const taxable = tx.is_taxable;
    
    let taxReason = '';
    if (taxable) {
      taxReason = tx.type === 'SWAP' 
        ? 'Tukar-menukar Aset Kripto (swap) - Pasal 11 ayat (2) huruf b PMK 50/2025'
        : `Pengalihan Aset Kripto - Pasal 11 PMK 50/2025`;
    } else {
      taxReason = tx.type === 'TRANSFER_IN' 
        ? 'Penerimaan tanpa imbalan'
        : 'Bukan objek pajak';
    }
    
    let pphRate = 0;
    let pphAmountIDR = 0;
    
    if (taxable && valueIDR > 0) {
      pphRate = PPH_RATE_UNREGULATED;
      pphAmountIDR = valueIDR * pphRate;
    }
    
    const totalTaxIDR = pphAmountIDR;
    
    totalValueIDR += valueIDR;
    totalGasFee += tx.fee_idr || 0;
    
    if (taxable) {
      totalTaxable++;
      totalTaxableValueIDR += valueIDR;
      totalPph += pphAmountIDR;
    } else {
      totalNonTaxable++;
    }
    
    taxResults.push({
      transactionId: tx.id,
      hash: raw.hash,
      timestamp: tx.timestamp,
      type: tx.type,
      taxable,
      taxReason,
      from: raw.from,
      to: raw.to,
      tokenSymbol: tx.main_token?.symbol || 'ETH',
      tokenAmount: parseFloat(raw.value) / 1e18,
      valueIDR,
      pphRate,
      pphAmountIDR,
      totalTaxIDR,
      blockNumber: raw.block_number,
      gasFeeETH: tx.fee_amount,
      gasFeeIDR: tx.fee_idr || 0,
      explorerUrl: raw.explorer_url,
      success: raw.status === "SUCCESS"
    });
  });
  
  const totalTransactions = sortedTransactions.length;
  const averageTaxRate = totalTaxableValueIDR > 0 
    ? (totalPph / totalTaxableValueIDR) 
    : 0;
  const averageTransactionValueIDR = totalTransactions > 0
    ? (totalValueIDR / totalTransactions)
    : 0;
  
  const summary: RealTaxSummary = {
    walletAddress,
    taxYear: currentYear,
    totalTransactions,
    taxableTransactions: totalTaxable,
    nonTaxableTransactions: totalNonTaxable,
    totalValueIDR,
    totalTaxableValueIDR,
    totalPphIDR: totalPph,
    totalGasFeeIDR: totalGasFee,
    totalTaxIDR: totalPph,
    periodStart,
    periodEnd,
    averageTaxRate,
    averageTransactionValueIDR,
    formatted: {
      totalValue: formatIDR(totalValueIDR),
      totalTaxableValue: formatIDR(totalTaxableValueIDR),
      totalPph: formatIDR(totalPph),
      totalGasFee: formatIDR(totalGasFee),
      totalTax: formatIDR(totalPph),
      period: `${periodStart} s/d ${periodEnd}`,
      taxYear: currentYear.toString()
    }
  };
  
  return {
    perTransaction: taxResults,
    summary
  };
}

export async function calculateTaxFromWallet(
  walletAddress: Address,
  options: {
    limit?: number;
    taxYear?: number;
  } = {}
): Promise<{
  taxResults: ReturnType<typeof calculateRealTax>;
  source: 'BLOCKCHAIN';
}> {
  const { limit = 20, taxYear } = options;
  
  if (!walletAddress.startsWith('0x')) {
    throw new Error('Invalid wallet address format');
  }
  
  const { syncWalletTransactions } = await import('./alchemyService');
  const rawResponse = await syncWalletTransactions(walletAddress, limit);
  
  if (!rawResponse.success) {
    throw new Error(`Gagal mengambil data: ${rawResponse.message}`);
  }
  
  const { processRawTransactions } = await import('./transactionProcessor');
  const processedTransactions = await processRawTransactions(
    rawResponse.data, 
    walletAddress
  );
  
  const taxResults = calculateRealTax(processedTransactions, taxYear);
  
  return {
    taxResults,
    source: 'BLOCKCHAIN'
  };
}

export function generateRealTaxReport(
  taxResults: ReturnType<typeof calculateRealTax>,
  source: 'BLOCKCHAIN' | 'MOCK_FALLBACK' = 'BLOCKCHAIN'
): string {
  const { summary, perTransaction } = taxResults;
  
  let report = `LAPORAN PAJAK ASET KRIPTO\n`;
  report += `Berdasarkan PMK No. 50 Tahun 2025\n`;
  report += `═`.repeat(60) + `\n\n`;
  
  report += `Wallet: ${summary.walletAddress}\n`;
  report += `Tahun Pajak: ${summary.formatted.taxYear}\n`;
  report += `Periode: ${summary.formatted.period}\n`;
  report += `Sumber: ${source === 'BLOCKCHAIN' ? 'Blockchain' : 'Mock Data'}\n\n`;
  
  report += `Ringkasan:\n`;
  report += `─`.repeat(40) + `\n`;
  report += `Total Transaksi: ${summary.totalTransactions}\n`;
  report += `Transaksi Kena Pajak: ${summary.taxableTransactions}\n`;
  report += `Total Nilai: ${summary.formatted.totalValue}\n`;
  report += `Total PPh (1%): ${summary.formatted.totalPph}\n`;
  report += `Total Biaya Gas: ${summary.formatted.totalGasFee}\n`;
  report += `TOTAL PAJAK: ${summary.formatted.totalTax}\n\n`;
  
  report += `Transaksi Terbaru:\n`;
  report += `═`.repeat(60) + `\n`;
  
  perTransaction.slice(-5).forEach((result, index) => {
    report += `\n[${index + 1}] ${result.hash.substring(0, 12)}...\n`;
    report += `   ${new Date(result.timestamp).toLocaleDateString('id-ID')} - ${result.type}\n`;
    report += `   Status: ${result.taxable ? 'KENA PAJAK' : 'TIDAK KENA PAJAK'}\n`;
    
    if (result.taxable && result.valueIDR > 0) {
      report += `   Nilai: ${formatIDR(result.valueIDR)}\n`;
      report += `   PPh: ${formatIDR(result.pphAmountIDR)}\n`;
    }
  });
  
  return report;
}

export default {
  calculateRealTax,
  calculateTaxFromWallet,
  generateRealTaxReport,
  formatIDR
};