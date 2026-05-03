import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useServiceWorker() {
  useEffect(() => {
    if (Platform.OS === 'web' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (reg) => console.log('SW registered:', reg.scope),
          (err) => console.log('SW failed:', err)
        );
      });
    }
  }, []);
}
