import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import PaymentHistory from '../components/common/PaymentHistory';
import InstructorEarnings from '../components/common/InstructorEarnings';
import CoursesList from '../components/instructor/CoursesList';
import { getCourses } from '../api/courses';

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(' ');
  const first = parts[0] ? parts[0][0] : '';
  const second = parts[1] ? parts[1][0] : '';
  return (first + second).toUpperCase();
}

export default function Profile() {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [loadingInstructorCourses, setLoadingInstructorCourses] = useState(false);
  const navigate = useNavigate();

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    return `http://localhost:8000${thumbnailPath}`;
  };

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        setFullName(parsed.full_name || parsed.name || '');
        setEmail(parsed.email || '');
        setAvatarUrl(parsed.avatar || '');
      } catch (err) {
      }
    }
  }, []);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await getCourses();
        const allCourses = Array.isArray(response.data)
          ? response.data
          : (response.data?.results || []);
        const enrolled = allCourses.filter(course => course.is_enrolled === true);
        setEnrolledCourses(enrolled);
      } catch (err) {
        console.error('Error fetching enrolled courses:', err);
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchInstructorCourses = async () => {
      try {
        setLoadingInstructorCourses(true);
        const response = await getCourses();
        const allCourses = Array.isArray(response.data)
          ? response.data
          : (response.data?.results || []);

        const userCandidates = [];
        if (user) {
          if (user.id) userCandidates.push(String(user.id));
          if (user._id) userCandidates.push(String(user._id));
          if (user.username) userCandidates.push(String(user.username));
          if (user.email) userCandidates.push(String(user.email));
        }

        const isMyCourse = (course) => {
          if (!userCandidates.length) return false;
          if (course.instructor) {
            if (typeof course.instructor === 'object') {
              const instr = course.instructor;
              const vals = [instr.id, instr._id, instr.username, instr.email].filter(Boolean).map(String);
              if (vals.some(v => userCandidates.includes(v))) return true;
            } else if (typeof course.instructor === 'string' && userCandidates.includes(course.instructor)) {
              return true;
            }
          }

          const fallbackKeys = ['creator', 'created_by', 'instructor_id', 'user', 'author'];
          for (const k of fallbackKeys) {
            if (!course[k]) continue;
            if (typeof course[k] === 'object') {
              const vals = [course[k].id, course[k]._id, course[k].username, course[k].email].filter(Boolean).map(String);
              if (vals.some(v => userCandidates.includes(v))) return true;
            } else if (typeof course[k] === 'string' && userCandidates.includes(course[k])) {
              return true;
            }
          }
          return false;
        };

        const mine = allCourses.filter(isMyCourse);
        setInstructorCourses(mine);
      } catch (err) {
        console.error('Error fetching instructor courses:', err);
      } finally {
        setLoadingInstructorCourses(false);
      }
    };

    if (user.role === 'STUDENT') {
      fetchEnrolledCourses();
    }
    if (user.role === 'INSTRUCTOR') {
      fetchInstructorCourses();
    }
  }, [user]);

  function handleSave(e) {
    e.preventDefault();
    const updated = { ...user, full_name: fullName, email, avatar: avatarUrl };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setEditing(false);
    try {
      alert('Profile saved (local only).');
    } catch (e) {}
  }

  function handleLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {}
    navigate('/login');
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
              <p className="text-sm text-gray-500">Manage your account information</p>
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <button 
                  onClick={() => navigate('/admin-dashboard')} 
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Admin Dashboard
                </button>
              )}
              {user.role === 'INSTRUCTOR' && (
                <button 
                  onClick={() => navigate('/instructor-dashboard')} 
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Instructor Dashboard
                </button>
              )}
              {user.role === 'STUDENT' && (
                <button 
                  onClick={() => navigate('/courses')} 
                  className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  View All Courses
                </button>
              )}
              <button onClick={handleLogout} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Logout</button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="flex flex-col items-center md:items-start">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-700 overflow-hidden border">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(user.full_name)}</span>
                )}
              </div>

              {editing && (
                <div className="mt-3 w-full">
                  <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                  <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                <div><strong className="text-gray-700">Role:</strong> {user.role || '—'}</div>
                <div className="mt-1"><strong className="text-gray-700">Member ID:</strong> {user.id || user._id || '—'}</div>
              </div>
            </div>

            <div className="md:col-span-2">
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Full name</label>
                  {editing ? (
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  ) : (
                    <div className="mt-1 text-gray-900 text-lg font-medium">{fullName || '—'}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  {editing ? (
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  ) : (
                    <div className="mt-1 text-gray-800">{email || '—'}</div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {user.role === 'STUDENT' && (
          <>
            <PaymentHistory />

            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Enrolled Courses</h2>
              
              {loadingCourses ? (
                <p className="text-center text-gray-500">Loading courses...</p>
              ) : enrolledCourses.length === 0 ? (
                <p className="text-center text-gray-500">You haven't enrolled in any courses yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => (
                    <Link key={course.id} to={`/courses/${course.id}/lessons/`}>
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition flex flex-col cursor-pointer h-full">
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

                          <div className="mt-auto">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">Instructor</p>
                              <span className="text-sm font-semibold">{Number(course.price) === 0 ? 'Free' : `₹${course.price}`}</span>
                            </div>
                            <p className="text-sm text-gray-800">{(course.instructor && course.instructor.username) || 'Instructor'}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {user.role === 'INSTRUCTOR' && (
          <>
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Earnings</h2>
              <InstructorEarnings />
            </div>

            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Courses</h2>
              <CoursesList
                courses={instructorCourses}
                loading={loadingInstructorCourses}
                onCourseDeleted={() => {
                  // refresh after deletion
                  const refetch = async () => {
                    try {
                      const response = await getCourses();
                      const allCourses = Array.isArray(response.data)
                        ? response.data
                        : (response.data?.results || []);
                      const userCandidates = [];
                      if (user) {
                        if (user.id) userCandidates.push(String(user.id));
                        if (user._id) userCandidates.push(String(user._id));
                        if (user.username) userCandidates.push(String(user.username));
                        if (user.email) userCandidates.push(String(user.email));
                      }
                      const isMyCourse = (course) => {
                        if (!userCandidates.length) return false;
                        if (course.instructor) {
                          if (typeof course.instructor === 'object') {
                            const instr = course.instructor;
                            const vals = [instr.id, instr._id, instr.username, instr.email].filter(Boolean).map(String);
                            if (vals.some(v => userCandidates.includes(v))) return true;
                          } else if (typeof course.instructor === 'string' && userCandidates.includes(course.instructor)) {
                            return true;
                          }
                        }
                        const fallbackKeys = ['creator', 'created_by', 'instructor_id', 'user', 'author'];
                        for (const k of fallbackKeys) {
                          if (!course[k]) continue;
                          if (typeof course[k] === 'object') {
                            const vals = [course[k].id, course[k]._id, course[k].username, course[k].email].filter(Boolean).map(String);
                            if (vals.some(v => userCandidates.includes(v))) return true;
                          } else if (typeof course[k] === 'string' && userCandidates.includes(course[k])) {
                            return true;
                          }
                        }
                        return false;
                      };
                      const mine = allCourses.filter(isMyCourse);
                      setInstructorCourses(mine);
                    } catch (err) {
                      console.error('Error refreshing courses after deletion:', err);
                    }
                  };
                  refetch();
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
