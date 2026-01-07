'use client';

import { WalletComponents } from "@/components/wallet/WalletComponents";
import { FarcasterTester } from "@/components/farcaster/FarcasterTester";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { Wallet, FileText, TrendingUp } from "lucide-react";

export default function Home() {
  const { t } = useLanguage();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const features = [
    {
      icon: Wallet,
      title: t.feature_1_title,
      description: t.feature_1_desc,
    },
    {
      icon: FileText,
      title: t.feature_2_title,
      description: t.feature_2_desc,
    },
    {
      icon: TrendingUp,
      title: t.feature_3_title,
      description: t.feature_3_desc,
    },
  ];

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
      <main className="max-w-6xl mx-auto px-6 py-0">
        <div className="max-w-3xl space-y-8">
          <div className="pt-0">
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {t.features_title}
            </h3>
            
            <Carousel
              setApi={setApi}
              plugins={[plugin.current]}
              opts={{
                loop: true,
              }}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={() => plugin.current.play()}
            >
              <CarouselContent>
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <CarouselItem key={index}>
                      <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardContent className="flex flex-col items-center justify-center px-6 space-y-3">
                          {/* Icon Section */}
                          <div className="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                            <Icon className="w-24 h-24 text-primary" />
                          </div>
                          
                          {/* Text Section */}
                          <div className="text-center space-y-1.5">
                            <h4 className="text-xl font-semibold text-zinc-900 dark:text-white">
                              {feature.title}
                            </h4>
                            <p className="text-zinc-600 dark:text-zinc-400">
                              {feature.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              
              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-4 pb-2">
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === current 
                        ? "w-8 bg-primary" 
                        : "w-2 bg-zinc-300 dark:bg-zinc-700"
                    }`}
                    onClick={() => api?.scrollTo(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </Carousel>
          </div>

          {/* Connect Prompt */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 mb-8 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
              {t.cta_title}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-5">
              {t.cta_desc}
            </p>
            <WalletComponents />
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
