import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();

  const menuItems = [
    { title: 'Dashboard', icon: 'view-dashboard', href: '/admin' },
    { title: 'Create Announcement', icon: 'bullhorn-plus', href: '/create-announcement' },
    { title: 'Home', icon: 'home', href: '/dashboard' },
  ];

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.colors.glassCard, borderRightColor: theme.colors.glassBorder }, theme.glassBlur]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="shield-account" size={32} color={theme.colors.iconWrapBg} />
        <Text style={[styles.adminLabel, { color: theme.colors.text }]}>Admin Panel</Text>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <TouchableOpacity
              key={item.href}
              onPress={() => router.push(item.href)}
              style={[
                styles.menuItem,
                isActive && { backgroundColor: theme.colors.background + '50' }
              ]}
            >
              <MaterialCommunityIcons 
                name={item.icon as any} 
                size={22} 
                color={isActive ? theme.colors.iconWrapBg : theme.colors.subText} 
              />
              <Text 
                style={[
                  styles.menuItemText, 
                  { color: isActive ? theme.colors.text : theme.colors.subText },
                  isActive && { fontWeight: 'bold' }
                ]}
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: theme.colors.deleteBtnBg }]}
          onPress={() => router.replace('/login')}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#FF4B4B" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 12,
  },
  adminLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuList: {
    flex: 1,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB22',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF4B4B',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default Sidebar;
