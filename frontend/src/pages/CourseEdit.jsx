import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import { getCourse, updateCourse } from '../api/courses';

export default function CourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Development');
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const categories = ['Development', 'Business', 'Design', 'Marketing', 'Music'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/');
      return;
    }

    async function loadCourse() {
      try {
        const res = await getCourse(id);
        const course = res.data;
        setTitle(course.title);
        setDescription(course.description);
        setPrice(String(course.price || ''));
        setCategory(course.category || 'Development');
        setExistingThumbnail(course.thumbnail);
      } catch (err) {
        console.error('Failed to load course:', err);
        setError('Failed to load course. Make sure you own this course.');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [id, navigate]);

  function handleFile(e) {
    const f = e.target.files && e.target.files[0];
    setThumbnail(f || null);
    if (f) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  function removeThumbnail() {
    setThumbnail(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price || '0');
      formData.append('category', category);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      await updateCourse(id, formData);
      alert('Course updated successfully.');
      navigate('/instructor-dashboard');
    } catch (err) {
      console.error('Failed to update course:', err);
      setError('Failed to update course. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Loading course...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/instructor-dashboard')}
          className="text-sm text-indigo-600 hover:underline mb-6"
        >
          ← Back to dashboard
        </button>

        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit} encType="multipart/form-data">
          <h2 className="text-2xl font-semibold mb-6">Edit Course</h2>

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
            rows={4}
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                min="0"
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mt-4">Thumbnail</label>
          <div className="mt-1 flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="text-sm text-gray-600"
            />
            {(preview || existingThumbnail) && (
              <div className="relative">
                <img
                  src={preview || existingThumbnail}
                  alt="preview"
                  className="w-24 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  aria-label="Remove thumbnail"
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

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
              onClick={() => navigate('/instructor-dashboard')}
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
