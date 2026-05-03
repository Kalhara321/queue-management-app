// @ts-nocheck
import { Stack } from 'expo-router';
import { ThemeProvider } from '../context/ThemeContext';
import { ToastProvider } from '../context/ToastContext';

export default function Layout() {
  return (
    <ThemeProvider>
      <ToastProvider>
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