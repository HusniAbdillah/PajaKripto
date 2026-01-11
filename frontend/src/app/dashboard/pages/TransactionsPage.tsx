'use client';

import React, { useState } from 'react';
import { Search, Filter, ArrowDownLeft, Send, RefreshCw, Plus, Check, Download } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import transactions from '@/data/mock/transactions.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Transaction = {
  id: string;
  timestamp: string;
  type: 'RECEIVE' | 'TRANSFER' | 'SWAP' | 'MINT';
  asset?: string;
  amount?: number;
  price_at_date?: number;
  from?: string;
  to?: string;
  fee_eth?: number;
  asset_sent?: string;
  amount_sent?: number;
  asset_received?: string;
  amount_received?: number;
  price_sent_at_date?: number;
  note?: string;
  cost_eth?: number;
  price_eth_at_date?: number;
};

export function TransactionsPage() {
  const { t, lang } = useLanguage();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['ALL']);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    if (days < 7) return `${days} ${t.daysAgo}`;
    
    return date.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(2) + 'K';
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 4 });
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'RECEIVE': return <ArrowDownLeft className="w-5 h-5" />;
      case 'TRANSFER': return <Send className="w-5 h-5" />;
      case 'SWAP': return <RefreshCw className="w-5 h-5" />;
      case 'MINT': return <Plus className="w-5 h-5" />;
      default: return <ArrowDownLeft className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'RECEIVE': return 'bg-success text-black';
      case 'TRANSFER': return 'bg-warning text-black';
      case 'SWAP': return 'bg-info text-black';
      case 'MINT': return 'bg-info text-black';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const toggleType = (type: string) => {
    if (type === 'ALL') {
      setSelectedTypes(['ALL']);
    } else {
      const newTypes = selectedTypes.filter(t => t !== 'ALL');
      if (newTypes.includes(type)) {
        const filtered = newTypes.filter(t => t !== type);
        setSelectedTypes(filtered.length === 0 ? ['ALL'] : filtered);
      } else {
        setSelectedTypes([...newTypes, type]);
      }
    }
  };

  const applyFilters = () => {
    setShowFilterDropdown(false);
  };

  const resetFilters = () => {
    setSelectedTypes(['ALL']);
    setSelectedMonth('all');
    setSelectedYear('all');
    setSortOrder('newest');
  };

  const years = ['all', '2025', '2024', '2023'];
  const months = ['all', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

  const filteredTransactions = (transactions as Transaction[])
    .filter(tx => {
      if (selectedTypes.includes('ALL')) return true;
      return selectedTypes.includes(tx.type);
    })
    .filter(tx => {
      if (selectedYear === 'all') return true;
      return new Date(tx.timestamp).getFullYear().toString() === selectedYear;
    })
    .filter(tx => {
      if (selectedMonth === 'all') return true;
      const monthIndex = months.indexOf(selectedMonth);
      return new Date(tx.timestamp).getMonth() === monthIndex - 1;
    })
    .filter(tx => {
      const query = searchQuery.toLowerCase();
      return tx.id.toLowerCase().includes(query) ||
             tx.type.toLowerCase().includes(query) ||
             (tx.asset && tx.asset.toLowerCase().includes(query)) ||
             (tx.asset_sent && tx.asset_sent.toLowerCase().includes(query)) ||
             (tx.asset_received && tx.asset_received.toLowerCase().includes(query)) ||
             (tx.note && tx.note.toLowerCase().includes(query));
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      {/* Search & Filter */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Filter Dropdown Menu */}
          <DropdownMenu open={showFilterDropdown} onOpenChange={setShowFilterDropdown}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 whitespace-nowrap h-11">
                <Filter className="w-4 h-4" />
                <span className="text-sm">{t.filter}</span>
                {(selectedTypes.length > 1 || !selectedTypes.includes('ALL') || selectedMonth !== 'all' || selectedYear !== 'all') && (
                  <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">
                    {selectedTypes.filter(type => type !== 'ALL').length + (selectedMonth !== 'all' ? 1 : 0) + (selectedYear !== 'all' ? 1 : 0)}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Type Filters */}
              <div className="p-3 border-b">
                <h3 className="text-sm font-semibold mb-3">{t.type}</h3>
                <div className="space-y-1.5">
                  {['ALL', 'SWAP', 'RECEIVE', 'TRANSFER', 'MINT'].map((type) => {
                    const isChecked = (type === 'ALL' && selectedTypes.includes('ALL')) || (type !== 'ALL' && selectedTypes.includes(type));
                    return (
                      <div
                        key={type}
                        onClick={() => toggleType(type)}
                        className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked
                            ? 'bg-black border-black'
                            : 'border-input'
                        }`}>
                          {isChecked && (
                            <Check className="w-4 h-4 text-white" strokeWidth={3} />
                          )}
                        </div>
                        <span className={`text-sm transition-colors ${
                          isChecked ? 'font-medium' : 'text-muted-foreground'
                        }`}>
                          {t[type.toLowerCase() as keyof typeof t] as string}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Period Filters */}
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-3">{t.period}</h3>
                <div className="space-y-2">
                  {/* Sort Select */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{lang === 'id' ? 'Urutkan' : 'Sort'}</label>
                    <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as 'newest' | 'oldest')}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">{lang === 'id' ? 'Terbaru' : 'Newest'}</SelectItem>
                        <SelectItem value="oldest">{lang === 'id' ? 'Tertua' : 'Oldest'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Year Select */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t.year}</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>
                            {year === 'all' ? (lang === 'id' ? 'Semua Tahun' : 'All Years') : year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Month Select */}
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t.month}</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month} value={month}>
                            {month === 'all' ? t.months.all : t.months[month as keyof typeof t.months]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 bg-muted flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="flex-1 h-9"
                >
                  {t.reset}
                </Button>
                <Button
                  onClick={applyFilters}
                  className={`flex-1 h-9 ${
                    (selectedTypes.length > 1 || !selectedTypes.includes('ALL') || selectedMonth !== 'all' || selectedYear !== 'all')
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      : ''
                  }`}
                  variant={(selectedTypes.length > 1 || !selectedTypes.includes('ALL') || selectedMonth !== 'all' || selectedYear !== 'all') ? 'default' : 'outline'}
                >
                  {t.apply}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Download PDF Button */}
          <Button
            variant="outline"
            className="gap-2 whitespace-nowrap h-11"
            title={lang === 'id' ? 'Download Riwayat Transaksi' : 'Download Transaction History'}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">PDF</span>
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.map((tx) => (
          <div
            key={tx.id}
            className="bg-card backdrop-blur-sm border border-border rounded-2xl p-4 hover:bg-muted/50 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`p-3 rounded-xl ${getTypeColor(tx.type)} flex-shrink-0`}>
                {getTypeIcon(tx.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="text-foreground font-semibold">{t[tx.type.toLowerCase() as keyof typeof t] as string}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(tx.timestamp)} • {formatTime(tx.timestamp)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {tx.type === 'SWAP' ? (
                      <div>
                        <p className="text-sm text-destructive">-{formatAmount(tx.amount_sent!)} {tx.asset_sent}</p>
                        <p className="text-sm text-success">+{formatAmount(tx.amount_received!)} {tx.asset_received}</p>
                      </div>
                    ) : tx.type === 'RECEIVE' ? (
                      <p className="text-success font-semibold">+{formatAmount(tx.amount!)} {tx.asset}</p>
                    ) : tx.type === 'TRANSFER' ? (
                      <p className="text-destructive font-semibold">-{formatAmount(tx.amount!)} {tx.asset}</p>
                    ) : (
                      <p className="text-warning font-semibold">{tx.asset}</p>
                    )}
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {tx.from && (
                    <p className="text-xs text-muted-foreground">
                      {t.from}: {tx.from.length > 20 ? tx.from.substring(0, 18) + '...' : tx.from}
                    </p>
                  )}
                  {tx.to && (
                    <p className="text-xs text-muted-foreground">
                      {t.to}: {tx.to.length > 20 ? tx.to.substring(0, 18) + '...' : tx.to}
                    </p>
                  )}
                  {tx.note && (
                    <p className="text-xs text-success italic">{tx.note}</p>
                  )}
                  {tx.fee_eth && tx.fee_eth > 0 && (
                    <p className="text-xs text-muted-foreground/70">{t.fee}: {tx.fee_eth} ETH</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{t.noTransactions}</p>
          </div>
        )}
      </div>
    </>
  );
}
