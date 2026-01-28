'use client';

import { useEffect } from 'react';

interface FontLoaderProps {
  headingFont?: string;
  bodyFont?: string;
}

export function FontLoader({ headingFont, bodyFont }: FontLoaderProps) {
  useEffect(() => {
    const fontsToLoad = [];
    if (headingFont && headingFont !== 'inherit') fontsToLoad.push(headingFont);
    if (bodyFont && bodyFont !== 'inherit') fontsToLoad.push(bodyFont);

    if (fontsToLoad.length === 0) return;

    // Remove duplicates
    const uniqueFonts = Array.from(new Set(fontsToLoad));

    const googleFontsUrl = `https://fonts.googleapis.com/css2?${uniqueFonts
      .map(font => `family=${font.replace(/ /g, '+')}:wght@400;500;700`)
      .join('&')}&display=swap`;

    const link = document.createElement('link');
    link.href = googleFontsUrl;
    link.rel = 'stylesheet';
    link.id = 'portfolio-dynamic-fonts';

    const existingLink = document.getElementById('portfolio-dynamic-fonts');
    if (existingLink) {
      // If font URL changed, replace it
      if ((existingLink as HTMLLinkElement).href !== googleFontsUrl) {
        existingLink.remove();
        document.head.appendChild(link);
      }
    } else {
      document.head.appendChild(link);
    }

    return () => {
      // Optional: cleanup
    };
  }, [headingFont, bodyFont]);

  return null;
}
