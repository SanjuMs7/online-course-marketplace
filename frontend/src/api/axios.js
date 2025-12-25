// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/accounts/', // points directly to accounts endpoints
});

// Attach token only for protected endpoints
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // Skip attaching token for login/register
    if (token && !config.url.endsWith('login/') && !config.url.endsWith('register/')) {
      config.headers['Authorization'] = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
