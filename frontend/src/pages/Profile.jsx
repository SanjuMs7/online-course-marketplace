import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';

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
  const navigate = useNavigate();

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
      </div>
    </>
  );
}
