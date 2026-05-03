import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import AnnouncementCard from '../components/AnnouncementCard';
import { getAllNotifications } from '../services/notificationService';
import { getAllQueues } from '../services/queueService';
import { createBooking, getBookings, deleteBooking } from '../services/bookingService';
import { getCurrentUser } from '../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, Platform } from 'react-native';

import SocketService from '../services/socketService';
import NextInLineModal from '../components/NextInLineModal';

const UserDashboard = () => {
  const { theme } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [queues, setQueues] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Notification Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationData, setNotificationData] = useState({ queueName: '', tokenNumber: 0 });

  const fetchAllData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const [annRes, queueRes, bookingRes] = await Promise.all([
        getAllNotifications(), 
        getAllQueues(),
        getBookings({ userId: currentUser?._id || currentUser?.id })
      ]);
      
      setAnnouncements(annRes.data || annRes);
      setQueues(queueRes.data || queueRes);
      setUserBookings(bookingRes.data || bookingRes);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Socket Connection
    const setupSocket = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const id = currentUser._id || currentUser.id;
        SocketService.connect(id);
        
        SocketService.on('next-in-line', (data: any) => {
          setNotificationData(data);
          setModalVisible(true);
          fetchAllData(); // Refresh list to show updated status if any
        });
      }
    };

    setupSocket();

    return () => {
      SocketService.disconnect();
    };
  }, []);

  const handleJoinQueue = async (queueId: string) => {
    try {
      await createBooking(queueId);
      if (Platform.OS === 'web') window.alert('Successfully booked a token!');
      else Alert.alert('Success', 'Successfully booked a token!');
      fetchAllData(); 
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to book token';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    }
  };

  const handleDeleteToken = async (bookingId: string) => {
    const performDelete = async () => {
      try {
        await deleteBooking(bookingId);
        fetchAllData();
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Failed to cancel token';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Error', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this token?')) performDelete();
    } else {
      Alert.alert('Confirm Cancel', 'Are you sure you want to cancel this token?', [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Navbar />
      <NextInLineModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        queueName={notificationData.queueName}
        tokenNumber={notificationData.tokenNumber}
      />
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.iconWrapBg]} />
        }
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Welcome, {user?.username || 'User'} 👋</Text>
          <Text style={[styles.subtitle, { color: theme.colors.subText }]}>Manage your tokens and stay updated</Text>
        </View>

        {userBookings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Your Active Tokens</Text>
            </View>
            <View style={styles.tokensList}>
              {userBookings.map((booking: any) => (
                <View key={booking._id} style={[styles.tokenCard, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1, borderLeftColor: theme.colors.iconWrapBg, borderLeftWidth: 5 }, theme.glassBlur]}>
                  <View style={styles.tokenMain}>
                    <Text style={[styles.tokenNumber, { color: theme.colors.iconWrapBg }]}>#{booking.tokenNumber}</Text>
                    <View>
                      <Text style={[styles.tokenQueueName, { color: theme.colors.text }]}>{booking.queue?.name}</Text>
                      <Text style={[styles.tokenStatus, { color: booking.status === 'waiting' ? '#FFA500' : booking.status === 'served' ? '#4CAF50' : '#F44336' }]}>
                        {booking.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.tokenDate, { color: theme.colors.subText, marginBottom: 5 }]}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </Text>
                    {booking.status === 'waiting' && (
                      <TouchableOpacity onPress={() => handleDeleteToken(booking._id)}>
                        <MaterialCommunityIcons name="delete-outline" size={20} color="#F44336" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

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
              <View key={item._id} style={[styles.queueCard, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1 }, theme.glassBlur]}>
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
  tokensList: {
    gap: 12,
    marginBottom: 30,
  },
  tokenCard: {
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: { 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }
    })
  },
  tokenMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  tokenNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tokenQueueName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  tokenDate: {
    fontSize: 12,
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
      web: { 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }
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
