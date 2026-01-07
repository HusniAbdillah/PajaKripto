import type { CryptoTransaction } from '../types/transaction';
import { formatIDR } from '../utils//formatIDR';
import { loadTransactions } from '../lib/readData';

export const PPH_RATE_REGULATED = 0.0021;
export const PPH_RATE_UNREGULATED = 0.01;
export const PPN_RATE = 0.11;

const DEFAULT_TAX_RATE = PPH_RATE_UNREGULATED;
const USD_TO_IDR_RATE = 15000;

export interface TaxCalculationResult {
  transactionId: string;
  transactionType: CryptoTransaction['type'];
  timestamp: string;
  taxable: boolean;
  taxReason: string;
  assetInvolved?: string;
  transactionValueIDR: number;
  pphRate: number;
  pphAmountIDR: number;
  ppnRate?: number;
  ppnAmountIDR?: number;
  totalTaxIDR: number;
  calculationDate: string;
  notes?: string;
}

export interface TaxSummary {
  totalTransactions: number;
  taxableTransactions: number;
  nonTaxableTransactions: number;
  totalTransactionValueIDR: number;
  totalPphIDR: number;
  totalPpnIDR: number;
  totalTaxIDR: number;
  periodStart: string;
  periodEnd: string;
  averageTaxRate: number;
  formatted: {
    totalTransactionValue: string;
    totalPph: string;
    totalPpn: string;
    totalTax: string;
    period: string;
  };
}

function isTaxableTransaction(tx: CryptoTransaction): boolean {
  switch (tx.type) {
    case 'SWAP':
      return true;
    case 'RECEIVE':
      const isMiningReward = tx.from?.includes('Pool') || 
                             tx.from?.includes('Rewards') ||
                             tx.note?.toLowerCase().includes('staking') ||
                             tx.note?.toLowerCase().includes('reward');
      return isMiningReward || false;
    case 'MINT':
      return false;
    case 'TRANSFER':
      const isSelfTransfer = tx.to?.includes('Vault') || 
                            tx.to?.includes('Friend') ||
                            tx.note?.includes('Auto-tax') ||
                            tx.note?.toLowerCase().includes('self');
      return !isSelfTransfer;
    default:
      return false;
  }
}

function getTaxReason(tx: CryptoTransaction): string {
  if (!isTaxableTransaction(tx)) {
    return getNonTaxableReason(tx);
  }
  
  switch (tx.type) {
    case 'SWAP':
      return 'Tukar-menukar Aset Kripto (swap) sesuai Pasal 11 ayat (2) huruf b PMK 50/2025';
    case 'RECEIVE':
      if (tx.from?.includes('Pool') || tx.from?.includes('Rewards')) {
        return 'Imbalan mining/staking sesuai Pasal 24 ayat (2) PMK 50/2025';
      }
      return 'Penerimaan Aset Kripto sebagai penghasilan';
    case 'TRANSFER':
      return 'Pengalihan Aset Kripto dengan imbalan';
    default:
      return 'Penghasilan dari transaksi Aset Kripto sesuai Pasal 11 PMK 50/2025';
  }
}

function getNonTaxableReason(tx: CryptoTransaction): string {
  switch (tx.type) {
    case 'MINT':
      return 'Minting NFT/token bukan transaksi jual-beli aset kripto';
    case 'TRANSFER':
      if (tx.to?.includes('Vault')) return 'Transfer ke vault sendiri';
      if (tx.to?.includes('Friend')) return 'Transfer ke teman (non-bisnis)';
      return 'Transfer antar wallet sendiri';
    case 'RECEIVE':
      if (!tx.from?.includes('Pool') && !tx.from?.includes('Rewards')) {
        return 'Penerimaan non-bisnis/pribadi';
      }
      return 'Penerimaan tanpa imbalan';
    default:
      return 'Bukan objek pajak menurut PMK 50/2025';
  }
}

