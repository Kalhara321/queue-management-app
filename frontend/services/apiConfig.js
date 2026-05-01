// Uses environment variable for flexibility, falls back to Railway production URL
const PROD_URL = 'https://charismatic-perfection-production-1db9.up.railway.app/api';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || PROD_URL;

export const API_URL = BACKEND_URL;

export const SOCKET_URL = BACKEND_URL.replace('/api', '');

