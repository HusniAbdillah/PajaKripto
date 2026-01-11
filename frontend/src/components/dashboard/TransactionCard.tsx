import React from 'react';
import { ArrowDownLeft, Send, RefreshCw, Plus } from 'lucide-react';

interface Transaction {
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
}

interface TransactionCardProps {
  transaction: Transaction;
  formatDate: (timestamp: string) => string;
  formatTime: (timestamp: string) => string;
  formatAmount: (amount: number) => string;
}

export function TransactionCard({ transaction: tx, formatDate, formatTime, formatAmount }: TransactionCardProps) {
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
      case 'RECEIVE': return 'text-success bg-success/10';
      case 'TRANSFER': return 'text-warning bg-warning/10';
      case 'SWAP': return 'text-info bg-info/10';
      case 'MINT': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className="p-4 border border-border rounded-2xl bg-card/50 hover:bg-card transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${getTypeColor(tx.type)}`}>
            {getTypeIcon(tx.type)}
          </div>
          <div>
            <p className="font-medium text-foreground">{tx.type}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(tx.timestamp)}</span>
              <span>•</span>
              <span>{formatTime(tx.timestamp)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          {tx.type === 'SWAP' ? (
            <div>
              <p className="text-sm text-destructive">-{formatAmount(tx.amount_sent!)} {tx.asset_sent}</p>
              <p className="text-sm text-success">+{formatAmount(tx.amount_received!)} {tx.asset_received}</p>
            </div>
          ) : tx.type === 'RECEIVE' ? (
            <p className="text-success font-semibold">+{formatAmount(tx.amount ?? 0)} {tx.asset}</p>
          ) : tx.type === 'TRANSFER' ? (
            <p className="text-destructive font-semibold">-{formatAmount(tx.amount ?? 0)} {tx.asset}</p>
          ) : (
            <p className="text-warning font-semibold">{tx.asset}</p>
          )}
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {tx.from && (
          <p className="text-xs text-muted-foreground">
            From: {tx.from.length > 20 ? tx.from.substring(0, 18) + '...' : tx.from}
          </p>
        )}
        {tx.to && (
          <p className="text-xs text-muted-foreground">
            To: {tx.to.length > 20 ? tx.to.substring(0, 18) + '...' : tx.to}
          </p>
        )}
        {tx.note && (
          <p className="text-xs text-success italic">{tx.note}</p>
        )}
        {tx.fee_eth && tx.fee_eth > 0 && (
          <p className="text-xs text-muted-foreground/70">Fee: {tx.fee_eth} ETH</p>
        )}
      </div>
    </div>
  );
}