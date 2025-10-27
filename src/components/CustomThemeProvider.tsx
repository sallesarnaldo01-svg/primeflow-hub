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
  const { primaryColor, accentColor, backgroundColor } = useCustomization();

  useEffect(() => {
    // Apply custom colors to CSS variables
    const root = document.documentElement;
    
    if (primaryColor) {
      const primaryHSL = hexToHSL(primaryColor);
      root.style.setProperty('--primary', primaryHSL);
    }
    
    if (accentColor) {
      const accentHSL = hexToHSL(accentColor);
      root.style.setProperty('--accent', accentHSL);
    }
    
    if (backgroundColor) {
      const bgHSL = hexToHSL(backgroundColor);
      root.style.setProperty('--background', bgHSL);
    }
  }, [primaryColor, accentColor, backgroundColor]);

  return <>{children}</>;
}
