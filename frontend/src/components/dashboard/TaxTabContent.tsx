'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

function calculateTax(tx: Transaction): TaxResult {
  const taxable = !!tx.tax_scheme && !!tx.tax_rate;
  const pphRate = taxable ? (tx.tax_rate as number) : 0;
  const valueIDR = tx.transaction_value_idr || 0;
  const totalTaxIDR = taxable ? valueIDR * pphRate : 0;

  let assetLabel = '';
  if (tx.type === 'SWAP') {
    assetLabel = `${tx.asset_sent} → ${tx.asset_received}`;
  } else {
    assetLabel = tx.asset || '';
  }

  let reason = '';
  if (tx.tax_object === 'NON_FINAL_INCOME') {
    reason = 'Penghasilan non-final';
  } else if (tx.tax_object?.includes('NON_TAXABLE')) {
    reason = 'Tidak kena pajak';
  } else if (tx.tax_scheme === 'PPh22_FINAL') {
    reason = 'PPh 22 Final';
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
  const months = [
    { value: '00', label: 'Januari' },
    { value: '01', label: 'Februari' },
    { value: '02', label: 'Maret' },
    { value: '03', label: 'April' },
    { value: '04', label: 'Mei' },
    { value: '05', label: 'Juni' },
    { value: '06', label: 'Juli' },
    { value: '07', label: 'Agustus' },
    { value: '08', label: 'September' },
    { value: '09', label: 'Oktober' },
    { value: '10', label: 'November' },
    { value: '11', label: 'Desember' },
  ];

  const results = useMemo(() => {
    const filtered = (transactions as Transaction[]).filter((tx) => {
      const txDate = new Date(tx.timestamp);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth();

      return (
        txYear === parseInt(selectedYear) &&
        txMonth === parseInt(selectedMonth)
      );
    });

    const list = filtered.map(calculateTax);

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
  }, [selectedYear, selectedMonth]);

  return (
    <div className="space-y-4">
      {/* Card 1: Summary Card */}
      <Card className="border-border">
        <CardContent className="px-6 space-y-4">
          {/* Top Section - Tax Amount */}
          <div className="text-center space-y-2 pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground">Total Pajak</p>
            <p className="text-4xl font-bold text-foreground">
              {formatIDR(results.totals.totalTaxIDR)}
            </p>
          </div>

          {/* Middle Section - Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Total Transaksi</p>
              <p className="text-lg font-semibold text-foreground">
                {results.totals.totalTransactions}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Transaksi Kena Pajak</p>
              <p className="text-lg font-semibold text-foreground">
                {results.totals.taxableTransactions}
              </p>
            </div>
          </div>

          {/* Bottom Section - Period Selector */}
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground">Periode</p>
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
          <h3 className="text-lg font-semibold text-foreground mb-4">Riwayat Transaksi</h3>

          {results.list.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada transaksi pada periode ini
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
                      {tx.type} · {tx.assetLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString('id-ID')} · Nilai:{' '}
                      {formatIDR(tx.valueIDR)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.taxable
                        ? `PPh ${Math.round(tx.pphRate * 100)}%`
                        : 'Tidak kena pajak'}{' '}
                      · {tx.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatIDR(tx.totalTaxIDR)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Total Pajak</p>
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