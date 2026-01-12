'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import transactions from '@/data/mock/transactions.json';

function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Transaction {
  id: string;
  timestamp: string;
  type: string;
  asset?: string;
  asset_sent?: string;
  asset_received?: string;
  transaction_value_idr?: number;
  tax_scheme?: string;
  tax_rate?: number;
  tax_object?: string;
  income_type?: string;
  [key: string]: unknown;
}

interface TaxResult {
  id: string;
  timestamp: string;
  type: string;
  assetLabel: string;
  valueIDR: number;
  taxable: boolean;
  pphRate: number;
  totalTaxIDR: number;
  reason: string;
}

function calculateTax(tx: Transaction, translations: any): TaxResult {
  let taxable = false;
  let pphRate = 0;
  let taxScheme = '';
  
  // Determine tax based on scheme and object
  if (tx.tax_scheme && tx.tax_rate) {
    taxable = true;
    pphRate = tx.tax_rate as number;
    taxScheme = tx.tax_scheme as string;
  } else if (tx.tax_object === 'NON_FINAL_INCOME') {
    // Income (RECEIVE) transactions are subject to non-final tax
    taxable = true;
    pphRate = 0.25; // 25% non-final income tax
    taxScheme = 'PPh_NON_FINAL';
  }
  
  const valueIDR = tx.transaction_value_idr || 0;
  const totalTaxIDR = taxable ? valueIDR * pphRate : 0;

  let assetLabel = '';
  if (tx.type === 'SWAP') {
    assetLabel = `${tx.asset_sent} to ${tx.asset_received}`;
  } else {
    assetLabel = tx.asset || '';
  }

  let reason = '';
  if (tx.tax_object === 'NON_FINAL_INCOME') {
    reason = translations.tax.nonFinalIncome;
  } else if (tx.tax_object?.includes('NON_TAXABLE')) {
    reason = translations.tax.nonTaxable;
  } else if (tx.tax_scheme === 'PPh22_FINAL') {
    reason = translations.tax.pph22Final;
  } else {
    reason = '-';
  }

  return {
    id: tx.id,
    timestamp: tx.timestamp,
    type: tx.type,
    assetLabel,
    valueIDR,
    taxable,
    pphRate,
    totalTaxIDR,
    reason,
  };
}

export function TaxPage() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString().padStart(2, '0'));

  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = t.tax.monthNames.map((name, index) => ({
    value: index.toString().padStart(2, '0'),
    label: name,
  }));



  const handleDownloadPDF = async () => {
    const monthName = t.tax.monthNames[parseInt(selectedMonth)];
    const period = `${monthName} ${selectedYear}`;
    
    // Dynamic import jsPDF
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.text(`${t.tax.downloadReport}`, 20, 20);
    
    doc.setFontSize(16);
    doc.text(period, 20, 35);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('RINGKASAN:', 20, 55);
    
    doc.setFontSize(12);
    doc.text(`${t.tax.totalTax}: ${formatIDR(results.totals.totalTaxIDR)}`, 20, 70);
    doc.text(`${t.tax.totalTransactions}: ${results.totals.totalTransactions}`, 20, 80);
    doc.text(`${t.tax.taxableTransactions}: ${results.totals.taxableTransactions}`, 20, 90);
    
    // Transaction details header
    doc.setFontSize(14);
    doc.text('DETAIL TRANSAKSI:', 20, 110);
    
    // Table headers
    doc.setFontSize(10);
    let yPos = 125;
    doc.text('Tanggal', 20, yPos);
    doc.text('Tipe', 60, yPos);
    doc.text('Asset', 85, yPos);
    doc.text('Nilai IDR', 120, yPos);
    doc.text('Pajak', 160, yPos);
    
    // Draw line under header
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    // Transaction data
    yPos += 10;
    results.list.forEach((tx, index) => {
      if (yPos > 270) { // New page if needed
        doc.addPage();
        yPos = 20;
      }
      
      const date = new Date(tx.timestamp).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
      
      doc.text(date, 20, yPos);
      doc.text(tx.type, 60, yPos);
      doc.text(tx.assetLabel.substring(0, 15), 85, yPos);
      doc.text(formatIDR(tx.valueIDR).substring(0, 12), 120, yPos);
      doc.text(formatIDR(tx.totalTaxIDR).substring(0, 12), 160, yPos);
      
      yPos += 8;
    });
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Halaman ${i} dari ${pageCount} - Generated by PajaKripto`, 20, 290);
    }
    
    // Save PDF
    doc.save(`laporan-pajak-${monthName.toLowerCase()}-${selectedYear}.pdf`);
  };

  const results = useMemo(() => {
    const filtered = (transactions as Transaction[]).filter((tx) => {
      const txDate = new Date(tx.timestamp);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      return (
        txYear === parseInt(selectedYear) &&
        txMonth === parseInt(selectedMonth)
      );
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort newest first

    const list = filtered.map(tx => calculateTax(tx, t));

    const totals = list.reduce(
      (acc, tx) => {
        acc.totalTransactions += 1;
        if (tx.taxable) acc.taxableTransactions += 1;
        acc.totalValueIDR += tx.valueIDR;
        acc.totalPphIDR += tx.totalTaxIDR;
        acc.totalTaxIDR += tx.totalTaxIDR;
        return acc;
      },
      {
        totalTransactions: 0,
        taxableTransactions: 0,
        totalValueIDR: 0,
        totalPphIDR: 0,
        totalTaxIDR: 0,
      }
    );

    return { list, totals };
  }, [selectedYear, selectedMonth, t]);

  return (
    <div className="space-y-4">
      {/* Card 1: Summary Card */}
      <Card className="border-border">
        <CardContent className="px-6 space-y-4">
          {/* Top Section - Tax Amount */}
          <div className="text-center space-y-2 pb-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div></div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="gap-2 h-8 px-3"
                  title={`${t.tax.downloadReport} (PDF)`}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">PDF</span>
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t.tax.totalTax}</p>
            <p className="text-4xl font-bold text-foreground">
              {formatIDR(results.totals.totalTaxIDR)}
            </p>
          </div>

          {/* Middle Section - Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t.tax.totalTransactions}</p>
              <p className="text-lg font-semibold text-foreground">
                {results.totals.totalTransactions}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t.tax.taxableTransactions}</p>
              <p className="text-lg font-semibold text-foreground">
                {results.totals.taxableTransactions}
              </p>
            </div>
          </div>

          {/* Bottom Section - Period Selector */}
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground">{t.tax.period}</p>
            <div className="flex gap-2">
              {/* Month Select */}
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Select */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Transaction History */}
      <Card className="border-border">
        <CardContent className="px-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">{t.tax.transactionHistory}</h3>

          {results.list.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.tax.noTransactionsInPeriod}
            </div>
          ) : (
            <div className="space-y-3">
              {results.list.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {tx.type} - {tx.assetLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString('id-ID')} - {t.tax.value}: {formatIDR(tx.valueIDR)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.taxable
                        ? `PPh ${Math.round(tx.pphRate * 100)}%`
                        : t.tax.nonTaxable} - {tx.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatIDR(tx.totalTaxIDR)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{t.tax.totalTaxLabel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { TaxPage as TaxTabContent };