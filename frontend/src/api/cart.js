import API from './axiosCourses';

export const fetchCartItems = () => API.get('orders/cart/');

export const addCartItem = (courseId) =>
  API.post('orders/cart/', { course_id: courseId });

export const removeCartItem = (courseId) =>
  API.delete(`orders/cart/${courseId}/`);
