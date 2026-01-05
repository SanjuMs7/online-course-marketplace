import { Link } from 'react-router-dom';

export default function HomeCourseCard({ course, handleCourseClick, getThumbnailUrl, isTrending = false, onAddToCart = () => {}, isInCart = false }) {
  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(course);
  };

  return (
    <Link to={`/courses?courseId=${course.id}`} onClick={(e) => handleCourseClick(e, course.id)}>
      <article className="relative bg-white rounded-lg p-3 shadow-sm hover:shadow-lg transition-transform duration-300 ease-in-out flex flex-col cursor-pointer h-full hover:border-indigo-600 border hover:scale-105">
        <button
          type="button"
          aria-label="Add to cart"
          className={`absolute top-2 right-2 inline-flex items-center justify-center w-9 h-9 rounded-full border shadow-sm transition ${isInCart ? 'bg-red-100 border-red-200 text-red-600' : 'bg-white/90 border-gray-200 hover:bg-red-50 hover:text-red-600'}`}
          onClick={handleAddToCartClick}
        >
          <svg className="w-5 h-5" fill={isInCart ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21s-6.5-4.35-9-9A5.25 5.25 0 0 1 7.5 3 5.5 5.5 0 0 1 12 5.25 5.5 5.5 0 0 1 16.5 3 5.25 5.25 0 0 1 21 12c-2.5 4.65-9 9-9 9Z" />
          </svg>
        </button>

        <div className={`h-36 rounded-md ${isTrending ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200' : 'bg-gradient-to-r from-indigo-50 to-white border border-gray-100'} mb-3 flex items-center justify-center overflow-hidden`}>
          {course.thumbnail ? (
            <img 
              src={getThumbnailUrl(course.thumbnail)} 
              alt={course.title} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                if (isTrending) {
                  e.target.parentElement.innerHTML = '<svg class="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C6.5 6.253 2 10.588 2 16s4.5 9.747 10 9.747 10-4.292 10-9.747c0-5.412-4.5-9.747-10-9.747z" /></svg>';
                } else {
                  e.target.parentElement.style.display = 'flex';
                }
              }}
            />
          ) : isTrending ? (
            <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C6.5 6.253 2 10.588 2 16s4.5 9.747 10 9.747 10-4.292 10-9.747c0-5.412-4.5-9.747-10-9.747z" />
            </svg>
          ) : null}
        </div>

        {isTrending && (
          <div className="mb-2">
            <span className="inline-block text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold">Trending</span>
          </div>
        )}

        <h4 className={`text-sm font-semibold text-gray-900 ${isTrending ? '' : ''}`}>{course.title}</h4>
        <p className="text-xs text-gray-500">{(course.instructor && course.instructor.username) || 'Instructor'}</p>
        <p className={`text-sm text-gray-700 mt-2 ${isTrending ? 'line-clamp-2' : 'line-clamp-3'}`}>
          {isTrending ? course.description?.slice(0, 100) : course.description?.slice(0, 120)}
          {isTrending ? (course.description?.length > 100 ? '...' : '') : (course.description?.length > 120 ? '...' : '')}
        </p>

        <div className={`mt-auto flex items-center justify-between text-sm ${isTrending ? '' : 'text-gray-700'} pt-3`}>
          <span className="inline-block text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{course.is_approved ? 'Approved' : 'Pending'}</span>
          <span className={`font-semibold ${isTrending ? 'text-gray-900' : ''}`}>{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
        </div>
      </article>
    </Link>
  );
}
