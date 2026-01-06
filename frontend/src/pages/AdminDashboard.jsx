// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosCourses';
import { approveCourse, getLessons } from '../api/courses';
import { fetchStudents, fetchInstructors, deleteUserById } from '../api/auth';

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
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
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/login');
      return;
    }
    try {
      const u = JSON.parse(raw);
      if (u.role !== 'ADMIN') {
        navigate('/');
        alert('Access denied. Admins only.');
        return;
      }
    } catch (e) {
      navigate('/login');
      return;
    }

    fetchCourses();
    fetchPeople();
  }, [navigate]);

  async function fetchPeople() {
    setLoadingUsers(true);
    try {
      const [studentsRes, instructorsRes] = await Promise.all([
        fetchStudents(),
        fetchInstructors(),
      ]);
      setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
      setInstructors(Array.isArray(instructorsRes.data) ? instructorsRes.data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert('Failed to fetch students/instructors.');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function handleRemoveUser(id, roleLabel) {
    const confirmMsg = `Remove this ${roleLabel.toLowerCase()}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await deleteUserById(id);
      await fetchPeople();
      alert(`${roleLabel} removed.`);
    } catch (err) {
      console.error('Failed to remove user', err);
      alert('Failed to remove user.');
    }
  }

  const handleViewInstructorCourses = (instructor) => {
    setSelectedInstructor(instructor);
    const filtered = courses.filter(course => {
      if (typeof course.instructor === 'object') {
        return course.instructor?.id === instructor.id || 
               course.instructor?.username === instructor.username ||
               course.instructor?.email === instructor.email;
      }
      return course.instructor === instructor.username || 
             course.instructor === instructor.email ||
             course.instructor === String(instructor.id);
    });
    setInstructorCourses(filtered);
  };

  const handleBackToAll = () => {
    setSelectedInstructor(null);
    setInstructorCourses([]);
  };

  const handleViewCourseLessons = async (course) => {
    try {
      setLoadingLessons(true);
      setSelectedCourse(course);
      const response = await getLessons(course.id);
      setLessons(Array.isArray(response.data) ? response.data : (response.data?.results || []));
    } catch (err) {
      console.error('Error fetching lessons:', err);
      alert('Failed to load lessons.');
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setLessons([]);
  };

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
          {selectedCourse ? (
            <p className="text-sm text-gray-600">
              Lessons in {selectedCourse.title}
              <button onClick={handleBackToCourses} className="ml-3 text-indigo-600 hover:underline text-xs">← Back to courses</button>
            </p>
          ) : selectedInstructor ? (
            <p className="text-sm text-gray-600">
              Courses by {selectedInstructor.full_name || selectedInstructor.username || selectedInstructor.email}
              <button onClick={handleBackToAll} className="ml-3 text-indigo-600 hover:underline text-xs">← Back to all courses</button>
            </p>
          ) : (
            <p className="text-sm text-gray-600">Approve or reject courses submitted by instructors.</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} type="button" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Profile</button>
          <button onClick={handleLogout} type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">Logout</button>
        </div>
      </div>

      {selectedCourse ? (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Lessons in: {selectedCourse.title}</h3>
            <button 
              onClick={handleBackToCourses} 
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              ← Back to Courses
            </button>
          </div>
          {loadingLessons ? (
            <p className="text-center text-gray-600 py-8">Loading lessons...</p>
          ) : lessons.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No lessons found in this course.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {lessons.map(lesson => (
                <div key={lesson.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                      {lesson.description ? (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{lesson.description}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-1">No description provided</p>
                      )}
                      {lesson.video_url ? (
                        <p className="text-xs text-gray-500 mt-2">
                          <strong>📹 Video URL:</strong> {typeof lesson.video_url === 'string' ? lesson.video_url.substring(0, 50) + '...' : 'Video attached'}
                        </p>
                      ) : <p className="text-xs text-gray-400 italic mt-2">No video link shared</p>}
                      {lesson.video_file ? (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>📹 Video file:</strong> Uploaded
                        </p>
                      ) : <p className="text-xs text-gray-400 italic mt-2">No video content</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (selectedInstructor ? instructorCourses : courses).length === 0 ? (
        <p className="text-gray-500">No courses found.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {(selectedInstructor ? instructorCourses : courses).map(course => (
            <div key={course.id ?? course._id} className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 h-full">
              <div className="w-full sm:w-36 h-24 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <div className="mb-2">
                  <button
                    onClick={() => {
                      console.log('Viewing lessons for course:', course.id, course.title);
                      handleViewCourseLessons(course);
                    }}
                    className="text-lg font-semibold text-black hover:text-indigo-800 cursor-pointer text-left"
                  >
                    {course.title}
                  </button>
                  <p className="text-xs text-gray-500 font-medium mt-1">📚 Click title to view lessons</p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>

                <div className="mt-4 text-sm text-gray-500 flex-1 min-w-0">
                  <div className="truncate"><strong>Instructor:</strong> {typeof course.instructor === 'object' ? (course.instructor.username || course.instructor.email || course.instructor.id || '—') : (course.instructor || '—')}</div>
                  <div className="mt-1"><strong>Price:</strong> {course.price ? `₹${course.price}` : 'Free'}</div>
                </div>

                <div className="mt-auto flex items-center gap-3 justify-end whitespace-nowrap">
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

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Instructors</h3>
            {loadingUsers && <span className="text-xs text-gray-500">Loading...</span>}
          </div>
          {instructors.length === 0 ? (
            <p className="text-gray-500 text-sm">No instructors found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {instructors.map(inst => (
                <li key={inst.id} className="py-2 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => handleViewInstructorCourses(inst)}
                      className="text-left w-full hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition"
                    >
                      <p className="text-sm font-medium text-gray-900 hover:text-indigo-600">{inst.full_name || inst.username || inst.email}</p>
                      <p className="text-xs text-gray-500">{inst.email}</p>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">Instructor</span>
                    <button
                      onClick={() => handleRemoveUser(inst.id, 'Instructor')}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Students</h3>
            {loadingUsers && <span className="text-xs text-gray-500">Loading...</span>}
          </div>
          {students.length === 0 ? (
            <p className="text-gray-500 text-sm">No students found.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {students.map(std => (
                <li key={std.id} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{std.full_name || std.username || std.email}</p>
                    <p className="text-xs text-gray-500">{std.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">Student</span>
                    <button
                      onClick={() => handleRemoveUser(std.id, 'Student')}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