function calculateTransactionValueIDR(tx: CryptoTransaction): number {
  switch (tx.type) {
    case 'SWAP':
      if (tx.asset_sent && tx.amount_sent && tx.price_sent_at_date) {
        let valueUSD = tx.amount_sent * tx.price_sent_at_date;
        return valueUSD * USD_TO_IDR_RATE;
      }
      return 0;
    case 'RECEIVE':
      if (tx.asset && tx.amount && tx.price_at_date) {
        return tx.amount * tx.price_at_date * USD_TO_IDR_RATE;
      }
      return 0;
    case 'TRANSFER':
      if (tx.asset && tx.amount && tx.price_at_date) {
        return tx.amount * tx.price_at_date * USD_TO_IDR_RATE;
      }
      return 0;
    default:
      return 0;
  }
}

function getPphRate(tx: CryptoTransaction): number {
  return DEFAULT_TAX_RATE;
}

function calculatePpnIfApplicable(tx: CryptoTransaction, transactionValueIDR: number): {
  ppnRate?: number;
  ppnAmountIDR?: number;
} {
  return {
    ppnRate: undefined,
    ppnAmountIDR: undefined
  };
}

export function calculateTax(transactions: CryptoTransaction[]): {
  perTransaction: TaxCalculationResult[];
  summary: TaxSummary;
} {
  const taxResults: TaxCalculationResult[] = [];
  
  let totalTaxable = 0;
  let totalNonTaxable = 0;
  let totalTransactionValue = 0;
  let totalPph = 0;
  let totalPpn = 0;
  
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const dates = sortedTransactions.map(tx => new Date(tx.timestamp));
  const periodStart = dates.length > 0 
    ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  const periodEnd = dates.length > 0
    ? new Date(Math.max(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  sortedTransactions.forEach(tx => {
    const taxable = isTaxableTransaction(tx);
    const transactionValueIDR = calculateTransactionValueIDR(tx);
    const taxReason = getTaxReason(tx);
    
    if (taxable) {
      totalTaxable++;
      totalTransactionValue += transactionValueIDR;
      
      const pphRate = getPphRate(tx);
      const pphAmountIDR = transactionValueIDR * pphRate;
      totalPph += pphAmountIDR;
      
      const ppn = calculatePpnIfApplicable(tx, transactionValueIDR);
      if (ppn.ppnAmountIDR) {
        totalPpn += ppn.ppnAmountIDR;
      }
      
      const totalTaxIDR = pphAmountIDR + (ppn.ppnAmountIDR || 0);
      
      taxResults.push({
        transactionId: tx.id,
        transactionType: tx.type,
        timestamp: tx.timestamp,
        taxable: true,
        taxReason,
        assetInvolved: tx.asset_sent || tx.asset_received || tx.asset,
        transactionValueIDR,
        pphRate,
        pphAmountIDR,
        ppnRate: ppn.ppnRate,
        ppnAmountIDR: ppn.ppnAmountIDR,
        totalTaxIDR,
        calculationDate: new Date().toISOString(),
        notes: tx.note
      });
    } else {
      totalNonTaxable++;
      
      taxResults.push({
        transactionId: tx.id,
        transactionType: tx.type,
        timestamp: tx.timestamp,
        taxable: false,
        taxReason,
        transactionValueIDR: 0,
        pphRate: 0,
        pphAmountIDR: 0,
        totalTaxIDR: 0,
        calculationDate: new Date().toISOString(),
        notes: tx.note
      });
    }
  });
  
  const averageTaxRate = totalTransactionValue > 0 
    ? (totalPph / totalTransactionValue) 
    : 0;
  
  const summary: TaxSummary = {
    totalTransactions: transactions.length,
    taxableTransactions: totalTaxable,
    nonTaxableTransactions: totalNonTaxable,
    totalTransactionValueIDR: totalTransactionValue,
    totalPphIDR: totalPph,
    totalPpnIDR: totalPpn,
    totalTaxIDR: totalPph + totalPpn,
    periodStart,
    periodEnd,
    averageTaxRate,
    formatted: {
      totalTransactionValue: formatIDR(totalTransactionValue),
      totalPph: formatIDR(totalPph),
      totalPpn: formatIDR(totalPpn),
      totalTax: formatIDR(totalPph + totalPpn),
      period: `${periodStart} s/d ${periodEnd}`
    }
  };
  
  return {
    perTransaction: taxResults,
    summary
  };
}

export function calculateTaxFromFile(): ReturnType<typeof calculateTax> {
  const transactions = loadTransactions();
  return calculateTax(transactions);
}

export function calculateSingleTransactionTax(tx: CryptoTransaction): TaxCalculationResult {
  const result = calculateTax([tx]);
  return result.perTransaction[0];
}

export function checkSPTObligation(
  taxSummary: TaxSummary,
  otherIncomeIDR: number = 0
): {
  mustReport: boolean;
  reason: string;
  totalIncomeIDR: number;
  ptkpThresholdIDR: number;
} {
  const PTKP_THRESHOLD = 54000000;
  const totalIncome = taxSummary.totalTransactionValueIDR + otherIncomeIDR;
  
  const mustReport = totalIncome > PTKP_THRESHOLD;
  
  return {
    mustReport,
    reason: mustReport 
      ? `Total penghasilan ${formatIDR(totalIncome)} melebihi PTKP ${formatIDR(PTKP_THRESHOLD)}`
      : `Total penghasilan ${formatIDR(totalIncome)} di bawah PTKP`,
    totalIncomeIDR: totalIncome,
    ptkpThresholdIDR: PTKP_THRESHOLD
  };
}

export function generateTaxReport(
  taxResults: ReturnType<typeof calculateTax>
): string {
  const { summary, perTransaction } = taxResults;
  
  let report = `LAPORAN PERHITUNGAN PAJAK ASET KRIPTO\n`;
  report += `Berdasarkan PMK No. 50 Tahun 2025\n`;
  report += `Periode: ${summary.formatted.period}\n`;
  report += `═`.repeat(50) + `\n\n`;
  
  report += `RINGKASAN:\n`;
  report += `- Total Transaksi: ${summary.totalTransactions}\n`;
  report += `- Transaksi Kena Pajak: ${summary.taxableTransactions}\n`;
  report += `- Transaksi Tidak Kena Pajak: ${summary.nonTaxableTransactions}\n`;
  report += `- Nilai Transaksi Total: ${summary.formatted.totalTransactionValue}\n`;
  report += `- Total PPh (${(DEFAULT_TAX_RATE * 100).toFixed(2)}%): ${summary.formatted.totalPph}\n`;
  
  if (summary.totalPpnIDR > 0) {
    report += `- Total PPN (11%): ${summary.formatted.totalPpn}\n`;
  }
  
  report += `- TOTAL PAJAK TERUTANG: ${summary.formatted.totalTax}\n`;
  report += `- Rata-rata Tarif Pajak: ${(summary.averageTaxRate * 100).toFixed(2)}%\n\n`;
  
  report += `DETAIL TRANSAKSI:\n`;
  report += `═`.repeat(50) + `\n`;
  
  perTransaction.forEach((result, index) => {
    report += `\n[${index + 1}] ${result.transactionId} - ${result.transactionType}\n`;
    report += `    Tanggal: ${new Date(result.timestamp).toLocaleDateString('id-ID')}\n`;
    report += `    Status: ${result.taxable ? 'KENA PAJAK' : 'TIDAK KENA PAJAK'}\n`;
    report += `    Alasan: ${result.taxReason}\n`;
    
    if (result.taxable && result.transactionValueIDR > 0) {
      report += `    Nilai Transaksi: ${formatIDR(result.transactionValueIDR)}\n`;
      report += `    PPh (${(result.pphRate * 100).toFixed(2)}%): ${formatIDR(result.pphAmountIDR)}\n`;
      
      if (result.ppnAmountIDR) {
        report += `    PPN (${((result.ppnRate || 0) * 100).toFixed(2)}%): ${formatIDR(result.ppnAmountIDR)}\n`;
      }
      
      report += `    Total Pajak: ${formatIDR(result.totalTaxIDR)}\n`;
    }
    
    if (result.notes) {
      report += `    Catatan: ${result.notes}\n`;
    }
  });
  
  return report;
}

export default {
  calculateTax,
  calculateTaxFromFile,
  calculateSingleTransactionTax,
  checkSPTObligation,
  generateTaxReport,
  formatIDR
};