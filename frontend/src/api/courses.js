import API from './axiosCourses';

export const getCourses = () => API.get('courses/');
export const createCourse = (data) => API.post('courses/', data);
export const approveCourse = (courseId) =>
  API.post(`courses/${courseId}/approve/`);
export const enrollCourse = (courseId) =>
  API.post(`enrollments/`, { course: courseId }); // backend expects student from token
