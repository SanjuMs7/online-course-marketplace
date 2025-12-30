import API from './axiosCourses';

export const getCourses = () => API.get('courses/');
export const getCourse = (id) => API.get(`courses/${id}/`);
export const createCourse = (data) => API.post('courses/', data);
export const updateCourse = (id, data) => API.put(`courses/${id}/`, data);
export const deleteCourse = (id) => API.delete(`courses/${id}/`);
export const approveCourse = (courseId) =>
  API.post(`courses/${courseId}/approve/`);
export const enrollCourse = (courseId) =>
  API.post(`enrollments/`, { course: courseId }); // backend expects student from token
export const getLessons = (courseId) => API.get(`courses/${courseId}/lessons/`);
export const getCourseProgress = (courseId) => API.get(`courses/${courseId}/progress/`);
export const setLessonCompletion = (lessonId, is_completed = true) =>
  API.post(`lessons/${lessonId}/complete/`, { is_completed });

// Reviews
export const getCourseReviews = (courseId) => API.get(`courses/${courseId}/reviews/`);
export const createCourseReview = (courseId, payload) => API.post(`courses/${courseId}/reviews/`, payload);
export const updateReview = (reviewId, payload) => API.patch(`reviews/${reviewId}/`, payload);
export const deleteReview = (reviewId) => API.delete(`reviews/${reviewId}/`);

// Lesson management (Instructor only)
export const createLesson = (payload) => {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  return API.post('lessons/create/', payload, isFormData ? {
    headers: { 'Content-Type': 'multipart/form-data' },
  } : undefined);
};
export const updateLesson = (id, payload) => API.put(`lessons/${id}/update/`, payload);
export const deleteLesson = (id) => API.delete(`lessons/${id}/delete/`);
