import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function OptimizeTabContent() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{t.navOptimize}</h2>
        <p className="text-muted-foreground">Tax optimization strategies coming soon...</p>
      </div>
    </div>
  );
}