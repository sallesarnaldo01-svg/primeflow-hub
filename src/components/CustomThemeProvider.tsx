import { useEffect } from 'react';
import { useCustomization } from '@/stores/customization';

// Convert hex to HSL
function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0% 0%';

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${h} ${s}% ${lPercent}%`;
}

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { 
    primaryColor, 
    accentColor, 
    backgroundColor,
    foregroundColor,
    cardColor,
    borderColor,
    mutedColor,
    successColor,
    errorColor,
    warningColor
  } = useCustomization();

  useEffect(() => {
    const root = document.documentElement;
    
    if (primaryColor) {
      root.style.setProperty('--primary', hexToHSL(primaryColor));
    }
    
    if (accentColor) {
      root.style.setProperty('--accent', hexToHSL(accentColor));
    }
    
    if (backgroundColor) {
      root.style.setProperty('--background', hexToHSL(backgroundColor));
    }
    
    if (foregroundColor) {
      root.style.setProperty('--foreground', hexToHSL(foregroundColor));
    }
    
    if (cardColor) {
      root.style.setProperty('--card', hexToHSL(cardColor));
    }
    
    if (borderColor) {
      root.style.setProperty('--border', hexToHSL(borderColor));
    }
    
    if (mutedColor) {
      root.style.setProperty('--muted', hexToHSL(mutedColor));
      root.style.setProperty('--muted-foreground', hexToHSL(mutedColor));
    }
    
    if (successColor) {
      root.style.setProperty('--success', hexToHSL(successColor));
    }
    
    if (errorColor) {
      root.style.setProperty('--destructive', hexToHSL(errorColor));
    }
    
    if (warningColor) {
      root.style.setProperty('--warning', hexToHSL(warningColor));
    }
  }, [primaryColor, accentColor, backgroundColor, foregroundColor, cardColor, borderColor, mutedColor, successColor, errorColor, warningColor]);

  return <>{children}</>;
}
