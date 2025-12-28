import axios from 'axios';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Token ${token}` } : {};
};

export const createOrder = (courseId) => {
  return axios.post('http://localhost:8000/api/orders/create/', 
    { course_id: courseId },
    { headers: getAuthHeaders() }
  );
};

export const verifyPayment = (paymentData) => {
  return axios.post('http://localhost:8000/api/orders/verify/', 
    paymentData,
    { headers: getAuthHeaders() }
  );
};

export const getUserOrders = () => {
  return axios.get('http://localhost:8000/api/orders/user-orders/',
    { headers: getAuthHeaders() }
  );
};

export const getInstructorEarnings = () => {
  return axios.get('http://localhost:8000/api/orders/instructor-earnings/',
    { headers: getAuthHeaders() }
  );
};
