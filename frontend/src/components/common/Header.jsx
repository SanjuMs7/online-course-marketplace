import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { fetchCartItems } from '../../api/cart';

export default function Header() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    const refreshCartCount = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartCount(0);
        return;
      }

      fetchCartItems()
        .then(res => {
          if (Array.isArray(res.data)) {
            setCartCount(res.data.length);
          }
        })
        .catch(() => {
          setCartCount(0);
        });
    };

    refreshCartCount();

    const handleCartChanged = () => refreshCartCount();
    window.addEventListener('cart:changed', handleCartChanged);

    return () => {
      window.removeEventListener('cart:changed', handleCartChanged);
    };
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
    setCartCount(0);
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
          {user?.role === 'STUDENT' && (
            <Link
              to="/cart"
              className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:text-indigo-600 hover:border-indigo-300 shadow-sm"
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437m0 0L6.3 13.5h10.95l1.05-6.75H5.106m.387 1.522h12.329M9 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm8.25 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.4rem] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
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
