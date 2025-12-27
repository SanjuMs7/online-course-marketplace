import API from './axiosCourses';

export const getCourses = () => API.get('courses/');
export const getCourse = (id) => API.get(`courses/${id}/`);
export const createCourse = (data) => API.post('courses/', data);
export const updateCourse = (id, data) => API.put(`courses/${id}/`, data);
export const approveCourse = (courseId) =>
  API.post(`courses/${courseId}/approve/`);
export const enrollCourse = (courseId) =>
  API.post(`enrollments/`, { course: courseId }); // backend expects student from token
export const getLessons = (courseId) => API.get(`courses/${courseId}/lessons/`);

// Lesson management (Instructor only)
export const createLesson = (payload) => API.post('lessons/create/', payload);
export const updateLesson = (id, payload) => API.put(`lessons/${id}/update/`, payload);
export const deleteLesson = (id) => API.delete(`lessons/${id}/delete/`);
