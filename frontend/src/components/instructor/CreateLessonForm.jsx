import { useState, useEffect, useRef } from 'react';
import { getLessons } from '../../api/courses';

export default function CreateLessonForm({ courses, onLessonCreated }) {
  const [lessonCourseId, setLessonCourseId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonVideoFile, setLessonVideoFile] = useState(null);
  const [lessonOrder, setLessonOrder] = useState('');
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState('');
  const fileInputRef = useRef(null);

  // When a course is selected, fetch its lessons to suggest the next order
  useEffect(() => {
    async function loadOrder() {
      if (!lessonCourseId) {
        setSuggestedOrder('');
        setLessonOrder('');
        return;
      }
      try {
        const res = await getLessons(lessonCourseId);
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const maxOrder = list.reduce((m, l) => {
          const val = Number(l.order) || 0;
          return val > m ? val : m;
        }, 0);
        const next = String(maxOrder + 1 || 1);
        setSuggestedOrder(next);
        setLessonOrder(next);
      } catch (err) {
        console.error('Failed to fetch lessons for order suggestion', err);
        setSuggestedOrder('1');
        setLessonOrder('1');
      }
    }
    loadOrder();
  }, [lessonCourseId]);

  async function handleLessonSubmit(e) {
    e.preventDefault();
    if (!lessonCourseId) {
      alert('Please select one of your courses.');
      return;
    }
    setLessonSubmitting(true);
    try {
      const orderValue = lessonOrder ? Number(lessonOrder) : (suggestedOrder ? Number(suggestedOrder) : 1);

      let payload;
      if (lessonVideoFile) {
        // Send as multipart when uploading a video file
        const formData = new FormData();
        formData.append('course', Number(lessonCourseId));
        formData.append('title', lessonTitle);
        formData.append('description', lessonDescription);
        formData.append('order', orderValue);
        formData.append('video_file', lessonVideoFile);
        if (lessonVideoUrl) formData.append('video_url', lessonVideoUrl);
        payload = formData;
      } else {
        // Fallback to URL-only payload
        payload = {
          course: Number(lessonCourseId),
          title: lessonTitle,
          description: lessonDescription,
          video_url: lessonVideoUrl,
          order: orderValue,
        };
      }

      await onLessonCreated(payload);

      // Reset lesson form
      setLessonTitle('');
      setLessonDescription('');
      setLessonVideoUrl('');
      setLessonVideoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLessonOrder(suggestedOrder || '');

      // Refresh next order suggestion
      if (lessonCourseId) {
        const res = await getLessons(lessonCourseId);
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const maxOrder = list.reduce((m, l) => {
          const val = Number(l.order) || 0;
          return val > m ? val : m;
        }, 0);
        const next = String(maxOrder + 1 || 1);
        setSuggestedOrder(next);
        setLessonOrder(next);
      }
    } catch (err) {
      console.error('Failed to create lesson', err);
      const msg = err?.response?.data?.detail || err?.response?.data || 'Failed to create lesson. Ensure you own the course.';
      alert(typeof msg === 'string' ? msg : 'Failed to create lesson.');
    } finally {
      setLessonSubmitting(false);
    }
  }

  return (
    <form className="bg-white rounded-lg shadow p-6 w-full" onSubmit={handleLessonSubmit}>
      <h2 className="text-lg font-semibold mb-4">Create a lesson</h2>

      <label className="block text-sm font-medium text-gray-700">Course</label>
      <select
        value={lessonCourseId}
        onChange={(e) => setLessonCourseId(e.target.value)}
        className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        required
      >
        <option value="">Select one of your courses</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>

      <label className="block text-sm font-medium text-gray-700 mt-4">Title</label>
      <input
        value={lessonTitle}
        onChange={(e) => setLessonTitle(e.target.value)}
        className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        required
      />

      <label className="block text-sm font-medium text-gray-700 mt-4">Description</label>
      <textarea
        value={lessonDescription}
        onChange={(e) => setLessonDescription(e.target.value)}
        rows={3}
        className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="What this lesson covers"
      />

      <label className="block text-sm font-medium text-gray-700 mt-4">Upload Video File</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => setLessonVideoFile(e.target.files?.[0] || null)}
        className="mt-1 w-full text-sm text-gray-700"
      />
      <p className="text-xs text-gray-500 mt-1">Upload a video file from your computer</p>

      <div className="mt-4 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <label className="block text-sm font-medium text-gray-700 mt-4">Video URL</label>
      <input
        value={lessonVideoUrl}
        onChange={(e) => setLessonVideoUrl(e.target.value)}
        placeholder="https://youtube.com/... or https://vimeo.com/..."
        className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <p className="text-xs text-gray-500 mt-1">Provide an external video URL (YouTube, Vimeo, etc.)</p>

      <div className="mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Order</label>
          <input
            value={lessonOrder}
            onChange={(e) => setLessonOrder(e.target.value)}
            type="number"
            min="1"
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {suggestedOrder && (
            <p className="text-xs text-gray-500 mt-1">Suggested next order: {suggestedOrder}</p>
          )}
        </div>
      </div>

      <button
        disabled={lessonSubmitting}
        type="submit"
        className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {lessonSubmitting ? 'Creating…' : 'Create lesson'}
      </button>
    </form>
  );
}
