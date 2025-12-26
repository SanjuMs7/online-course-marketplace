// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosCourses';
import { approveCourse } from '../api/courses';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch all courses for admin
  const fetchCourses = async () => {
    try {
      const response = await API.get('courses/');
      // DEBUG: show payload shape
      // eslint-disable-next-line no-console
      console.debug('AdminDashboard: courses response sample:', response.data && (Array.isArray(response.data) ? response.data.slice(0,3) : response.data));
      // Support paginated responses or direct arrays
      const payload = response.data && (Array.isArray(response.data) ? response.data : (response.data.results || response.data.items || []));
      setCourses(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      alert('Failed to fetch courses. Make sure you are logged in as Admin.');
    } finally {
      setLoading(false);
    }
  };

  // Approve a course
  const handleApprove = async (courseId) => {
    try {
      await API.post(`courses/${courseId}/approve/`);
      // alert('Course approved!');
      fetchCourses(); // refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to approve course.');
    }
  };

  // Reject a course
  const handleReject = async (courseId) => {
    try {
      await API.post(`courses/${courseId}/reject/`);
      // alert('Course rejected!');
      fetchCourses(); // refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to reject course.');
    }
  };

  function handleLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) { /* ignore */ }
    navigate('/login');
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <svg className="h-6 w-6 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="ml-3 text-gray-600">Loading dashboard...</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-sm text-gray-600">Approve or reject courses submitted by instructors.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleLogout} type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">Logout</button>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <div key={course.id ?? course._id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 h-full">
              <div className="w-full sm:w-36 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">{course.description}</p>
                </div>

                <div className="mt-4 text-sm text-gray-500 flex-1 min-w-0">
                  <div className="truncate"><strong>Instructor:</strong> {typeof course.instructor === 'object' ? (course.instructor.username || course.instructor.email || course.instructor.id || '—') : (course.instructor || '—')}</div>
                  <div className="mt-1"><strong>Price:</strong> {course.price ? `₹${course.price}` : 'Free'}</div>
                </div>

                <div className="mt-4 mt-auto flex items-center gap-3 justify-end whitespace-nowrap">
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${course.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{course.is_approved ? 'Approved' : 'Pending'}</span>

                  {!course.is_approved ? (
                    <>
                      <button onClick={() => handleApprove(course.id ?? course._id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                      <button onClick={() => handleReject(course.id ?? course._id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                    </>
                  ) : (
                    <button onClick={() => handleReject(course.id ?? course._id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">Reject</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
