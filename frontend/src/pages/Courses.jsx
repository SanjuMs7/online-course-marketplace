import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, enrollCourse } from '../api/courses';
import Header from '../components/common/Header';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    // If it's already a full URL, return it
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    // Otherwise, construct the full URL
    return `http://localhost:8000${thumbnailPath}`;
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      const payload = Array.isArray(response.data)
        ? response.data
        : (response.data?.results || []);
      const sorted = [...payload].sort((a, b) => (a?.id || 0) - (b?.id || 0));
      setCourses(sorted);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollCourse(courseId);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = typeof data === 'string' ? data : JSON.stringify(data || {});

      // If already enrolled, proceed to lessons
      if (status === 400 && message.toLowerCase().includes('already enrolled')) {
        // continue
      } else if (status === 401 || status === 403) {
        alert('Please log in as a student to enroll in this course.');
        return;
      } else {
        console.error('Enroll failed:', err);
        alert('Failed to enroll. Please try again.');
        return;
      }
    }
    navigate(`/courses/${courseId}/lessons/`);
  };


  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/register');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'STUDENT' && u.role !== 'ADMIN') {
        navigate('/');
        return;
      }
    } catch (e) {
      navigate('/register');
      return;
    }

    fetchCourses();
  }, [navigate]);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <p className="text-center text-gray-600">Loading courses...</p>
    </div>
  );

  return (
    <>
    <Header></Header>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Courses</h2>
          <p className="text-sm text-gray-500">Explore curated courses from top instructors</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-gray-500">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <article key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col relative">
              {course.is_enrolled && (
                <div className="absolute top-2 right-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  Enrolled
                </div>
              )}
              <div className="h-40 bg-gradient-to-r from-indigo-50 to-white border-b border-gray-100">
                {course.thumbnail ? (
                  <img 
                    src={getThumbnailUrl(course.thumbnail)} 
                    alt={course.title} 
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-40 flex items-center justify-center text-gray-400">No image</div>';
                    }}
                  />
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
                      <span className="text-sm font-semibold">{Number(course.price) === 0 ? 'Free' : `₹${course.price}`}</span>
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm transition ${
                        course.is_enrolled 
                          ? 'bg-gray-600 text-white hover:bg-gray-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                      aria-label={`Enroll in ${course.title}`}
                    >
                      {course.is_enrolled ? 'View' : 'Enroll'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
