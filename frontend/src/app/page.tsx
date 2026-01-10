'use client';

import { MainLayout } from "@/components/layout/MainLayout";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
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