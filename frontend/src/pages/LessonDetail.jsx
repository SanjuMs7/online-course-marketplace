import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { getCourse, getLessons } from '../api/courses';

export default function LessonDetail() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) {
      navigate('/login');
      return;
    }
    let user = null;
    try {
      user = JSON.parse(raw);
    } catch (e) {
      navigate('/login');
      return;
    }
    if (!user || !user.role) {
      navigate('/login');
      return;
    }

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          getCourse(courseId),
          getLessons(courseId)
        ]);

        setCourse(courseRes.data);

        const lessons = Array.isArray(lessonsRes.data) ? lessonsRes.data : (lessonsRes.data?.results || []);
        const found = lessons.find(l => l.id === Number(lessonId));

        if (!found) {
          setError('Lesson not found in this course.');
        } else {
          setLesson(found);
        }
      } catch (err) {
        console.error('Failed to load lesson:', err);
        if (err.response?.status === 403) {
          setError('Access denied. You may not have permission to view this lesson.');
        } else if (err.response?.status === 404) {
          setError('Course or lesson not found.');
        } else {
          setError('Unable to load lesson. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId, lessonId, navigate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="text-sm text-indigo-600 hover:underline mb-4"
          >
            ← Back to lessons
          </button>
          <p className="text-red-600">{error || 'Lesson not found.'}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <button
          onClick={() => navigate(`/courses/${courseId}/lessons`)}
          className="text-sm text-indigo-600 hover:underline mb-6"
        >
          ← Back to {course?.title || 'course'} lessons
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {lesson.title}
            </h1>
            <p className="text-sm text-gray-600">
              Lesson {lesson.order || '—'}
              {lesson.duration_minutes && ` • ${lesson.duration_minutes} minutes`}
            </p>
          </div>

          {lesson.description && (
            <div className="mb-8 pb-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {lesson.description}
              </p>
            </div>
          )}

          {lesson.video_url ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Video</h2>
              <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center min-h-96">
                <a
                  href={lesson.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Video
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <p className="text-yellow-800">No video available for this lesson.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => navigate(`/courses/${courseId}/lessons`)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              ← Back to lessons
            </button>
            {lesson.video_url && (
              <a
                href={lesson.video_url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Open Video →
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
