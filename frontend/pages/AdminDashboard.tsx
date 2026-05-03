import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ScrollView, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAllNotifications, deleteNotification } from '../services/notificationService';
import { getAllQueues, createQueue, updateQueue, deleteQueue } from '../services/queueService';
import { getBookings, updateBookingStatus, deleteBooking } from '../services/bookingService';
import { getUserCount, getCurrentUser } from '../services/authService';
import SocketService from '../services/socketService';
import ConfirmDialog from '../components/ConfirmDialog';

const AdminDashboard = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [isEditingQueue, setIsEditingQueue] = useState(false);
  const [queueId, setQueueId] = useState('');
  const [queueName, setQueueName] = useState('');
  const [queueDetails, setQueueDetails] = useState('');
  const [modalError, setModalError] = useState('');
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<any>(null);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ visible: false, title: '', message: '', onConfirm: () => {} });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ visible: true, title, message, onConfirm });
  };
  const hideConfirm = () => setConfirmDialog(prev => ({ ...prev, visible: false }));

  const fetchAllData = async () => {
    try {
      const [annRes, queueRes, userCountRes] = await Promise.all([
        getAllNotifications(), 
        getAllQueues(),
        getUserCount()
      ]);
      setAnnouncements(annRes.data || annRes);
      setQueues(queueRes.data || queueRes);
      setTotalUsers(userCountRes.count);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Socket Setup
    const setupSocket = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const id = currentUser._id || currentUser.id;
        SocketService.connect(id);
        
        SocketService.on('user-count-update', (newCount: number) => {
          setTotalUsers(newCount);
        });
      }
    };
    
    setupSocket();
    
    return () => {
      SocketService.off('user-count-update');
    };
  }, []);

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/create-announcement',
      params: { 
        id: item._id, 
        editTitle: item.title, 
        editMessage: item.message,
        editType: item.type
      }
    });
  };

  const handleDelete = async (id: string) => {
    const performDelete = async () => {
      try {
        await deleteNotification(id);
        showToast('Announcement deleted', 'success');
        fetchAllData();
      } catch (error) {
        console.error('Failed to delete:', error);
        showToast('Failed to delete', 'error');
      }
    };

    if (Platform.OS === 'web') {
      showConfirm(
        'Delete Announcement',
        'Are you sure you want to delete this announcement?',
        performDelete
      );
    } else {
      showConfirm('Delete Announcement', 'Are you sure?', performDelete);
    }
  };

  const openCreateModal = () => {
    setIsEditingQueue(false);
    setQueueId('');
    setQueueName('');
    setQueueDetails('');
    setModalError('');
    setShowQueueModal(true);
  };

  const openEditModal = (queue: any) => {
    setIsEditingQueue(true);
    setQueueId(queue._id);
    setQueueName(queue.name);
    setQueueDetails(queue.details);
    setModalError('');
    setShowQueueModal(true);
  };

  const handleQueueSubmit = async () => {
    setModalError('');
    if (!queueName || !queueDetails) {
      setModalError('Please fill all fields');
      return;
    }
    if (queueName.length < 3) {
      setModalError('Queue name must be at least 3 characters long');
      return;
    }
    if (queueDetails.length < 5) {
      setModalError('Queue details must be at least 5 characters long');
      return;
    }

    try {
      if (isEditingQueue) {
        await updateQueue(queueId, { name: queueName, details: queueDetails });
      } else {
        await createQueue({ name: queueName, details: queueDetails });
      }
      setShowQueueModal(false);
      fetchAllData();
    } catch (error: any) {
      console.error('Queue operation error:', error);
      const action = isEditingQueue ? 'update' : 'create';
      const msg = error.response?.data?.message || `Failed to ${action} queue`;
      setModalError(msg);
    }
  };

  const handleDeleteQueue = async (id: string) => {
    const performDelete = async () => {
      try {
        await deleteQueue(id);
        fetchAllData();
      } catch (error) {
        console.error('Failed to delete queue:', error);
      }
    };

    if (Platform.OS === 'web') {
      showConfirm('Delete Queue', 'Delete this queue? All data will be lost.', performDelete);
    } else {
      showConfirm('Delete Queue', 'Delete this queue? All data will be lost.', performDelete);
    }
  };

  const openBookingsModal = async (queue: any) => {
    setSelectedQueue(queue);
    setShowBookingsModal(true);
    setLoadingBookings(true);
    try {
      const response = await getBookings({ queueId: queue._id });
      setBookings(response.data || response);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await updateBookingStatus(bookingId, status);
      // Refresh bookings list
      const response = await getBookings({ queueId: selectedQueue._id });
      setBookings(response.data || response);
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const doDelete = async () => {
      try {
        await deleteBooking(bookingId);
        const response = await getBookings({ queueId: selectedQueue._id });
        setBookings(response.data || response);
        showToast('Booking removed', 'success');
      } catch (error) {
        console.error('Failed to delete booking:', error);
        showToast('Failed to remove booking', 'error');
      }
    };
    showConfirm('Remove Booking', 'Are you sure you want to remove this booking?', doDelete);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="#FF4B4B"
        icon="trash-can-outline"
        onConfirm={() => { hideConfirm(); confirmDialog.onConfirm(); }}
        onCancel={hideConfirm}
      />
      <View style={styles.layout}>
        {Platform.OS === 'web' && <Sidebar />}
        <View style={styles.mainContent}>
          {Platform.OS !== 'web' && <Navbar />}
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
              <Text style={[styles.welcomeText, { color: theme.colors.text }]}>Admin Dashboard</Text>
              <Text style={[styles.subtitle, { color: theme.colors.subText }]}>Manage hospital announcements and system settings</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1 }, theme.glassBlur]}>
                <View style={[styles.statIcon, { backgroundColor: theme.colors.iconWrapBg + '22' }]}>
                  <MaterialCommunityIcons name="bullhorn" size={24} color={theme.colors.iconWrapBg} />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{loading ? '...' : announcements.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Active Announcements</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: '#4CAF50' + '22' }]}>
                  <MaterialCommunityIcons name="account-group" size={24} color="#4CAF50" />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalUsers}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Total Users</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1 }]}>
                <View style={[styles.statIcon, { backgroundColor: '#FF9800' + '22' }]}>
                  <MaterialCommunityIcons name="list-status" size={24} color="#FF9800" />
                </View>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{loading ? '...' : queues.length}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Active Queues</Text>
              </View>
            </View>

            <View style={[styles.actionCard, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1 }, theme.glassBlur]}>
              <View style={styles.actionInfo}>
                <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Manage Queues</Text>
                <Text style={[styles.actionDesc, { color: theme.colors.subText }]}>Create a new queue and define its purpose for patients.</Text>
              </View>
              <TouchableOpacity 
                style={[styles.createBtn, { backgroundColor: '#FF9800' }]}
                onPress={openCreateModal}
              >
                <MaterialCommunityIcons name="plus-box" size={20} color="white" />
                <Text style={styles.createBtnText}>Create Queue</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Queues</Text>
              {loading ? (
                <ActivityIndicator size="small" />
              ) : queues.length === 0 ? (
                <Text style={{ color: theme.colors.subText }}>No active queues.</Text>
              ) : (
                queues.map((item: any) => (
                  <View key={item._id} style={[styles.listItem, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1, borderLeftColor: '#FF9800', borderLeftWidth: 4 }, theme.glassBlur]}>
                    <View style={styles.listItemContent}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text }]}>{item.name}</Text>
                      <Text style={[styles.itemDate, { color: theme.colors.subText }]}>{item.members?.length || 0} People in Queue</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => openBookingsModal(item)} style={styles.manageBtn}>
                        <MaterialCommunityIcons name="account-group" size={22} color="#4CAF50" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
                        <MaterialCommunityIcons name="pencil-outline" size={22} color="#FF9800" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteQueue(item._id)} style={styles.deleteBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF4B4B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={[styles.listSection, { marginTop: 40 }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recent Announcements</Text>
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.iconWrapBg} />
              ) : (
                announcements.map((item: any) => (
                  <View key={item._id} style={[styles.listItem, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1, borderLeftColor: theme.colors.iconWrapBg, borderLeftWidth: 4 }, theme.glassBlur]}>
                    <View style={styles.listItemContent}>
                      <Text style={[styles.itemTitle, { color: theme.colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.itemDate, { color: theme.colors.subText }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                        <MaterialCommunityIcons name="pencil-outline" size={22} color={theme.colors.iconWrapBg} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.deleteBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={22} color="#FF4B4B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      <Modal visible={showQueueModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1 }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{isEditingQueue ? 'Edit Queue' : 'Create New Queue'}</Text>
            
            {modalError ? (
              <View style={styles.modalErrorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#FF4B4B" />
                <Text style={styles.modalErrorText}>{modalError}</Text>
              </View>
            ) : null}
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.subText + '44' }]}
              placeholder="Queue Name"
              placeholderTextColor={theme.colors.subText}
              value={queueName}
              onChangeText={setQueueName}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.subText + '44', height: 100 }]}
              placeholder="Details"
              placeholderTextColor={theme.colors.subText}
              multiline
              value={queueDetails}
              onChangeText={setQueueDetails}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowQueueModal(false)} style={styles.cancelBtn}>
                <Text style={{ color: theme.colors.subText }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleQueueSubmit} style={[styles.submitBtn, { backgroundColor: '#FF9800' }]}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{isEditingQueue ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showBookingsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.glassCard, borderColor: theme.colors.glassBorder, borderWidth: 1, maxWidth: 600 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Manage: {selectedQueue?.name}</Text>
              <TouchableOpacity onPress={() => setShowBookingsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.subText} />
              </TouchableOpacity>
            </View>

            {loadingBookings ? (
              <ActivityIndicator size="large" />
            ) : bookings.length === 0 ? (
              <Text style={{ color: theme.colors.subText, textAlign: 'center', padding: 20 }}>No active bookings for this queue.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 400 }}>
                {bookings.map((booking: any) => (
                  <View key={booking._id} style={[styles.bookingItem, { borderBottomColor: theme.colors.subText + '22' }]}>
                    <View style={styles.bookingMain}>
                      <Text style={[styles.tokenNum, { color: theme.colors.iconWrapBg }]}>#{booking.tokenNumber}</Text>
                      <View>
                        <Text style={[styles.userName, { color: theme.colors.text }]}>{booking.user?.username}</Text>
                        <Text style={[styles.statusBadge, { color: booking.status === 'waiting' ? '#FFA500' : booking.status === 'served' ? '#4CAF50' : '#F44336' }]}>
                          {booking.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingActions}>
                      {booking.status === 'waiting' && (
                        <TouchableOpacity 
                          onPress={() => handleUpdateBookingStatus(booking._id, 'served')}
                          style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
                        >
                          <Text style={styles.actionBtnText}>Serve</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        onPress={() => handleDeleteBooking(booking._id)}
                        style={[styles.actionBtn, { backgroundColor: '#F44336' }]}
                      >
                        <Text style={styles.actionBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    padding: 30,
    flexGrow: 1,
    maxWidth: 1000,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  statCard: {
    padding: 24,
    borderRadius: 20,
    minWidth: 200,
    flex: 1,
    ...Platform.select({
      web: { 
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      },
      android: { elevation: 3 },
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }
    })
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  actionCard: {
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 40,
  },
  actionInfo: {
    flex: 1,
    minWidth: 250,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  actionDesc: {
    fontSize: 14,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  createBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  listSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    ...Platform.select({
      web: { 
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }
    })
  },
  listItemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDate: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  editBtn: {
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
      }
    })
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    padding: 30,
    borderRadius: 20,
    gap: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  modalErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B15',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  modalErrorText: {
    color: '#FF4B4B',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  manageBtn: {
    padding: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  bookingMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  tokenNum: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  }
});

export default AdminDashboard;
