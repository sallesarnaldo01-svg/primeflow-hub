import { useTheme } from '@/hooks/useTheme';
import { useEffect } from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useTheme(); // Inicializa o tema
  
  return <>{children}</>;
}