// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Platform, StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getAllNotifications, deleteNotification } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';

const TYPE_CONFIG = {
  announcement: { color: '#6C63FF', bg: '#EDE9FF', icon: 'megaphone', lib: 'Ionicons' },
  queue_update: { color: '#00B4D8', bg: '#E0F7FA', icon: 'queue-play-next', lib: 'MaterialIcons' },
  alert: { color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle', lib: 'Ionicons' },
};

function TypeIcon({ type, size = 18 }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.announcement;
  if (cfg.lib === 'MaterialIcons') {
    return <MaterialIcons name={cfg.icon} size={size} color={cfg.color} />;
  }
  return <Ionicons name={cfg.icon} size={size} color={cfg.color} />;
}

function TypeBadge({ type }) {
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.announcement;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <TypeIcon type={type} size={12} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>
        {type.replace('_', ' ').toUpperCase()}
      </Text>
    </View>
  );
}

export default function NotificationListScreen({ navigation }) {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await getAllNotifications();
      setNotifications(res.data);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to load notifications');
      } else {
        Alert.alert('Error', 'Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribe;
    if (navigation?.addListener) {
      unsubscribe = navigation.addListener('focus', () => {
        fetchNotifications();
      });
    }
    fetchNotifications();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigation]);

  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeletePress = (id) => {
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteNotification(itemToDelete);
      fetchNotifications();
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Failed to delete notification');
      } else {
        Alert.alert('Error', 'Failed to delete');
      }
    } finally {
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  // Dynamic styles that depend on the theme
  const dynamicStyles = {
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { backgroundColor: theme.colors.headerBackground, borderBottomColor: theme.colors.headerBorder },
    headerTitle: { color: theme.colors.text },
    legend: { backgroundColor: theme.colors.headerBackground },
    card: { backgroundColor: theme.colors.card },
    cardTitle: { color: theme.colors.text },
    cardMessage: { color: theme.colors.subText },
    actionsBorder: { borderTopColor: theme.colors.headerBorder },
    emptyTitle: { color: theme.colors.text },
    emptyText: { color: theme.colors.emptyStateText },
    editBtn: { backgroundColor: theme.colors.editBtnBg },
    deleteBtn: { backgroundColor: theme.colors.deleteBtnBg },
    modalOverlay: {
      position: 'absolute',
      top: 0, bottom: 0, left: 0, right: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      padding: 24,
      borderRadius: 16,
      width: '80%',
      maxWidth: 400,
      alignItems: 'center'
    },
    modalTitle: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    modalSub: { color: theme.colors.subText, fontSize: 14, marginBottom: 24, textAlign: 'center' },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' },
    modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: theme.colors.headerBackground, borderWidth: 1, borderColor: theme.colors.headerBorder, alignItems: 'center' },
    modalCancelText: { color: theme.colors.text, fontWeight: '600' },
    modalConfirm: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' },
    modalConfirmText: { color: '#fff', fontWeight: '600' }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, dynamicStyles.container]}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={[styles.loadingText, { color: theme.colors.subText }]}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      {itemToDelete && (
        <View style={dynamicStyles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Ionicons name="trash-outline" size={48} color="#EF4444" style={{marginBottom: 16}} />
            <Text style={dynamicStyles.modalTitle}>Delete Notification?</Text>
            <Text style={dynamicStyles.modalSub}>This action cannot be undone. Are you sure you want to completely remove this notification?</Text>
            <View style={dynamicStyles.modalActions}>
              <TouchableOpacity onPress={cancelDelete} style={dynamicStyles.modalCancel}>
                <Text style={dynamicStyles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={dynamicStyles.modalConfirm}>
                <Text style={dynamicStyles.modalConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.headerBackground} />

      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconWrap, { backgroundColor: theme.colors.iconWrapBg }]}>
            <Ionicons name="notifications" size={22} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>Notifications</Text>
            <Text style={styles.headerSub}>{notifications.length} total</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color={theme.colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateNotification')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend */}
      <View style={[styles.legend, dynamicStyles.legend]}>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cfg.color }]} />
            <Text style={styles.legendLabel}>{key.replace('_', ' ')}</Text>
          </View>
        ))}
      </View>

      {/* List */}
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={64} color={theme.colors.emptyStateIcon} />
          <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No notifications yet</Text>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>Tap "New" above to create your first one.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
            return (
              <View style={[styles.card, dynamicStyles.card, { borderLeftColor: cfg.color }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.cardIconWrap, { backgroundColor: cfg.bg }]}>
                    <TypeIcon type={item.type} size={20} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.title, dynamicStyles.cardTitle]} numberOfLines={1}>{item.title}</Text>
                    <TypeBadge type={item.type} />
                  </View>
                </View>
                <Text style={[styles.message, dynamicStyles.cardMessage]} numberOfLines={2}>{item.message}</Text>
                <View style={[styles.actions, dynamicStyles.actionsBorder]}>
                  <TouchableOpacity
                    style={[styles.editBtn, dynamicStyles.editBtn]}
                    onPress={() => navigation.navigate('CreateNotification', { notification: JSON.stringify(item) })}
                  >
                    <MaterialIcons name="edit" size={15} color="#00B4D8" />
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.deleteBtn, dynamicStyles.deleteBtn]}
                    onPress={() => handleDeletePress(item._id)}
                  >
                    <MaterialIcons name="delete-outline" size={15} color="#EF4444" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    color: '#A78BFA',
    fontSize: 12,
    marginTop: 2,
  },
  themeToggle: {
    padding: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    color: '#6C63FF',
    fontSize: 11,
    textTransform: 'capitalize',
    fontWeight: '600'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: {
    color: '#00B4D8',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
});