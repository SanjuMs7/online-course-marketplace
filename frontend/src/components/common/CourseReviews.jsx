import { useEffect, useState } from 'react';
import {
  getCourseReviews,
  createCourseReview,
  updateReview,
  deleteReview,
} from '../../api/courses';

/**
 * CourseReviews renders the review list and allows enrolled students to add/edit/delete their review.
 */
export default function CourseReviews({ courseId, userId, userRole, isEnrolled }) {
  const [reviews, setReviews] = useState([]);
  const [myReviewId, setMyReviewId] = useState(null);
  const [myRating, setMyRating] = useState(null); // null means no star selected yet
  const [myComment, setMyComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsRes = await getCourseReviews(courseId);
      const list = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.results || []);
      setReviews(list);

      if (userId) {
        const mine = list.find((r) => r.student === userId);
        if (mine) {
          setMyReviewId(mine.id);
          if (editMode) {
            // Prefill only when editing; otherwise keep the form empty
            setMyRating(mine.rating || null);
            setMyComment(mine.comment || '');
          } else {
            setMyRating(null);
            setMyComment('');
          }
        } else {
          setMyReviewId(null);
          setMyRating(null);
          setMyComment('');
        }
      }
    } catch (e) {
      console.error('Failed to load reviews', e);
      setReviewError('Unable to load reviews right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, userId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!myRating || myRating < 1 || myRating > 5) {
      setReviewError('Please choose a rating between 1 and 5.');
      return;
    }

    setReviewSubmitting(true);
    try {
      if (myReviewId) {
        await updateReview(myReviewId, { rating: myRating, comment: myComment });
      } else {
        const res = await createCourseReview(courseId, { rating: myRating, comment: myComment });
        setMyReviewId(res.data?.id);
      }

      await fetchReviews();
      setEditMode(false);
      // Clear the form after submit
      setMyRating(null);
      setMyComment('');
    } catch (err) {
      console.error('Failed to submit review', err);
      const msg = err?.response?.data?.detail || err?.response?.data || 'Could not submit review.';
      setReviewError(typeof msg === 'string' ? msg : 'Could not submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!myReviewId) return;
    if (!window.confirm('Delete your review?')) return;
    setReviewSubmitting(true);
    try {
      await deleteReview(myReviewId);
      setMyReviewId(null);
      setMyRating(null);
      setMyComment('');
      await fetchReviews();
      setEditMode(false);
    } catch (err) {
      console.error('Failed to delete review', err);
      setReviewError('Could not delete review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  const canReview = userRole === 'STUDENT' && isEnrolled;
  const hasReview = !!myReviewId;

  return (
    <section className="mt-12 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Course Reviews</h2>
          <p className="text-sm text-gray-600">See what students think about this course.</p>
        </div>
        {averageRating && (
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{averageRating}</p>
            <p className="text-xs text-gray-500">Avg rating • {reviews.length} review{reviews.length === 1 ? '' : 's'}</p>
          </div>
        )}
      </div>

      {loading && <p className="text-sm text-gray-600">Loading reviews...</p>}

      {!loading && reviews.length === 0 && (
        <p className="text-sm text-gray-600">No reviews yet. Be the first to share your thoughts.</p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="space-y-4 mb-6">
          {reviews.map((rev) => (
            <article key={rev.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{rev.student_name || 'Student'}</p>
                  <p className="text-xs text-gray-500">Rating: {rev.rating}/5</p>
                </div>
                <p className="text-xs text-gray-400">{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ''}</p>
              </div>
              {rev.comment && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{rev.comment}</p>}
              {rev.student === userId && (
                <div className="mt-2 flex items-center gap-3 text-xs text-green-700">
                  <span>Your review</span>
                  <div className="flex items-center gap-2 text-gray-600">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(true);
                        setMyReviewId(rev.id);
                        setMyRating(rev.rating || 5);
                        setMyComment(rev.comment || '');
                      }}
                      className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:border-indigo-300 hover:text-indigo-700 transition"
                    >
                      <span aria-hidden="true">✎</span>
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteReview}
                      className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded hover:border-red-300 hover:text-red-600 transition"
                    >
                      <span aria-hidden="true">🗑</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {canReview && (
        <form onSubmit={handleSubmitReview} className="space-y-4 border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold text-gray-900">{hasReview ? 'Edit your review' : 'Write a review'}</h3>

          {/* Modern star-style rating pills */}
          <div className="flex flex-wrap items-center gap-2" aria-label="Select rating">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = myRating === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMyRating(n)}
                  className={`px-3 py-2 rounded-full border text-sm font-semibold transition ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:text-indigo-700'
                  }`}
                >
                  {n} ★
                </button>
              );
            })}
          </div>

          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            rows={4}
            placeholder="Share what you liked, what could improve, or how the course helped you."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-sm"
            >
              {reviewSubmitting ? 'Saving...' : (hasReview ? 'Save changes' : 'Submit review')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}