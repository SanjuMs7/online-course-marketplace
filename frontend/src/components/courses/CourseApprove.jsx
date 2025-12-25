import { useEffect, useState } from 'react';
import { getCourses, approveCourse } from '../../api/courses';
import '../../styles/components.css';

export default function CourseApprove() {
  const [courses, setCourses] = useState([]);

  const loadCourses = () => {
    getCourses().then(res => setCourses(res.data));
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleApprove = async (id) => {
    await approveCourse(id);
    loadCourses();
  };

  return (
    <div className="container">
      <h2>Approve Courses</h2>

      {courses
        .filter(course => !course.is_approved)
        .map(course => (
          <div className="course-row" key={course.id}>
            <span>{course.title}</span>
            <button onClick={() => handleApprove(course.id)}>
              Approve
            </button>
          </div>
        ))}
    </div>
  );
}
