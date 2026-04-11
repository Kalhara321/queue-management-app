import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNotification, updateNotification } from '../services/notificationService';

const CreateAnnouncement = () => {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { id, editTitle, editMessage, editType } = searchParams;
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [isFocused, setIsFocused] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { theme } = useTheme();

  useEffect(() => {
    if (isEditing) {
      if (editTitle) setTitle(editTitle as string);
      if (editMessage) setMessage(editMessage as string);
      if (editType) setType(editType as string);
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!title || !message) {
      if (Platform.OS === 'web') window.alert('Please fill in both title and message');
      else Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateNotification(id as string, { title, message, type });
        if (Platform.OS === 'web') window.alert('Announcement updated successfully');
        else Alert.alert('Success', 'Announcement updated successfully');
      } else {
        await createNotification({ title, message, type });
        if (Platform.OS === 'web') window.alert('Announcement created successfully');
        else Alert.alert('Success', 'Announcement created successfully');
      }
      
      router.push('/admin');
    } catch (error) {
      console.error('Operation failed:', error);
      const action = isEditing ? 'update' : 'create';
      if (Platform.OS === 'web') window.alert(`Failed to ${action} announcement`);
      else Alert.alert('Error', `Failed to ${action} announcement`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.layout}>
        {Platform.OS === 'web' && <Sidebar />}
        <View style={styles.mainContent}>
          {Platform.OS !== 'web' && <Navbar />}
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {isEditing ? 'Edit Announcement' : 'New Announcement'}
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Announcement Title</Text>
                  <View style={[
                    styles.inputWrapper, 
                    { borderColor: isFocused === 'title' ? theme.colors.iconWrapBg : theme.colors.headerBorder }
                  ]}>
                    <MaterialCommunityIcons name="pencil" size={20} color={isFocused === 'title' ? theme.colors.iconWrapBg : theme.colors.subText} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text }]}
                      placeholder="Enter a descriptive title"
                      placeholderTextColor={theme.colors.subText}
                      value={title}
                      onChangeText={setTitle}
                      onFocus={() => setIsFocused('title')}
                      onBlur={() => setIsFocused('')}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Announcement Message</Text>
                  <View style={[
                    styles.textAreaWrapper, 
                    { borderColor: isFocused === 'msg' ? theme.colors.iconWrapBg : theme.colors.headerBorder }
                  ]}>
                    <MaterialCommunityIcons 
                      name="card-text-outline" 
                      size={20} 
                      color={isFocused === 'msg' ? theme.colors.iconWrapBg : theme.colors.subText} 
                      style={styles.textAreaIcon}
                    />
                    <TextInput
                      style={[styles.textArea, { color: theme.colors.text }]}
                      placeholder="Type your message here..."
                      placeholderTextColor={theme.colors.subText}
                      value={message}
                      onChangeText={setMessage}
                      onFocus={() => setIsFocused('msg')}
                      onBlur={() => setIsFocused('')}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={[styles.cancelBtn, { borderColor: theme.colors.headerBorder }]}
                    onPress={() => router.back()}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.submitBtn, { backgroundColor: theme.colors.iconWrapBg }, isSubmitting && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="send" size={18} color="white" />
                        <Text style={styles.submitBtnText}>
                          {isEditing ? 'Update Announcement' : 'Post Announcement'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
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
  scrollContent: {
    padding: 30,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 15,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      web: { boxShadow: '0 8px 30px rgba(0,0,0,0.06)' },
      android: { elevation: 6 },
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15 }
    })
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  textAreaWrapper: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    minHeight: 150,
    gap: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    marginTop: 10,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
    minWidth: 150,
    justifyContent: 'center',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CreateAnnouncement;
