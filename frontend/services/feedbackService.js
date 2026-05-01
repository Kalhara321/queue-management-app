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

export const createFeedback = async (feedbackData) => {
  const headers = await getAuthHeaders();
  return axios.post(`${API_URL}/feedbacks`, feedbackData, headers);
};

export const getFeedbacks = async (queueId) => {
  const headers = await getAuthHeaders();
  const url = queueId ? `${API_URL}/feedbacks?queueId=${queueId}` : `${API_URL}/feedbacks`;
  return axios.get(url, headers);
};

export const updateFeedback = async (feedbackId, feedbackData) => {
  const headers = await getAuthHeaders();
  return axios.put(`${API_URL}/feedbacks/${feedbackId}`, feedbackData, headers);
};

export const deleteFeedback = async (feedbackId) => {
  const headers = await getAuthHeaders();
  return axios.delete(`${API_URL}/feedbacks/${feedbackId}`, headers);
};
