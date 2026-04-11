import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import AnnouncementCard from '../components/AnnouncementCard';
import { getAllNotifications } from '../services/notificationService';
import { getAllQueues, joinQueue } from '../services/queueService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, Platform } from 'react-native';

const UserDashboard = () => {
  const { theme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async () => {
    try {
      const [annRes, queueRes] = await Promise.all([getAllNotifications(), getAllQueues()]);
      setAnnouncements(annRes.data || annRes);
      setQueues(queueRes.data || queueRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleJoinQueue = async (queueId: string) => {
    try {
      await joinQueue(queueId);
      if (Platform.OS === 'web') window.alert('Successfully joined the queue!');
      else Alert.alert('Success', 'Successfully joined the queue!');
      fetchAllData(); // Refresh to update member count
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to join queue';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Navbar />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.iconWrapBg]} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Welcome, User 👋</Text>
          <Text style={[styles.subtitle, { color: theme.colors.subText }]}>Stay updated with the latest announcements</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Queues</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" />
        ) : queues.length === 0 ? (
          <Text style={{ color: theme.colors.subText, marginBottom: 20 }}>No active queues available.</Text>
        ) : (
          <View style={styles.queuesGrid}>
            {queues.map((item: any) => (
              <View key={item._id} style={[styles.queueCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.queueInfo}>
                  <Text style={[styles.queueName, { color: theme.colors.text }]}>{item.name}</Text>
                  <Text style={[styles.queueDetails, { color: theme.colors.subText }]}>{item.details}</Text>
                  <Text style={[styles.queueMembers, { color: theme.colors.iconWrapBg }]}>
                    <MaterialCommunityIcons name="account-group" size={16} /> {item.members?.length || 0} in queue
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.joinBtn, { backgroundColor: theme.colors.iconWrapBg }]}
                  onPress={() => handleJoinQueue(item._id)}
                >
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Announcements</Text>
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.iconWrapBg} />
            <Text style={{ color: theme.colors.subText, marginTop: 10 }}>Loading announcements...</Text>
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: theme.colors.subText }}>No announcements found.</Text>
          </View>
        ) : (
          announcements.map((item: any) => (
            <AnnouncementCard 
              key={item._id || item.id}
              title={item.title}
              message={item.message}
              date={new Date(item.createdAt || Date.now()).toLocaleDateString()}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  welcomeSection: {
    marginVertical: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
  announcementsHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  queuesGrid: {
    gap: 15,
    marginBottom: 30,
  },
  queueCard: {
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
    })
  },
  queueInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  queueDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  queueMembers: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  joinBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  joinBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loaderContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  }
});

export default UserDashboard;
