// src/api/auth.js
import API from './axios';

// Login user (public)
export const loginUser = async (email, password) => {
  try {
    const response = await API.post('login/', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (err) {
    console.error('Login Error:', err.response?.data || err.message);
    throw err;
  }
};

// Register user (public) with role
export const registerUser = async (full_name, email, password, role) => {
  try {
    const response = await API.post('register/', { full_name, email, password, role });
    return response.data;
  } catch (err) {
    console.error('Registration Error:', err.response?.data || err.message);
    throw err;
  }
};

// Logout user
export const logoutUser = () => {
  localStorage.removeItem('token');
};
