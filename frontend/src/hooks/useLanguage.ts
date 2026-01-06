import { create } from 'zustand';
import { dictionary, Language } from '../constants/locales';

interface LanguageState {
  lang: Language;
  t: typeof dictionary['id'];
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

export const useLanguage = create<LanguageState>((set, get) => ({
  lang: 'id', 
  t: dictionary.id,
  
  setLang: (lang) => set({ 
    lang, 
    t: dictionary[lang] 
  }),
  
  toggleLang: () => {
    const current = get().lang;
    const next = current === 'id' ? 'en' : 'id';
    set({ lang: next, t: dictionary[next] });
  }
}));
