import { useMemo } from 'react';
import { useCustomization } from '@/stores/customization';

export function getContrastColor(hexColor: string): string {
  // Remove # se presente
  const hex = hexColor.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calcula luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Retorna branco ou preto baseado no contraste
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export function useTabContrast() {
  const { mutedColor, backgroundColor } = useCustomization();

  const defaultTabTextColor = useMemo(
    () => getContrastColor(mutedColor),
    [mutedColor]
  );

  const activeTabTextColor = useMemo(
    () => getContrastColor(backgroundColor),
    [backgroundColor]
  );

  return { defaultTabTextColor, activeTabTextColor };
}
