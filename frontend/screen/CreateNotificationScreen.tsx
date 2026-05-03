// @ts-nocheck
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView
} from 'react-native';
import { createNotification, updateNotification } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function CreateNotificationScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const existing = route.params?.notification;

  const [title, setTitle] = useState(existing?.title || '');
  const [message, setMessage] = useState(existing?.message || '');
  const [type, setType] = useState(existing?.type || 'announcement');

  const handleSubmit = async () => {
    if (!title || !message) {
      showToast('Title and message are required', 'error');
      return;
    }
    if (title.length < 3) {
      showToast('Title must be at least 3 characters long', 'error');
      return;
    }
    if (message.length < 5) {
      showToast('Message must be at least 5 characters long', 'error');
      return;
    }

    try {
      if (existing) {
        await updateNotification(existing._id, { title, message, type });
        showToast('Notification updated!', 'success');
      } else {
        await createNotification({ title, message, type, targetAudience: 'all' });
        showToast('Notification created!', 'success');
      }
      navigation.goBack();
    } catch (error) {
      showToast('Something went wrong', 'error');
    }
  };

  const dynamicStyles = {
    container: { backgroundColor: theme.colors.background },
    label: { color: theme.colors.text },
    input: { 
      backgroundColor: theme.colors.glassCard, 
      color: theme.colors.text,
      borderColor: theme.colors.glassBorder,
      borderWidth: 1,
    },
    typeButton: {
      backgroundColor: theme.colors.glassCard,
      borderColor: theme.colors.glassBorder,
      borderWidth: 1,
    },
    typeText: {
      color: theme.colors.text
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, dynamicStyles.container]}>
      <Text style={[styles.label, dynamicStyles.label]}>Title *</Text>
      <TextInput
        style={[styles.input, dynamicStyles.input, theme.glassBlur]}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
        placeholderTextColor={theme.colors.subText}
      />

      <Text style={[styles.label, dynamicStyles.label]}>Message *</Text>
      <TextInput
        style={[styles.input, dynamicStyles.input, { height: 100 }, theme.glassBlur]}
        value={message}
        onChangeText={setMessage}
        placeholder="Enter message"
        placeholderTextColor={theme.colors.subText}
        multiline
      />

      <Text style={[styles.label, dynamicStyles.label]}>Type</Text>
      <View style={styles.typeContainer}>
        {['announcement', 'queue_update', 'alert'].map(t => {
          const isSelected = type === t;
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeButton, 
                dynamicStyles.typeButton,
                isSelected && styles.typeSelected,
                theme.glassBlur
              ]}
              onPress={() => setType(t)}
            >
              <Text 
                style={[
                  dynamicStyles.typeText,
                  isSelected && styles.typeTextSelected,
                  { textTransform: 'capitalize' }
                ]}
              >
                {t.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>{existing ? 'Update' : 'Create'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 8, padding: 10 },
  typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  typeButton: { padding: 10, borderRadius: 8, borderWidth: 1 },
  typeSelected: { backgroundColor: '#6C63FF', borderColor: '#6C63FF' },
  typeTextSelected: { color: '#fff', fontWeight: 'bold' },
  submit: { backgroundColor: '#22C55E', padding: 14, borderRadius: 10, marginTop: 24, alignItems: 'center' },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 }
});
