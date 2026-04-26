import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './apiConfig';


export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async (username, email, password, role = 'user') => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, { username, email, password, role });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

export const getUserCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/user-count`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
// ... existing code ...
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
