import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NavbarProps {
  onMenuPress?: () => void;
  showMenuButton?: boolean;
}

const Navbar = ({ onMenuPress, showMenuButton = true }: NavbarProps) => {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <View style={[styles.navbar, { backgroundColor: theme.colors.glassCard, borderBottomColor: theme.colors.glassBorder }, theme.glassBlur]}>
      <View style={styles.logoContainer}>
        {onMenuPress && showMenuButton && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={28} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        <MaterialCommunityIcons name="playlist-play" size={28} color={theme.colors.iconWrapBg} />
        <Text style={[styles.logoText, { color: theme.colors.text }]}>QueueMaster</Text>
      </View>

      <View style={styles.navLinks}>
        {Platform.OS === 'web' && (
          <>
            <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.navLink}>
              <Text style={[styles.navLinkText, { color: theme.colors.subText }]}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.navLink}>
              <Text style={[styles.navLinkText, { color: theme.colors.subText }]}>Announcements</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity 
          onPress={() => router.replace('/login')} 
          style={[styles.logoutBtn, { backgroundColor: theme.colors.deleteBtnBg }]}
        >
          <Text style={[styles.logoutText, { color: '#FF4B4B' }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      },
    }),
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    marginRight: 10,
    padding: 5,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLink: {
    paddingHorizontal: 5,
  },
  navLinkText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Navbar;
