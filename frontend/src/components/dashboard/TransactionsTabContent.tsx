import React from 'react';
import { Search, Filter, Download, ArrowDownLeft, Send, RefreshCw, Plus, Check } from 'lucide-react';
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
import { useLanguage } from '@/hooks/useLanguage';

interface Transaction {
  id: string;
  timestamp: string;
  type: 'RECEIVE' | 'TRANSFER' | 'SWAP' | 'MINT';
  // Use processed data instead of raw backend data
  primaryAsset?: string;
  primaryAmount?: number;
  secondaryAsset?: string; 
  secondaryAmount?: number;
  // Keep legacy fields for fallback
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
}

interface TransactionsTabContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (show: boolean) => void;
  selectedTypes: string[];
  selectedMonth: string;
  selectedYear: string;
  sortOrder: 'newest' | 'oldest';
  setSortOrder: (order: 'newest' | 'oldest') => void;
  filteredTransactions: Transaction[];
  formatDate: (timestamp: string) => string;
  formatTime: (timestamp: string) => string;
  formatAmount: (amount: number | undefined | null) => string;
  getTypeIcon: (type: string) => React.ReactNode;
  getTypeColor: (type: string) => string;
  toggleType: (type: string) => void;
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
  years: string[];
  months: string[];
  activeAddress: string | null;
  isTestMode: boolean;
  onRefresh: () => void;
  canLoadMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  totalAvailable?: number;
  totalLoaded?: number;
  displayedCount?: number;
  lastBatchWasFull?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
}

export function TransactionsTabContent({
  searchQuery,
  setSearchQuery,
  showFilterDropdown,
  setShowFilterDropdown,
  selectedTypes,
  selectedMonth,
  selectedYear,
  sortOrder,
  setSortOrder,
  filteredTransactions,
  formatDate,
  formatTime,
  formatAmount,
  getTypeIcon,
  getTypeColor,
  toggleType,
  setSelectedMonth,
  setSelectedYear,
  applyFilters,
  resetFilters,
  years,
  months,
  activeAddress,
  isTestMode,
  onRefresh,
  canLoadMore = false,
  onLoadMore,
  isLoadingMore = false,
  totalAvailable = 0,
  totalLoaded = 0,
  displayedCount = 0,
  lastBatchWasFull = false,
  currentPage = 1,
  itemsPerPage = 10
}: TransactionsTabContentProps) {
  const { t, lang } = useLanguage();

  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDownloadPDF = async () => {
    // Dynamic import jsPDF
    const jsPDF = (await import('jspdf')).default;
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.text(lang === 'id' ? 'Riwayat Transaksi' : 'Transaction History', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
    
    // Summary section
    doc.setFontSize(14);
    doc.text('RINGKASAN:', 20, 55);
    
    doc.setFontSize(12);
    doc.text(`Total Transaksi: ${filteredTransactions.length}`, 20, 70);
    
    // Transaction details header
    doc.setFontSize(14);
    doc.text('DETAIL TRANSAKSI:', 20, 90);
    
    // Table headers
    doc.setFontSize(9);
    let yPos = 105;
    doc.text('Tanggal', 20, yPos);
    doc.text('Tipe', 50, yPos);
    doc.text('Asset', 75, yPos);
    doc.text('Jumlah', 120, yPos);
    doc.text('Fee', 170, yPos);
    
    // Draw line under header
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    // Transaction data
    yPos += 10;
    filteredTransactions.forEach((tx, index) => {
      if (yPos > 270) { // New page if needed
        doc.addPage();
        yPos = 20;
      }
      
      const date = new Date(tx.timestamp).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      let assetText = '';
      if (tx.type === 'SWAP') {
        assetText = `${tx.asset_sent} to ${tx.asset_received}`;
      } else {
        assetText = tx.asset || 'Unknown';
      }
      
      let amountText = '';
      if (tx.type === 'SWAP') {
        amountText = `${formatAmount(tx.amount_sent || 0)} to ${formatAmount(tx.amount_received || 0)}`;
      } else {
        amountText = formatAmount(tx.amount || 0);
      }
      
      const feeText = tx.fee_eth && tx.fee_eth > 0 ? `${tx.fee_eth} ETH` : '0 ETH';
      
      doc.text(date, 20, yPos);
      doc.text(tx.type, 50, yPos);
      doc.text(assetText.substring(0, 20), 75, yPos);
      doc.text(amountText.substring(0, 15), 120, yPos);
      doc.text(feeText, 170, yPos);
      
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
    doc.save(`riwayat-transaksi-${new Date().toISOString().split('T')[0]}.pdf`);
  };

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
                    <Select value={sortOrder} onValueChange={setSortOrder}>
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

          {/* Download Button */}
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="gap-2 whitespace-nowrap h-11"
            title={lang === 'id' ? 'Download Riwayat Transaksi (PDF)' : 'Download Transaction History (PDF)'}
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
                        <p className="text-sm text-destructive">-{formatAmount(tx.secondaryAmount || tx.amount_sent || 0)} {tx.secondaryAsset || tx.asset_sent || 'Unknown'}</p>
                        <p className="text-sm text-success">+{formatAmount(tx.primaryAmount || tx.amount_received || 0)} {tx.primaryAsset || tx.asset_received || 'Unknown'}</p>
                      </div>
                    ) : tx.type === 'RECEIVE' ? (
                      <p className="text-success font-semibold">+{formatAmount(tx.primaryAmount || tx.amount || 0)} {tx.primaryAsset || tx.asset || 'Unknown'}</p>
                    ) : tx.type === 'TRANSFER' ? (
                      <p className="text-destructive font-semibold">-{formatAmount(tx.primaryAmount || tx.amount || 0)} {tx.primaryAsset || tx.asset || 'Unknown'}</p>
                    ) : (
                      <p className="text-warning font-semibold">{tx.primaryAsset || tx.asset || 'Unknown Asset'}</p>
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
                  {tx.fee_eth !== undefined && tx.fee_eth !== null && tx.fee_eth > 0 && (
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

        {/* Load More Button */}
        {canLoadMore && onLoadMore && (
          <div className="flex flex-col items-center gap-3 mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {displayedCount} transactions
              {lastBatchWasFull && " (more available)"}
            </p>
            <Button 
              onClick={onLoadMore}
              disabled={isLoadingMore}
              variant="outline"
              className="w-full max-w-xs"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Loading more...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Load More ({itemsPerPage} more)
                </>
              )}
            </Button>
          </div>
        )}

      </div>
    </>
  );
}