import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { login } from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { theme } = useTheme();

  const handleLogin = async () => {
    setError('');
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      // In this app, we use email for login in the backend, 
      // but let's assume 'username' field in UI maps to email or update accordingly.
      // Looking at backend, it checks 'email' in login.
      const res = await login(username, password);
      if (res.user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
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
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <View style={[styles.logoIcon, { backgroundColor: theme.colors.iconWrapBg }]}>
            <MaterialCommunityIcons name="lock" size={30} color="white" />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.colors.subText }]}>Login to your account</Text>
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
            style={[styles.loginBtn, { backgroundColor: theme.colors.iconWrapBg }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.subText }]}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={[styles.signupLink, { color: theme.colors.iconWrapBg }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 20,
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
  loginBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      }
    })
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Login;
