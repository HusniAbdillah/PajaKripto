'use client';

import { WalletComponents } from "@/components/wallet/WalletComponents";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";

export function Header() {
  const { t } = useLanguage();

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4">
        <div className="flex justify-between items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <Image 
              src="/pajakripto_logo.jpeg" 
              alt="PajaKripto Logo" 
              width={28} 
              height={28}
              className="rounded-md sm:w-10 sm:h-10 flex-shrink-0"
            />
            <span className="text-sm sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">
              {t.app_name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="h-8 sm:h-9 flex items-center">
              <LanguageSwitch />
            </div>
            <div className="h-8 sm:h-9 flex items-center">
              <WalletComponents />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}