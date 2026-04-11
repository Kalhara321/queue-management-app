import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' ? 'http://localhost:5002/api' : 'http://10.0.2.2:5002/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAllQueues = async () => {
  const headers = await getAuthHeaders();
  return axios.get(`${API_URL}/queues`, headers);
};

export const createQueue = async (queueData) => {
  const headers = await getAuthHeaders();
  return axios.post(`${API_URL}/queues`, queueData, headers);
};

export const joinQueue = async (queueId) => {
  const headers = await getAuthHeaders();
  return axios.patch(`${API_URL}/queues/${queueId}/join`, {}, headers);
};

export const updateQueue = async (queueId, queueData) => {
  const headers = await getAuthHeaders();
  return axios.put(`${API_URL}/queues/${queueId}`, queueData, headers);
};

export const deleteQueue = async (queueId) => {
  const headers = await getAuthHeaders();
  return axios.delete(`${API_URL}/queues/${queueId}`, headers);
};
