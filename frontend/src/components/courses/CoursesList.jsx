import { useEffect, useState } from 'react';
import { getCourses } from '../../api/courses';
import '../../styles/components.css';

export default function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getCourses()
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Available Courses</h2>

      <div className="course-grid">
        {courses.map(course => (
          <div className="course-card" key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <span className="badge">
              {course.is_approved ? 'Approved' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
