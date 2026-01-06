'use client';

import { WalletComponents } from "@/components/wallet/WalletComponents";
import { FarcasterInfo } from "@/components/farcaster/FarcasterInfo";
import { FarcasterTester } from "@/components/farcaster/FarcasterTester";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image 
              src="/pajakripto_logo.jpeg" 
              alt="PajaKripto Logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.app_name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <WalletComponents />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="max-w-3xl">
          {/* Farcaster Info */}
          <div className="mb-8">
            <FarcasterInfo />
          </div>
          
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            {t.hero_title}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            {t.hero_desc}
          </p>

          {/* Connect Prompt */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-8 mb-12 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
              {t.cta_title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {t.cta_desc}
            </p>
            <WalletComponents />
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.features_title}
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white mb-1">
                    {t.feature_1_title}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {t.feature_1_desc}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white mb-1">
                    {t.feature_2_title}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {t.feature_2_desc}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white mb-1">
                    {t.feature_3_title}
                  </h4>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    {t.feature_3_desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            {t.built_with}{" "}
            <a href="https://onchainkit.xyz" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:underline">
              OnchainKit
            </a>
            {" "}{t.and}{" "}
            <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="text-zinc-700 dark:text-zinc-300 hover:underline">
              Base
            </a>
          </p>
        </div>
      </main>
      
      {/* Farcaster Tester */}
      <FarcasterTester />
    </div>
  );
}
