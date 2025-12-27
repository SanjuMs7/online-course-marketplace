import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Testimonials from '../components/common/Testimonials';
import { getCourses } from '../api/courses';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    return `http://localhost:8000${thumbnailPath}`;
  };

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
                  <div className="h-36 rounded-md bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 mb-3 flex items-center justify-center overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={getThumbnailUrl(course.thumbnail)} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<svg class="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C6.5 6.253 2 10.588 2 16s4.5 9.747 10 9.747 10-4.292 10-9.747c0-5.412-4.5-9.747-10-9.747z" /></svg>';
                        }}
                      />
                    ) : (
                      <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C6.5 6.253 2 10.588 2 16s4.5 9.747 10 9.747 10-4.292 10-9.747c0-5.412-4.5-9.747-10-9.747z" />
                      </svg>
                    )}
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
                  <div className="h-36 rounded-md bg-gradient-to-r from-indigo-50 to-white border border-gray-100 mb-3 flex items-center justify-center overflow-hidden">
                    {course.thumbnail ? (
                      <img 
                        src={getThumbnailUrl(course.thumbnail)} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.style.display = 'flex';
                        }}
                      />
                    ) : null}
                  </div>
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

        <Testimonials />

        <Footer />

      </main>
    </>
  );
}

