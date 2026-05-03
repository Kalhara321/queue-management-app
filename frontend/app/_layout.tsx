// @ts-nocheck
import { Stack } from 'expo-router';
import { Head } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';
import { useServiceWorker } from '../hooks/useServiceWorker';

export default function Layout() {
  // Register PWA service worker on web
  useServiceWorker();

  return (
    <ThemeProvider>
      <ToastProvider>
        <Head>
          <title>Queue Manager</title>
          <meta name="description" content="Smart Queue Management System" />
          <meta name="theme-color" content="#6C63FF" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/assets/images/icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Queue Manager" />
        </Head>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Notifications 🔔', headerShown: false }} />
          <Stack.Screen name="CreateNotification" options={{ title: 'Create Notification' }} />
          <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
          <Stack.Screen name="signup" options={{ title: 'Sign Up', headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ title: 'Dashboard', headerShown: false }} />
          <Stack.Screen name="admin" options={{ title: 'Admin Dashboard', headerShown: false }} />
          <Stack.Screen name="create-announcement" options={{ title: 'Create Announcement', headerShown: false }} />
        </Stack>
      </ToastProvider>
    </ThemeProvider>
  );
}