import { useEffect } from 'react';
import { keyframes } from '../styles/animations';

export const useAnimations = () => {
  useEffect(() => {
    // Convert keyframes object to CSS string
    const keyframesCSS = Object.entries(keyframes)
      .map(([name, frames]) => {
        const frameRules = Object.entries(frames)
          .map(([key, value]) => `${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val}`).join('; ')} }`)
          .join('\n');
        return `@keyframes ${name} { ${frameRules} }`;
      })
      .join('\n');

    // Create and append style element
    const styleSheet = document.createElement('style');
    styleSheet.textContent = keyframesCSS;
    document.head.appendChild(styleSheet);

    // Cleanup
    return () => {
      styleSheet.remove();
    };
  }, []);
};