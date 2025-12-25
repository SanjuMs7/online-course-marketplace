import { useEffect, useState } from 'react';
import { getCourses, enrollCourse } from '../../api/courses';
import '../../styles/components.css';

export default function CourseEnroll() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getCourses().then(res => setCourses(res.data));
  }, []);

  const handleEnroll = async (id) => {
    try {
      await enrollCourse(id);
      alert('Enrolled successfully!');
    } catch {
      alert('Already enrolled or error');
    }
  };

  return (
    <div className="container">
      <h2>Enroll in Courses</h2>

      {courses
        .filter(course => course.is_approved)
        .map(course => (
          <div className="course-row" key={course.id}>
            <span>{course.title}</span>
            <button onClick={() => handleEnroll(course.id)}>
              Enroll
            </button>
          </div>
        ))}
    </div>
  );
}
