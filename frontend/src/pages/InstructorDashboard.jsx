import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCourses, createCourse, createLesson, getLessons } from '../api/courses';
import Header from '../components/common/Header';
export default function InstructorDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Development');
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Lesson form state
  const [lessonCourseId, setLessonCourseId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [lessonOrder, setLessonOrder] = useState('');
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [suggestedOrder, setSuggestedOrder] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();


  const categories = ['Development', 'Business', 'Design', 'Marketing', 'Music'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/');
      return;
    }
    fetchInstructorCourses();
  }, [navigate]);

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

        // Check instructor field
        if (c.instructor) {
          if (typeof c.instructor === 'object') {
            const instr = c.instructor;
            const vals = [instr.id, instr._id, instr.username, instr.email].filter(Boolean).map(String);
            if (vals.some(v => userCandidates.includes(v))) return true;
          } else if (typeof c.instructor === 'string') {
            if (userCandidates.includes(c.instructor)) return true;
          }
        }

        // Fallback keys
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

      const myCourses = (res.data || []).filter(isMyCourse);

      if (!myCourses.length) {
        // Help debugging if nothing found
        // eslint-disable-next-line no-console
        console.debug('InstructorDashboard: no matching courses found for user; sample courses:', (res.data || []).slice(0,3));
      }

      setCourses(myCourses);
    } catch (err) {
      console.error('Failed to load courses', err);
    } finally {
      setLoading(false);
    }
  }

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

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price || '0');
      formData.append('category', category);
      if (thumbnail) formData.append('thumbnail', thumbnail);

      await createCourse(formData);
      alert('Course created — it may take a moment to appear.');

      // reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Development');
      setThumbnail(null);
      setPreview(null);

      // Refresh list (immediate and delayed to handle eventual consistency)
      await fetchInstructorCourses();
      setTimeout(() => fetchInstructorCourses(), 800);
    } catch (err) {
      console.error(err);
      alert('Failed to create course. Check console.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLessonSubmit(e) {
    e.preventDefault();
    if (!lessonCourseId) {
      alert('Please select one of your courses.');
      return;
    }
    setLessonSubmitting(true);
    try {
      const payload = {
        course: Number(lessonCourseId),
        title: lessonTitle,
        description: lessonDescription,
        video_url: lessonVideoUrl,
        order: lessonOrder ? Number(lessonOrder) : (suggestedOrder ? Number(suggestedOrder) : 1),
      };
      await createLesson(payload);
      alert('Lesson created successfully.');
      // reset lesson form
      setLessonTitle('');
      setLessonDescription('');
      setLessonVideoUrl('');
      setLessonOrder(suggestedOrder || '');
      // keep selected course
      // refresh next order suggestion
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

  function handleLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) { /* ignore */ }
    navigate('/login');
  }

  return (
    <>
    <Header></Header>
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-sm text-gray-600">Create and manage your courses here.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleLogout} type="button" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400">
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Form */}
        <form className="bg-white rounded-lg shadow p-6 w-full" onSubmit={handleSubmit} encType="multipart/form-data">
          <h2 className="text-lg font-semibold mb-4">Create a course</h2>

          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" required />

          <label className="block text-sm font-medium text-gray-700 mt-4">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" required />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
              <input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label className="block text-sm font-medium text-gray-700 mt-4">Thumbnail</label>
          <div className="mt-1 flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="text-sm text-gray-600" />
            {preview && (
              <div className="relative">
                <img src={preview} alt="preview" className="w-24 h-16 object-cover rounded" />
                <button type="button" onClick={removeThumbnail} aria-label="Remove thumbnail" className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <button disabled={submitting} type="submit" className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50">
            {submitting ? 'Creating…' : 'Create course'}
          </button>
        </form>

        {/* Lesson creation */}
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

          <label className="block text-sm font-medium text-gray-700 mt-4">Video URL</label>
          <input
            value={lessonVideoUrl}
            onChange={(e) => setLessonVideoUrl(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

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

        {/* Courses list */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Your courses</h2>
            <p className="text-sm text-gray-500">{courses.length} course(s)</p>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading your courses…</p>
          ) : courses.length === 0 ? (
            <p className="text-gray-500">You have not created any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courses.map((course, idx) => (
                <article key={course.id ?? course._id ?? idx} className="bg-white p-4 rounded shadow-sm flex gap-4 items-start flex-col">
                  <div className="w-full">
                    <div className="w-full h-24 bg-gray-100 rounded overflow-hidden mb-3">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-sm font-semibold">{course.price ? `₹${course.price}` : 'Free'}</span>
                        <span className="text-xs text-gray-500">{course.is_approved ? 'Approved' : 'Pending'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex gap-2 mt-3">
                    <button
                      onClick={() => navigate(`/courses/${course.id}/edit`)}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${course.id}/lessons`)}
                      className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                    >
                      Lessons
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
