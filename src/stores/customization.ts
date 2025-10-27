import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomizationStore {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  setBrandName: (name: string) => void;
  setTagline: (tagline: string) => void;
  setLogoUrl: (url: string) => void;
  setFaviconUrl: (url: string) => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setDarkMode: (enabled: boolean) => void;
  reset: () => void;
}

const defaultValues = {
  brandName: 'PrimeZapAI',
  tagline: 'CRM & Omnichannel',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#6366f1',
  accentColor: '#8b5cf6',
  darkMode: true,
};

export const useCustomization = create<CustomizationStore>()(
  persist(
    (set) => ({
      ...defaultValues,
      setBrandName: (brandName) => set({ brandName }),
      setTagline: (tagline) => set({ tagline }),
      setLogoUrl: (logoUrl) => set({ logoUrl }),
      setFaviconUrl: (faviconUrl) => set({ faviconUrl }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setDarkMode: (darkMode) => set({ darkMode }),
      reset: () => set(defaultValues),
    }),
    {
      name: 'customization-storage',
    }
  )
);
