import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Registers the PWA Service Worker on web platform.
 * Call this hook once from the root layout component.
 */
export function useServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[PWA] New content available — refresh to update.');
            }
          });
        });

        console.log('[PWA] Service Worker registered:', registration.scope);
      } catch (err) {
        console.error('[PWA] Service Worker registration failed:', err);
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);
}
