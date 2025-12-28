import { useNavigate } from 'react-router-dom';
import { deleteCourse } from '../../api/courses';

export default function CoursesList({ courses, loading, onCourseDeleted }) {
  const navigate = useNavigate();

  const handleDelete = async (courseId, courseTitle) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteCourse(courseId);
      alert('Course deleted successfully.');
      if (onCourseDeleted) {
        onCourseDeleted(courseId);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Failed to delete course. Please try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Your courses</h2>
        <p className="text-sm text-gray-500">{courses.length} course(s)</p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading your courses…</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">You have not created any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {courses.map((course, idx) => (
            <article key={course.id ?? course._id ?? idx} className="bg-white p-4 rounded shadow-sm flex gap-4 items-start flex-col">
              <div className="w-full">
                <div className="w-full h-24 bg-gray-100 rounded overflow-hidden mb-3">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-sm font-semibold">{course.price ? `₹${course.price}` : 'Free'}</span>
                    <span className="text-xs text-gray-500">{course.is_approved ? 'Approved' : 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="w-full flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/courses/${course.id}/edit`)}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate(`/courses/${course.id}/lessons`)}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition"
                >
                  Lessons
                </button>
                <button
                  onClick={() => handleDelete(course.id, course.title)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}