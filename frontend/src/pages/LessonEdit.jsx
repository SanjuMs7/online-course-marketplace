import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { getCourse, getLessons, updateLesson } from '../api/courses';

export default function LessonEdit() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [courseTitle, setCourseTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState('');
  const [suggestedOrder, setSuggestedOrder] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/');
      return;
    }

    async function loadLesson() {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          getCourse(courseId),
          getLessons(courseId)
        ]);

        setCourseTitle(courseRes.data.title);
        const lessons = Array.isArray(lessonsRes.data)
          ? lessonsRes.data
          : lessonsRes.data?.results || [];
        const found = lessons.find((l) => l.id === Number(lessonId));

        if (!found) {
          setError('Lesson not found.');
        } else {
          setLesson(found);
          setTitle(found.title);
          setDescription(found.description || '');
          setVideoUrl(found.video_url || '');
          setOrder(String(found.order || ''));
        }

        // Calculate max order for reference
        const maxOrder = lessons.reduce((m, l) => {
          const val = Number(l.order) || 0;
          return val > m ? val : m;
        }, 0);
        setSuggestedOrder(String(maxOrder || 1));
      } catch (err) {
        console.error('Failed to load lesson:', err);
        setError('Failed to load lesson. Make sure you own this course.');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [courseId, lessonId, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        course: Number(courseId),
        title,
        description,
        video_url: videoUrl,
        order: Number(order) || 1,
      };

      await updateLesson(lessonId, payload);
      alert('Lesson updated successfully.');
      navigate(`/courses/${courseId}/lessons`);
    } catch (err) {
      console.error('Failed to update lesson:', err);
      const msg = err?.response?.data?.detail || 'Failed to update lesson.';
      setError(typeof msg === 'string' ? msg : 'Failed to update lesson.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading lesson...</p>
      </div>
    );
  }

  if (error && !lesson) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(`/courses/${courseId}/lessons`)}
            className="text-sm text-indigo-600 hover:underline mb-4"
          >
            ← Back
          </button>
          <p className="text-red-600">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/courses/${courseId}/lessons`)}
          className="text-sm text-indigo-600 hover:underline mb-6"
        >
          ← Back to {courseTitle} lessons
        </button>

        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-semibold mb-6">Edit Lesson</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="What this lesson covers"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Video URL</label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">Order</label>
          <input
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            type="number"
            min="1"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {suggestedOrder && (
            <p className="text-xs text-gray-500 mt-1">Max order in course: {suggestedOrder}</p>
          )}

          <div className="mt-6 flex gap-3">
            <button
              disabled={submitting}
              type="submit"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/courses/${courseId}/lessons`)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
