'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';

export function TaxPage() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState((currentMonth).toString().padStart(2, '0'));

  // Mock tax calculation - replace with real algorithm
  const totalTax = 'Rp 2.450.000';
  const totalTransactions = 12;

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

  const currentMonthLabel = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t.navTax}</h2>
      </div>

      <Card className="border-border">
        <CardContent className="px-6 py-0 space-y-6">
          {/* Top Section - Tax Amount */}
          <div className="text-center space-y-2 pb-4 border-b border-border">
            <p className="text-sm text-muted-foreground">Total Pajak</p>
            <p className="text-4xl font-bold text-foreground">{totalTax}</p>
          </div>

          {/* Bottom Section - Period & Transaction Count */}
          <div className="flex flex-wrap gap-6">
            {/* Left - Period Selector */}
            <div className="flex-1 min-w-[200px] space-y-3">
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

            {/* Right - Transaction Count */}
            <div className="flex-1 min-w-[200px] space-y-3">
              <p className="text-sm font-medium text-foreground">Total Transaksi</p>
              <div className="h-9 flex items-center justify-center rounded-lg bg-muted/30 border border-border">
                <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


