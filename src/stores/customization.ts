import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomizationStore {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  cardColor: string;
  borderColor: string;
  mutedColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  darkMode: boolean;
  setBrandName: (name: string) => void;
  setTagline: (tagline: string) => void;
  setLogoUrl: (url: string) => void;
  setFaviconUrl: (url: string) => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setForegroundColor: (color: string) => void;
  setCardColor: (color: string) => void;
  setBorderColor: (color: string) => void;
  setMutedColor: (color: string) => void;
  setSuccessColor: (color: string) => void;
  setErrorColor: (color: string) => void;
  setWarningColor: (color: string) => void;
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
  backgroundColor: '#0a0a0a',
  foregroundColor: '#ffffff',
  cardColor: '#1a1a1a',
  borderColor: '#27272a',
  mutedColor: '#71717a',
  successColor: '#22c55e',
  errorColor: '#ef4444',
  warningColor: '#f59e0b',
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
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
      setForegroundColor: (foregroundColor) => set({ foregroundColor }),
      setCardColor: (cardColor) => set({ cardColor }),
      setBorderColor: (borderColor) => set({ borderColor }),
      setMutedColor: (mutedColor) => set({ mutedColor }),
      setSuccessColor: (successColor) => set({ successColor }),
      setErrorColor: (errorColor) => set({ errorColor }),
      setWarningColor: (warningColor) => set({ warningColor }),
      setDarkMode: (darkMode) => set({ darkMode }),
      reset: () => set(defaultValues),
    }),
    {
      name: 'customization-storage',
    }
  )
);
