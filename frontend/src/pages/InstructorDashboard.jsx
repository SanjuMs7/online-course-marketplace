import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, createCourse, createLesson } from '../api/courses';
import Header from '../components/common/Header';
import InstructorEarnings from '../components/common/InstructorEarnings';
import CreateCourseForm from '../components/instructor/CreateCourseForm';
import CreateLessonForm from '../components/instructor/CreateLessonForm';
import CoursesList from '../components/instructor/CoursesList';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/');
      return;
    }
    fetchInstructorCourses();
  }, [navigate]);

  async function fetchInstructorCourses() {
    setLoading(true);
    try {
      const res = await getCourses();
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const userCandidates = [];
      if (user) {
        if (user.id) userCandidates.push(String(user.id));
        if (user._id) userCandidates.push(String(user._id));
        if (user.username) userCandidates.push(String(user.username));
        if (user.email) userCandidates.push(String(user.email));
      }

      function isMyCourse(c) {
        if (!userCandidates.length) return false;

        if (c.instructor) {
          if (typeof c.instructor === 'object') {
            const instr = c.instructor;
            const vals = [instr.id, instr._id, instr.username, instr.email].filter(Boolean).map(String);
            if (vals.some(v => userCandidates.includes(v))) return true;
          } else if (typeof c.instructor === 'string') {
            if (userCandidates.includes(c.instructor)) return true;
          }
        }

        const fallbackKeys = ['creator', 'created_by', 'instructor_id', 'user', 'author'];
        for (const k of fallbackKeys) {
          if (!c[k]) continue;
          if (typeof c[k] === 'object') {
            const vals = [c[k].id, c[k]._id, c[k].username, c[k].email].filter(Boolean).map(String);
            if (vals.some(v => userCandidates.includes(v))) return true;
          } else if (typeof c[k] === 'string' && userCandidates.includes(c[k])) {
            return true;
          }
        }

        return false;
      }

      const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const myCourses = data.filter(isMyCourse);

      setCourses(myCourses);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCourseCreated(formData) {
    await createCourse(formData);
    alert('Course created — it may take a moment to appear.');
    await fetchInstructorCourses();
    setTimeout(() => fetchInstructorCourses(), 800);
  }

  async function handleLessonCreated(payload) {
    await createLesson(payload);
    alert('Lesson created successfully.');
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-sm text-gray-600">Create and manage your courses here.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              type="button"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <InstructorEarnings />
          <CreateCourseForm onCourseCreated={handleCourseCreated} />
          <CreateLessonForm courses={courses} onLessonCreated={handleLessonCreated} />
          <CoursesList courses={courses} loading={loading} />
        </div>
      </div>
    </>
  );
}