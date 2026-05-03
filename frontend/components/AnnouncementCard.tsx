import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AnnouncementCardProps {
  title: string;
  message: string;
  date: string;
}

const AnnouncementCard = ({ title, message, date }: AnnouncementCardProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.iconWrapBg + '22' }]}>
          <MaterialCommunityIcons name="bullhorn" size={20} color={theme.colors.iconWrapBg} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.date, { color: theme.colors.subText }]}>{date}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={[styles.message, { color: theme.colors.subText }]}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    marginTop: 4,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
});

export default AnnouncementCard;
