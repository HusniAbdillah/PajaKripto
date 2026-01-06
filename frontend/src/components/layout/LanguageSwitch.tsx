'use client';

import { useLanguage } from '@/hooks/useLanguage';

export function LanguageSwitch() {
  const { lang, toggleLang } = useLanguage();

  return (
    <button 
      onClick={toggleLang}
      className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-2"
    >
      {lang === 'id' ? (
        <>🇮🇩 ID</>
      ) : (
        <>🇺🇸 EN</>
      )}
    </button>
  );
}
