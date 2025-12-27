import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  function getInitials(name) {
    if (!name) return '';
    const parts = name.trim().split(' ');
    const first = parts[0] ? parts[0][0] : '';
    const second = parts[1] ? parts[1][0] : '';
    return (first + second).toUpperCase();
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function handleLogout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) { /* ignore */ }
    setMenuOpen(false);
    setUser(null);
    navigate('/login');
  }

  return (
    <>
      <header className="bg-white fixed top-0 left-0 right-0 z-50" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-indigo-600">
          <Link to="/">EduPlatform</Link>
        </div>

        <nav className="flex items-center gap-3">
          {/* keep login/register buttons for convenience */}
          {user ? (
            <>
              {/* <Link to="/profile" className="hidden sm:flex items-center gap-3" title={user.full_name || user.username || 'Account'}>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.full_name || user.username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(user.full_name || user.username)}</span>
                  )}
                </div>
                <span className="px-2 text-gray-700">{user.full_name || user.username || 'Account'}</span>
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Logout</button> */}
            </>
          ) : (
            <>
              {/* <Link
                to="/login"
                className="px-4 py-2 rounded-md border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Register
              </Link> */}
            </>
          )}

          {/* Always-visible avatar button */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(open => !open)}
              className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              {user && user.avatar ? (
                <img src={user.avatar} alt={user.full_name || user.username} className="w-full h-full object-cover" />
              ) : user ? (
                <span>{getInitials(user.full_name || user.username)}</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a9.99 9.99 0 0116 0H2z" />
                </svg>
              )}
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                {user ? (
                  <div className="flex flex-col">
                    <Link to="/profile" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <Link to="/login" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Login</Link>
                    <Link to="/register" className="px-4 py-2 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>Register</Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
      </header>
      {/* spacer to offset fixed header height */}
      <div className="h-16 md:h-20" aria-hidden="true" />
    </>
  );
}
