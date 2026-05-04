import Constants from 'expo-constants';

// For production, use your Railway/Vercel URL
const PROD_URL = 'https://charismatic-perfection-production-1db9.up.railway.app/api';

// For local development on mobile (Expo Go):
// 1. Find your computer's local IP (e.g. 192.168.1.XX)
// 2. Set it in an .env file as EXPO_PUBLIC_API_URL=http://192.168.1.XX:5000/api
// OR the code below will try to auto-detect it from the Expo host

const getDevURL = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (!debuggerHost) return 'http://localhost:5000/api';
  
  const localhost = debuggerHost.split(':').shift();
  return `http://${localhost}:5000/api`;
};

const isDev = __DEV__ || process.env.NODE_ENV === 'development';
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || (isDev ? getDevURL() : PROD_URL);

export const API_URL = BACKEND_URL;
export const SOCKET_URL = BACKEND_URL.replace('/api', '');

