'use client';

import { WalletComponents } from "@/components/wallet/WalletComponents";
import { useLanguage } from "@/hooks/useLanguage";

export function CTASection() {
  const { t } = useLanguage();

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 mb-8 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
        {t.cta_title}
      </h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-5">
        {t.cta_desc}
      </p>
      <WalletComponents />
    </div>
  );
}