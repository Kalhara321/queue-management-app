import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signup } from '../services/authService';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async () => {
    setError('');
    
    if (!username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password, 'user');
      showToast('Account created successfully!', 'success');
      router.replace('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Signup failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.card, 
          { 
            backgroundColor: theme.colors.glassCard,
            borderColor: theme.colors.glassBorder,
            borderWidth: 1,
          },
          theme.glassBlur
        ]}>
          <View style={styles.header}>
            <View style={[styles.logoIcon, { backgroundColor: theme.colors.iconWrapBg }]}>
              <MaterialCommunityIcons name="account-plus" size={30} color="white" />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.subText }]}>Join the queue management system</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={18} color="#FF4B4B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Username</Text>
              <View style={[
                styles.inputWrapper, 
                { borderColor: isFocused === 'user' ? theme.colors.iconWrapBg : theme.colors.headerBorder }
              ]}>
                <MaterialCommunityIcons name="account" size={20} color={isFocused === 'user' ? theme.colors.iconWrapBg : theme.colors.subText} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter username"
                  placeholderTextColor={theme.colors.subText}
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setIsFocused('user')}
                  onBlur={() => setIsFocused('')}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
              <View style={[
                styles.inputWrapper, 
                { borderColor: isFocused === 'email' ? theme.colors.iconWrapBg : theme.colors.headerBorder }
              ]}>
                <MaterialCommunityIcons name="email" size={20} color={isFocused === 'email' ? theme.colors.iconWrapBg : theme.colors.subText} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter email"
                  placeholderTextColor={theme.colors.subText}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused('')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Password</Text>
              <View style={[
                styles.inputWrapper, 
                { borderColor: isFocused === 'pass' ? theme.colors.iconWrapBg : theme.colors.headerBorder }
              ]}>
                <MaterialCommunityIcons name="key" size={20} color={isFocused === 'pass' ? theme.colors.iconWrapBg : theme.colors.subText} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="Enter password"
                  placeholderTextColor={theme.colors.subText}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setIsFocused('pass')}
                  onBlur={() => setIsFocused('')}
                  secureTextEntry
                />
              </View>
            </View>



            <TouchableOpacity 
              style={[styles.signupBtn, { backgroundColor: theme.colors.iconWrapBg }, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupBtnText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.subText }]}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[styles.loginLink, { color: theme.colors.iconWrapBg }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 30,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B15',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  signupBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});

export default Signup;
