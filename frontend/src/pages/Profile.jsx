import { useState, useEffect } from 'react';
import Header from '../components/common/Header';

export default function Profile() {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
        setFullName(parsed.full_name || parsed.name || parsed.username || '');
        setEmail(parsed.email || '');
      } catch (err) {
        // ignore
      }
    }
  }, []);

  function handleSave(e) {
    e.preventDefault();
    const updated = { ...user, full_name: fullName, email };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    setEditing(false);
    alert('Profile saved (local only).');
  }

  function handleLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {}
    // redirect to login by setting window location
    window.location.href = '/login';
  }

  return (
    <>
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>
              <p className="text-sm text-gray-500">Manage your account information</p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleLogout} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Logout</button>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>

            <div className="md:col-span-2 flex items-center gap-3 mt-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Save</button>
              <button type="button" onClick={() => { setEditing(false); window.location.reload(); }} className="px-4 py-2 bg-gray-100 rounded-md">Cancel</button>
            </div>
          </form>

          <div className="mt-6 border-t pt-4 text-sm text-gray-600">
            <div><strong>Role:</strong> {user.role || '—'}</div>
            <div className="mt-1"><strong>ID:</strong> {user.id || user._id || '—'}</div>
          </div>
        </div>
      </div>
    </>
  );
}
