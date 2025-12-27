import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { getLessons, getCourse, deleteLesson } from '../api/courses';

export default function CourseLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseTitle, setCourseTitle] = useState('Course');
  const [userRole, setUserRole] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/login');
      return;
    }
    let user = null;
    try {
      user = JSON.parse(raw);
      setUserRole(user.role);
    } catch (e) {
      navigate('/login');
      return;
    }
    // Only allow authenticated users; server will enforce enrollment/admin/instructor
    if (!user || !user.role) {
      navigate('/login');
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          getCourse(id),
          getLessons(id)
        ]);

        if (courseRes?.data?.title) setCourseTitle(courseRes.data.title);

        const data = Array.isArray(lessonsRes.data) ? lessonsRes.data : (lessonsRes.data.results || []);
        setLessons(Array.isArray(data) ? data : []);
        
        if (data.length === 0) {
          // Provide role-specific messaging
          if (user.role === 'STUDENT') {
            setError('No lessons available. You may need to enroll in this course first.');
          } else if (user.role === 'INSTRUCTOR') {
            setError('No lessons available. Only instructors can see lessons in their own courses.');
          } else {
            setError('No lessons have been added to this course yet.');
          }
        }
      } catch (err) {
        console.error('Failed to load lessons:', err);
        if (err.response?.status === 403) {
          setError('Access denied. You may not have permission to view these lessons.');
        } else if (err.response?.status === 404) {
          setError('Course not found.');
        } else {
          setError('Unable to load lessons. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, navigate]);

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;

    setDeleting(lessonId);
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l.id !== lessonId));
      alert('Lesson deleted successfully.');
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      alert('Failed to delete lesson.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{courseTitle}</h1>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-indigo-600 hover:underline"
          >
            Back
          </button>
        </div>

        {loading && (
          <p className="text-gray-600">Loading lessons...</p>
        )}

        {!loading && error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        {!loading && !error && lessons.length === 0 && (
          <p className="text-gray-600">No lessons available or you are not enrolled.</p>
        )}

        {!loading && lessons.length > 0 && (
          <div className="space-y-3">
            {lessons.map(lesson => (
              <article 
                key={lesson.id} 
                onClick={() => navigate(`/courses/${id}/lessons/${lesson.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-indigo-200 transition group"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                  {lesson.description && (
                    <p className="text-sm text-gray-700 mt-1">{lesson.description}</p>
                  )}
                  <p className="text-sm text-gray-600">{lesson.duration_minutes ? `${lesson.duration_minutes} min` : 'Duration not set'}</p>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {userRole === 'INSTRUCTOR' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/courses/${id}/lessons/${lesson.id}/edit`);
                        }}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLesson(lesson.id);
                        }}
                        disabled={deleting === lesson.id}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deleting === lesson.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  )}

                  {lesson.video_url ? (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-indigo-600 hover:underline whitespace-nowrap"
                    >
                      Open video
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 whitespace-nowrap">No video link</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
