'use client';

import React, { useState } from 'react';
import { DashboardLayout } from './layouts/DashboardLayout';
import { TaxPage } from './pages/TaxPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { OptimizePage } from './pages/OptimizePage';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'tax' | 'transactions' | 'optimize'>('tax');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'tax' && <TaxPage />}
      {activeTab === 'transactions' && <TransactionsPage />}
      {activeTab === 'optimize' && <OptimizePage />}
    </DashboardLayout>
  );
}
