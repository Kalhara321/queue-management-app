import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './apiConfig';


const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const createBooking = async (queueId) => {
  const headers = await getAuthHeaders();
  return axios.post(`${API_URL}/bookings`, { queueId }, headers);
};

export const getBookings = async (params = {}) => {
  const headers = await getAuthHeaders();
  return axios.get(`${API_URL}/bookings`, { ...headers, params });
};

export const updateBookingStatus = async (bookingId, status) => {
  const headers = await getAuthHeaders();
  return axios.put(`${API_URL}/bookings/${bookingId}`, { status }, headers);
};

export const deleteBooking = async (bookingId) => {
  const headers = await getAuthHeaders();
  return axios.delete(`${API_URL}/bookings/${bookingId}`, headers);
};
