import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL as BASE_URL } from './apiConfig';


// Auto-fetch a dev token if none is stored (uses the /api/test-login route)
const getHeaders = async () => {
  let token = await AsyncStorage.getItem('token');
  if (!token) {
    try {
      const res = await axios.post(`${BASE_URL}/test-login`);
      token = res.data.token;
      await AsyncStorage.setItem('token', token);
    } catch (e) {
      console.error('Could not get dev token', e);
    }
  }
  return { Authorization: `Bearer ${token}` };
};

export const getAllNotifications = async () => {
  const headers = await getHeaders();
  const res = await axios.get(`${BASE_URL}/notifications`, { headers });
  return res.data;
};

export const createNotification = async (data) => {
  const headers = await getHeaders();
  const res = await axios.post(`${BASE_URL}/notifications`, data, { headers });
  return res.data;
};

export const updateNotification = async (id, data) => {
  const headers = await getHeaders();
  const res = await axios.put(`${BASE_URL}/notifications/${id}`, data, { headers });
  return res.data;
};

export const deleteNotification = async (id) => {
  const headers = await getHeaders();
  const res = await axios.delete(`${BASE_URL}/notifications/${id}`, { headers });
  return res.data;
};

export const markNotificationRead = async (id) => {
  const headers = await getHeaders();
  const res = await axios.patch(`${BASE_URL}/notifications/${id}/read`, {}, { headers });
  return res.data;
};