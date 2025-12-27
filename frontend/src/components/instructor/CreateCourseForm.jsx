import { useState, useRef } from 'react';

export default function CreateCourseForm({ onCourseCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Development');
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const categories = ['Development', 'Business', 'Design', 'Marketing', 'Music'];

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

      // Call the parent callback with form data
      await onCourseCreated(formData);

      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('Development');
      setThumbnail(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error(err);
      alert('Failed to create course. Check console.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
  );
}
