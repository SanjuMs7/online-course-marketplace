import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Testimonials from '../components/common/Testimonials';
import HomeCourseCard from '../components/common/HomeCourseCard';
import { getCourses } from '../api/courses';
import { addCartItem, fetchCartItems, removeCartItem } from '../api/cart';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartIds, setCartIds] = useState([]);
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

  const emitCartChanged = () => {
    window.dispatchEvent(new CustomEvent('cart:changed'));
  };

  const handleToggleCart = async (course) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      alert('Please log in to add items to your cart.');
      return;
    }

    const inCart = cartIds.includes(course.id);

    try {
      if (inCart) {
        await removeCartItem(course.id);
        setCartIds(prev => prev.filter(id => id !== course.id));
        alert(`${course.title} removed from cart`);
        emitCartChanged();
      } else {
        await addCartItem(course.id);
        setCartIds(prev => (prev.includes(course.id) ? prev : [...prev, course.id]));
        alert(`${course.title} added to cart`);
        emitCartChanged();
      }
    } catch (error) {
      const message = error?.response?.data?.error || 'Could not add to cart';
      alert(message);
    }
  };

  useEffect(() => {
    getCourses()
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          // Sort by enrollment_count descending for trending
          const sorted = [...data].sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
          setCourses(sorted);
        } else if (data.results && Array.isArray(data.results)) {
          const sorted = [...data.results].sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
          setCourses(sorted);
        } else {
          console.warn('Unexpected API response structure:', data);
        }
      })
      .catch(err => console.error('Error fetching courses:', err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetchCartItems()
      .then(res => {
        if (Array.isArray(res.data)) {
          setCartIds(res.data.map(item => item.course));
        }
      })
      .catch(() => {
        /* ignore cart fetch errors on home */
      });
  }, []);

  const categories = ['All', 'Development', 'Business', 'Design', 'Marketing', 'Music'];

  const filtered = courses
    .filter(c => selectedCategory === 'All' || (c.category || '').includes(selectedCategory))
    .filter(c => c.title.toLowerCase().includes(search.trim().toLowerCase()) || c.description.toLowerCase().includes(search.trim().toLowerCase()));

  const trendingCourses = [...courses].sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0)).slice(0, 4);

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
            {trendingCourses.map(course => (
              <HomeCourseCard
                key={course.id}
                course={course}
                handleCourseClick={handleCourseClick}
                getThumbnailUrl={getThumbnailUrl}
                isInCart={cartIds.includes(course.id)}
                onAddToCart={handleToggleCart}
                isTrending={true}
              />
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

        <section className="max-w-6xl mx-auto px-4 mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured courses</h2>
            <Link to="/courses" className="text-indigo-600">Browse all</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.slice(0, 8).map(course => (
              <HomeCourseCard
                key={course.id}
                course={course}
                handleCourseClick={handleCourseClick}
                getThumbnailUrl={getThumbnailUrl}
                isInCart={cartIds.includes(course.id)}
                onAddToCart={handleToggleCart}
                isTrending={false}
              />
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

