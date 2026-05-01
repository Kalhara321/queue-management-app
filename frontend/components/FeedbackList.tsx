import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { getFeedbacks, deleteFeedback } from '../services/feedbackService';
import FeedbackModal from './FeedbackModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FeedbackListProps {
  queueId?: string;
}

export default function FeedbackList({ queueId }: FeedbackListProps) {
  const [feedbacks, setFeedbacks]             = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [currentUserId, setCurrentUserId]     = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [modalVisible, setModalVisible]       = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getFeedbacks(queueId);
      setFeedbacks(res.data);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id);
        setCurrentUserRole(user.role);
      }
    } catch (err) {
      console.error('Error getting user info:', err);
    }
  };

  useEffect(() => {
    getUserInfo();
    fetchFeedbacks();
  }, [queueId]);

  const confirmDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete this feedback?')) doDelete(id);
    } else {
      Alert.alert('Delete Feedback', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => doDelete(id) },
      ]);
    }
  };

  const doDelete = async (id: string) => {
    try {
      await deleteFeedback(id);
      fetchFeedbacks();
    } catch (err) {
      console.error('Error deleting feedback:', err);
    }
  };

  const handleEdit = (feedback: any) => {
    setSelectedFeedback(feedback);
    setModalVisible(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} style={[styles.star, i < rating && styles.starActive]}>★</Text>
    ));
  };

  const renderItem = ({ item }: { item: any }) => {
    const itemUserId = item.user?._id || item.user?.id;
    const isOwner    = currentUserId && itemUserId && currentUserId === itemUserId;
    const isAdmin    = currentUserRole === 'admin';
    const canEdit    = isOwner;
    const canDelete  = isOwner || isAdmin;

    return (
      <View style={styles.card}>
        {/* Top row: name + stars */}
        <View style={styles.cardHeader}>
          <Text style={styles.userName}>
            {item.user?.username || item.user?.name || 'Unknown'}
          </Text>
          <View style={styles.starsRow}>{renderStars(item.rating)}</View>
        </View>

        {/* Quick select tag */}
        {item.quickSelect && item.quickSelect !== 'Other' && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{item.quickSelect}</Text>
          </View>
        )}

        {/* Optional comment */}
        {item.comment ? (
          <Text style={styles.comment}>"{item.comment}"</Text>
        ) : null}

        {/* Date */}
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>

        {/* Edit / Delete */}
        {(canEdit || canDelete) && (
          <View style={styles.actions}>
            {canEdit && (
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                <Text style={styles.editText}>✏️ Edit</Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>🗑️ Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedbacks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No feedbacks yet. Be the first! 🌟</Text>
        }
      />

      <FeedbackModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedFeedback(null);
        }}
        queueId={selectedFeedback?.queue?._id || queueId || ''}
        existingFeedback={selectedFeedback}
        onSuccess={fetchFeedbacks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  center: {
    padding: 30,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#1a1a2e',
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    color: '#ddd',
  },
  starActive: {
    color: '#FFB800',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 8,
  },
  tagText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '600',
  },
  comment: {
    color: '#555',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 6,
    lineHeight: 18,
  },
  date: {
    color: '#aaa',
    fontSize: 11,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 8,
    marginTop: 6,
    gap: 12,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  editText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  deleteText: {
    color: '#e53e3e',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    marginVertical: 20,
    fontSize: 14,
  },
});
