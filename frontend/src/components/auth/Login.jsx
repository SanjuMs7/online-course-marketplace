import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import { loginUser } from '../../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Ensure inputs are cleared on mount to avoid browser-autofill showing values
  useEffect(() => {
    setEmail('');
    setPassword('');

    // Also clear the actual DOM inputs shortly after mount — some browsers autofill after mount
    const t = setTimeout(() => {
      const e = document.getElementById('email');
      const p = document.getElementById('password');
      if (e) e.value = '';
      if (p) p.value = '';
    }, 50);

    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUser(email, password);

      // Store token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'STUDENT') {
        navigate('/courses');
      } else if (data.user.role === 'INSTRUCTOR') {
        navigate('/instructor-dashboard');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin-dashboard');
      }

    } catch (err) {
      alert('Login failed! Please check credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    {/* <Header></Header> */}
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      
      <div className="w-full max-w-4xl grid md:grid-cols-2 bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left promo */}
        <div className="hidden md:flex flex-col justify-center px-10 py-12 bg-gradient-to-br from-indigo-600 to-indigo-400 text-white gap-6">
          <h2 className="text-3xl font-extrabold">Learn on your schedule</h2>
          <p className="opacity-90">High-quality courses from expert instructors — learn the skills you need to grow your career.</p>

          <ul className="space-y-2">
            <li className="flex items-start gap-2"><span className="mt-1 text-indigo-200">●</span> <span className="text-sm opacity-90">Hands-on projects</span></li>
            <li className="flex items-start gap-2"><span className="mt-1 text-indigo-200">●</span> <span className="text-sm opacity-90">Lifetime access</span></li>
            <li className="flex items-start gap-2"><span className="mt-1 text-indigo-200">●</span> <span className="text-sm opacity-90">Expert community</span></li>
          </ul>

          <div className="mt-4">
            <Link to="/register" className="inline-block px-4 py-2 bg-white text-indigo-600 rounded-md font-medium hover:bg-indigo-50">Create an account</Link>
          </div>
        </div>

        {/* Right: Login form */}
        <div className="px-8 py-10">
          <h3 className="text-2xl font-bold text-gray-900">Welcome back</h3>
          <p className="mt-2 text-sm text-gray-600">Sign in to continue to EduPlatform</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" autoComplete="off">
            {/* Autofill trap: hidden inputs that capture browser autofill so visible fields stay empty */}
            <input type="text" name="username" autoComplete="username" style={{position: 'absolute', left: '-9999px', top: 'auto'}} />
            <input type="password" name="current-password" autoComplete="current-password" style={{position: 'absolute', left: '-9999px', top: 'auto'}} />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="off"
                  className="w-full pr-10 px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10.58 10.59A3 3 0 0 1 13.41 13.41" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9.88 5.12A10.94 10.94 0 0 0 2 12c1.73 3.26 5 6 10 6 1.5 0 2.86-.28 4.08-.76" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12z" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-center sm:justify-end text-sm">
              <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md font-semibold shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>


            <p className="text-sm text-gray-500">Don't have an account? <Link to="/register" className="text-indigo-600 hover:underline">Create one</Link></p>
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
