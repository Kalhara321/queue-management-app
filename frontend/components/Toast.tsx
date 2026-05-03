import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
}

const Toast = ({ visible, message, type, onHide }: ToastProps) => {
  const { theme } = useTheme();
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 20,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible && translateY.__getValue() === -150) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      default: return 'information';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#FF4B4B';
      default: return theme.colors.iconWrapBg;
    }
  };

  return (
    <Animated.View style={[
      styles.container, 
      { 
        transform: [{ translateY }],
        backgroundColor: theme.colors.glassCard,
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
      },
      theme.glassBlur
    ]}>
      <View style={styles.content}>
        <MaterialCommunityIcons name={getIcon() as any} size={24} color={getIconColor()} />
        <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
        <TouchableOpacity onPress={onHide} style={styles.closeBtn}>
          <MaterialCommunityIcons name="close" size={18} color={theme.colors.subText} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    maxWidth: 400,
    alignSelf: 'center',
    padding: 16,
    borderRadius: 16,
    zIndex: 9999,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        position: 'fixed',
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 4,
  },
});

export default Toast;
