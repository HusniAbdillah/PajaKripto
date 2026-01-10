'use client';

import { Header } from "@/components/layout/Header";
import { FarcasterTester } from "@/components/farcaster/FarcasterTester";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  showFarcasterTester?: boolean;
}

export function MainLayout({ children, showFarcasterTester = false }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-0">
        {children}
      </main>
      
      {showFarcasterTester && <FarcasterTester />}
    </div>
  );
}