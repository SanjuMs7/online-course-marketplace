import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, enrollCourse } from '../api/courses';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);
      alert('Enrolled successfully!');
    } catch (err) {
      alert('Enrollment failed. Check console.');
      console.error(err);
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <p className="text-center text-gray-600">Loading courses...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
          <p className="text-sm text-gray-500">Explore curated courses from top instructors</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleLogout} type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">Logout</button>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-gray-500">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <article key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="h-40 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{course.description}</p>

                <div className="mt-auto flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Instructor</p>
                    <p className="text-sm text-gray-800">{(course.instructor && course.instructor.username) || course.instructor || 'Instructor'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{course.price ? `₹${course.price}` : 'Free'}</span>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 transition"
                      aria-label={`Enroll in ${course.title}`}
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
