import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext<any>(null);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load saved theme preference on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('app_theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('app_theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  // Define our theme colors
  const theme = {
    isDark: isDarkMode,
    colors: isDarkMode ? {
      background: '#0F0A2A',
      card: '#1E1347',
      glassCard: 'rgba(30, 19, 71, 0.45)',
      glassBorder: 'rgba(255, 255, 255, 0.15)',
      text: '#F0EAFF',
      subText: '#9B8EC4',
      headerBackground: '#1A1040',
      headerBorder: '#2D1B69',
      iconWrapBg: '#6C63FF',
      emptyStateIcon: '#C4B5FD',
      emptyStateText: '#7C6FA0',
      editBtnBg: '#0E3348',
      deleteBtnBg: '#3B0F0F',
    } : {
      background: '#F9FAFB',
      card: '#FFFFFF',
      glassCard: 'rgba(255, 255, 255, 0.45)',
      glassBorder: 'rgba(255, 255, 255, 0.5)',
      text: '#111827',
      subText: '#4B5563',
      headerBackground: '#FFFFFF',
      headerBorder: '#E5E7EB',
      iconWrapBg: '#6C63FF',
      emptyStateIcon: '#A78BFA',
      emptyStateText: '#6B7280',
      editBtnBg: '#E0F2FE',
      deleteBtnBg: '#FEE2E2',
    },
    glassBlur: Platform.OS === 'web' ? {
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    } : {},
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
