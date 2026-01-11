'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";
import { useAutoRedirect } from "@/hooks/useWalletProtection";

export default function Home() {
  const { isConnected, isConnecting } = useAutoRedirect();

  // Show loading while checking connection or redirecting
  if (isConnecting || isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isConnecting ? 'Checking wallet connection...' : 'Redirecting to dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout showFarcasterTester={true}>
      <div className="max-w-3xl space-y-8">
        <div className="pt-0">
        </div>

        {/* Features */}
        <FeaturesSection />

        {/* Connect Prompt */}
        <CTASection />
      </div>
    </MainLayout>
  );
}