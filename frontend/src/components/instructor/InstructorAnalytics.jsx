import { useMemo } from 'react';

export default function InstructorAnalytics({ courses = [], loading = false }) {
  const analytics = useMemo(() => {
    const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);

    const averageCompletion = courses.length
      ? Math.round(
          courses.reduce((sum, c) => sum + (Number(c.completion_rate) || 0), 0) / courses.length
        )
      : null;

    const topCourses = [...courses]
      .sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0))
      .slice(0, 3)
      .map((c) => ({
        title: c.title,
        enrollments: c.enrollment_count || 0,
        completionRate: c.completion_rate ?? null,
      }));

    const monthBuckets = {};
    courses.forEach((c) => {
      if (!c.created_at) return;
      const dt = new Date(c.created_at);
      if (Number.isNaN(dt.getTime())) return;
      const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
      monthBuckets[key] = (monthBuckets[key] || 0) + (c.enrollment_count || 0);
    });

    let enrollmentSeries = Object.entries(monthBuckets)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, value]) => ({ label: key, value }));

    if (!enrollmentSeries.length) {
      enrollmentSeries = Array.from({ length: 6 }).map((_, idx) => ({
        label: `M${idx + 1}`,
        value: 0,
      }));
    }

    return { totalEnrollments, averageCompletion, topCourses, enrollmentSeries };
  }, [courses]);

  const { totalEnrollments, averageCompletion, topCourses, enrollmentSeries } = analytics;

  const maxSeries = Math.max(...enrollmentSeries.map((p) => p.value || 0), 1);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total enrollments</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '…' : totalEnrollments}
          </p>
          <p className="text-xs text-gray-500 mt-1">Across your courses</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Avg completion</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '…' : (averageCompletion ?? 'N/A')}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Average lesson completion rate</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Active courses</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{loading ? '…' : courses.length}</p>
          <p className="text-xs text-gray-500 mt-1">Courses you own</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Top courses</p>
            <span className="text-xs text-gray-500">by enrollments</span>
          </div>
          <div className="space-y-2">
            {topCourses.length === 0 && (
              <p className="text-xs text-gray-500">No enrollment data yet.</p>
            )}
            {topCourses.map((c) => (
              <div key={c.title} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">
                    {c.completionRate != null ? `${c.completionRate}% completion` : 'Completion N/A'}
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap">
                  {c.enrollments} enrolled
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
