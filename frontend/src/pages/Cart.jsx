import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import HomeCourseCard from '../components/common/HomeCourseCard';
import PaymentModal from '../components/payment/PaymentModal';
import { fetchCartItems, removeCartItem } from '../api/cart';
import { enrollCourse } from '../api/courses';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
      return thumbnailPath;
    }
    return `http://localhost:8000${thumbnailPath}`;
  };

  const handleCourseClick = () => {
    // On cart page we allow navigation; auth is already required by the API
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchCartItems();
        setItems(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          navigate('/login');
        } else {
          setError(err?.response?.data?.error || 'Failed to load cart');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  const emitCartChanged = () => {
    window.dispatchEvent(new CustomEvent('cart:changed'));
  };

  const handleRemove = async (courseId) => {
    try {
      await removeCartItem(courseId);
      setItems(prev => prev.filter(item => item.course !== courseId));
      emitCartChanged();
    } catch (err) {
      alert(err?.response?.data?.error || 'Could not remove item');
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item?.course_details?.price || 0), 0);

  const handleEnroll = async (course) => {
    if (!course) return;

    // Paid courses -> open payment modal
    if (Number(course.price) > 0) {
      setSelectedCourse(course);
      setShowPaymentModal(true);
      return;
    }

    // Free courses -> enroll directly
    try {
      await enrollCourse(course.id);
      await handleRemove(course.id);
      navigate(`/courses/${course.id}/lessons/`);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message = typeof data === 'string' ? data.toLowerCase() : JSON.stringify(data || '').toLowerCase();

      if (status === 400 && message.includes('already enrolled')) {
        await handleRemove(course.id);
        navigate(`/courses/${course.id}/lessons/`);
        return;
      }

      if (status === 401 || status === 403) {
        alert('Please log in as a student to enroll.');
        navigate('/login');
        return;
      }

      alert('Failed to enroll. Please try again.');
    }
  };

  const handlePaymentSuccess = async (courseId) => {
    setShowPaymentModal(false);
    setSelectedCourse(null);
    await handleRemove(courseId);
    navigate(`/courses/${courseId}/lessons/`);
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    setSelectedCourse(null);
  };

  const handleCheckout = () => {
    if (!items.length) return;
    // For now, trigger payment/enroll for the first item in the cart
    const item = items[0];
    const course = { ...item.course_details, id: item.course };
    handleEnroll(course);
  };

  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

        {loading && <p className="text-gray-600">Loading cart...</p>}
        {error && !loading && <p className="text-red-600 mb-4">{error}</p>}

        {!loading && !items.length && !error && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-700 mb-4">Your cart is empty.</p>
            <Link to="/courses" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Browse courses</Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => {
                const course = { ...item.course_details, id: item.course };
                return (
                  <div key={item.id} className="relative">
                    <HomeCourseCard
                      course={course}
                      handleCourseClick={handleCourseClick}
                      getThumbnailUrl={getThumbnailUrl}
                      isTrending={false}
                      isInCart={true}
                      onAddToCart={() => handleRemove(item.course)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border w-full">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Summary</h2>
              <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold text-gray-900 mb-4">
                <span>Total</span>
                <span>{total > 0 ? `₹${total}` : 'Free'}</span>
              </div>
              <button
                className="w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-300"
                disabled={items.length === 0}
                onClick={handleCheckout}
              >
                Checkout Each courses 
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {showPaymentModal && selectedCourse && (
        <PaymentModal
          course={selectedCourse}
          onClose={handlePaymentClose}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
