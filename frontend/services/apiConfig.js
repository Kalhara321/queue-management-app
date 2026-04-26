import { Platform } from 'react-native';

// UPDATE THIS URL with your actual Railway domain!
// Example: 'https://your-backend-name.up.railway.app/api'
const BACKEND_URL = 'https://charismatic-perfection-production-1db9.up.railway.app/api'; 

export const API_URL = Platform.select({
  web: BACKEND_URL,
  default: BACKEND_URL, // In production, this will be your Railway URL
});

export const SOCKET_URL = BACKEND_URL.replace('/api', '');
