// AUTO-DETECT: Use localhost for development, Railway for production
const isProduction = false; // Set to true when you build the final app

const DEV_URL = 'http://localhost:5002/api';
const PROD_URL = 'https://charismatic-perfection-production-1db9.up.railway.app/api';

const BACKEND_URL = isProduction ? PROD_URL : DEV_URL;

export const API_URL = BACKEND_URL;

export const SOCKET_URL = BACKEND_URL.replace('/api', '');

