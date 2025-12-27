import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import { getCourses } from '../api/courses';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const handleCourseClick = (e, courseId) => {
    const user = localStorage.getItem('user');
    if (!user) {
      e.preventDefault();
      navigate('/register');
      alert('Please register or log in to access course details.');
    }
  };

  useEffect(() => {
    getCourses()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setCourses(data);
        } else if (data.results && Array.isArray(data.results)) {
          setCourses(data.results);
        } else {
          console.warn('Unexpected API response structure:', data);
        }
      })
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  const categories = ['All', 'Development', 'Business', 'Design', 'Marketing', 'Music'];

  const filtered = courses
    .filter(c => selectedCategory === 'All' || (c.category || '').includes(selectedCategory))
    .filter(c => c.title.toLowerCase().includes(search.trim().toLowerCase()) || c.description.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <>
      <Header />

      <main className="bg-gray-50 ">
        <section className="max-w-6xl mx-auto grid place-items-center py-12 px-4">
          <div className="w-full text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mx-auto">Learn anytime, anywhere — from industry experts</h1>
            <p className="text-gray-600 mt-4">Build in-demand skills and advance your career with online courses.</p>

            <form className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center" onSubmit={e => e.preventDefault()}>
              <input
                aria-label="Search courses"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Search for courses, e.g. React, Python, Excel"
              />

              <Link to={`/courses?search=${encodeURIComponent(search)}`} className="w-full sm:w-auto inline-flex items-center px-4 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition justify-center">Search</Link>
            </form>

            <div className="mt-4 text-sm text-gray-500 text-center">Learn in-demand skills with expert instructors — enroll now.</div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Trending courses</h2>
            <Link to="/courses" className="text-indigo-600 text-sm">View all</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 4).map(course => (
              <Link key={course.id} to={`/courses?courseId=${course.id}`} onClick={(e) => handleCourseClick(e, course.id)}>
                <article className="bg-white rounded-lg p-3 shadow-sm hover:shadow-lg transition flex flex-col cursor-pointer h-full">
                  <div className="h-36 rounded-md bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 mb-3 flex items-center justify-center">
                    <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C6.5 6.253 2 10.588 2 16s4.5 9.747 10 9.747 10-4.292 10-9.747c0-5.412-4.5-9.747-10-9.747z" />
                    </svg>
                  </div>
                  <div className="mb-2">
                    <span className="inline-block text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold">Trending</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900">{course.title}</h4>
                  <p className="text-xs text-gray-500">{(course.instructor && course.instructor.username) || 'Instructor'}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{course.description?.slice(0, 100)}{course.description?.length > 100 ? '...' : ''}</p>

                  <div className="mt-auto flex items-center justify-between text-sm pt-3">
                    <span className="inline-block text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{course.is_approved ? 'Approved' : 'Pending'}</span>
                    <span className="font-semibold text-gray-900">{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-10">
          <h3 className="text-lg font-semibold text-gray-800">Popular categories</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                className={`px-3 py-1 rounded-full border ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured courses</h2>
            <Link to="/courses" className="text-indigo-600">Browse all</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.slice(0, 8).map(course => (
              <Link key={course.id} to={`/courses?courseId=${course.id}`} onClick={(e) => handleCourseClick(e, course.id)}>
                <article className="bg-white rounded-lg p-3 shadow-sm hover:shadow-lg transition flex flex-col cursor-pointer h-full">
                  <div className="h-36 rounded-md bg-gradient-to-r from-indigo-50 to-white border border-gray-100 mb-3" />
                  <h4 className="text-sm font-semibold text-gray-900">{course.title}</h4>
                  <p className="text-xs text-gray-500">{(course.instructor && course.instructor.username) || 'Instructor'}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{course.description?.slice(0, 120)}{course.description?.length > 120 ? '...' : ''}</p>

                  <div className="mt-auto flex items-center justify-between text-sm text-gray-700 pt-3">
                    <span className="inline-block text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{course.is_approved ? 'Approved' : 'Pending'}</span>
                    <span className="font-semibold">{course.price > 0? `₹${course.price}` : 'Free'}</span>
                  </div>
                </article>
              </Link>
            ))}

            {filtered.length === 0 && (
              <p className="text-gray-500">No courses found for your search.</p>
            )}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">What students say</h3>
            <p className="text-sm text-gray-500">Real reviews from learners</p>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <figure className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <svg aria-hidden className="w-6 h-6 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 21h-4a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <blockquote className="text-gray-700 italic mb-4">"This platform helped me change careers — the instructors are top-notch."</blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.45a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.45a1 1 0 0 0-1.175 0l-3.37 2.45c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927z" />
                    </svg>
                  ))}
                </div>

                <figcaption className="text-sm text-gray-600">— Priya, Product Manager</figcaption>
              </div>
            </figure>

            <figure className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <svg aria-hidden className="w-6 h-6 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 21h-4a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <blockquote className="text-gray-700 italic mb-4">"Hands-on projects and great community support — highly recommend."</blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.45a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.45a1 1 0 0 0-1.175 0l-3.37 2.45c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927z" />
                    </svg>
                  ))}
                </div>

                <figcaption className="text-sm text-gray-600">— Rohit, Freelancer</figcaption>
              </div>
            </figure>

            <figure className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <svg aria-hidden className="w-6 h-6 text-indigo-600 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 21H5a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M17 21h-4a2 2 0 0 1-2-2v-4a6 6 0 0 1 6-6h0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>

              <blockquote className="text-gray-700 italic mb-4">"Great value and practical content. I landed my dream job!"</blockquote>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 0 0 .95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.45a1 1 0 0 0-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.45a1 1 0 0 0-1.175 0l-3.37 2.45c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 0 0-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 0 0 .95-.69L9.049 2.927z" />
                    </svg>
                  ))}
                </div>

                <figcaption className="text-sm text-gray-600">— Anjali, Software Engineer</figcaption>
              </div>
            </figure>
          </div>
        </section>

        <footer className="bg-gray-600 text-white border-t mt-12 mb-0">
          <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-3">
            <div>
              <h4 className="text-xl font-bold text-white">EduPlatform</h4>
              <p className="text-sm text-white mt-2">High-quality courses from industry experts to help you grow your career.</p> 
            </div>

            <nav aria-label="Footer" className="grid grid-cols-2 gap-4 md:grid-cols-2">
              <div>
                <h5 className="text-sm font-semibold text-white">Company</h5>
                <ul className="mt-2 space-y-2 text-sm text-white">
                  <li><a href="/about" className="text-white hover:text-indigo-200">About</a></li>
                  <li><a href="/careers" className="text-white hover:text-indigo-200">Careers</a></li>
                  <li><a href="/contact" className="text-white hover:text-indigo-200">Contact</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-white">Support</h5>
                <ul className="mt-2 space-y-2 text-sm text-white">
                  <li><a href="/help" className="text-white hover:text-indigo-200">Help Center</a></li>
                  <li><a href="/terms" className="text-white hover:text-indigo-200">Terms</a></li>
                  <li><a href="/privacy" className="text-white hover:text-indigo-200">Privacy</a></li>
                </ul>
              </div>
            </nav>

              <div className="md:text-right">
                <h5 className="text-sm font-semibold text-white">Stay connected</h5>
                <div className="mt-2 flex items-center justify-start md:justify-end gap-3">
                  <a href="#" className="text-white hover:text-indigo-200" aria-label="Twitter">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M8 19c7 0 10.8-5.8 10.8-10.8v-.5A7.7 7.7 0 0 0 20 6.3a7.4 7.4 0 0 1-2.1.6 3.7 3.7 0 0 0 1.6-2 7.4 7.4 0 0 1-2.4.9 3.7 3.7 0 0 0-6.3 3.4A10.5 10.5 0 0 1 4 5.7a3.7 3.7 0 0 0 1.1 4.9A3.6 3.6 0 0 1 3 10v.1a3.7 3.7 0 0 0 3 3.6 3.7 3.7 0 0 1-1 .1 3.5 3.5 0 0 1-.7-.1 3.7 3.7 0 0 0 3.4 2.6A7.5 7.5 0 0 1 4 17.6 10.5 10.5 0 0 0 11 19" />
                    </svg>
                  </a>

                  <a href="#" className="text-white hover:text-indigo-200" aria-label="LinkedIn">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24V7.98h4.98V24H0zM7.5 7.98H12v2.18h.07c.63-1.2 2.17-2.47 4.47-2.47C21.2 7.69 24 9.84 24 14.2V24h-4.98v-8.1c0-1.93-.03-4.4-2.68-4.4-2.68 0-3.09 2.09-3.09 4.25V24H7.5V7.98z" />
                    </svg>
                  </a>

                  <a href="#" className="text-white hover:text-indigo-200" aria-label="GitHub">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.78-1.34-1.78-1.09-.75.08-.73.08-.73 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.46-2.38 1.22-3.22-.12-.3-.53-1.52.12-3.17 0 0 .99-.32 3.25 1.22a11.3 11.3 0 0 1 5.93 0c2.26-1.54 3.25-1.22 3.25-1.22.65 1.65.24 2.87.12 3.17.76.84 1.22 1.91 1.22 3.22 0 4.61-2.8 5.62-5.47 5.92.43.36.81 1.1.81 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5z" />
                    </svg>
                  </a> 
                </div>
              </div>
          </div>

          <div className="border-t border-gray-600 bg-gray-600">
            <div className="max-w-6xl mx-auto px-4 py-3 text-sm text-white flex flex-col md:flex-row justify-between items-center">
              <span className="w-screen mt-2 md:mt-0 text-center">Built with ❤️</span>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}

