import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { createFeedback, updateFeedback } from '../services/feedbackService';

const QUICK_OPTIONS = [
  { label: '⏳ Too much waiting time', value: 'Too much waiting time' },
  { label: '👍 Good service',          value: 'Good service' },
  { label: '🚀 Queue moved fast',      value: 'Queue moved fast' },
  { label: '⚠️ System error',          value: 'System error' },
];

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  queueId: string;
  existingFeedback?: any;
  onSuccess: () => void;
}

export default function FeedbackModal({
  visible,
  onClose,
  queueId,
  existingFeedback,
  onSuccess,
}: FeedbackModalProps) {
  const [rating, setRating]           = useState(5);
  const [quickSelect, setQuickSelect] = useState('');
  const [comment, setComment]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating || 5);
      setQuickSelect(existingFeedback.quickSelect === 'Other' ? '' : existingFeedback.quickSelect || '');
      setComment(existingFeedback.comment || '');
    } else {
      setRating(5);
      setQuickSelect('');
      setComment('');
    }
    setError('');
  }, [existingFeedback, visible]);

  const handleSubmit = async () => {
    if (!quickSelect) {
      setError('Please select a quick option.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const feedbackData = {
        queueId,
        rating,
        quickSelect,
        comment,
      };
      if (existingFeedback) {
        await updateFeedback(existingFeedback._id, feedbackData);
      } else {
        await createFeedback(feedbackData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Header */}
            <Text style={styles.title}>
              {existingFeedback ? '✏️ Edit Feedback' : '⭐ Leave Feedback'}
            </Text>

            {/* Star Rating */}
            <Text style={styles.label}>Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Text style={[styles.star, star <= rating && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Select */}
            <Text style={styles.label}>How was your experience?</Text>
            <View style={styles.optionsGrid}>
              {QUICK_OPTIONS.map((opt) => {
                const selected = quickSelect === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setQuickSelect(opt.value)}
                    style={[styles.optionChip, selected && styles.optionChipSelected]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional Comment */}
            <Text style={styles.label}>Comment <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
              placeholder="Add more details..."
              placeholderTextColor="#aaa"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Buttons */}
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitText}>Submit</Text>
                }
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    ...Platform.select({ web: { maxWidth: 480, alignSelf: 'center', width: '100%', borderRadius: 16, marginBottom: 40 } }),
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a2e',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 12,
  },
  optional: {
    fontWeight: '400',
    color: '#aaa',
    fontSize: 12,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
    gap: 6,
  },
  star: {
    fontSize: 42,
    color: '#ddd',
  },
  starActive: {
    color: '#FFB800',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  optionChip: {
    borderWidth: 1.5,
    borderColor: '#4f46e5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  optionChipSelected: {
    backgroundColor: '#4f46e5',
  },
  optionText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
    minHeight: 80,
  },
  errorText: {
    color: '#e53e3e',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 15,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
