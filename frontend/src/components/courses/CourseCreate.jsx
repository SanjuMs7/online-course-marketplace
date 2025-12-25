import { useState } from 'react';
import { createCourse } from '../../api/courses';
import '../../styles/components.css';

export default function CourseCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCourse({ title, description });
      alert('Course created successfully (waiting for approval)');
      setTitle('');
      setDescription('');
    } catch {
      alert('Error creating course');
    }
  };

  return (
    <div className="container">
      <h2>Create Course</h2>

      <form className="form" onSubmit={handleSubmit}>
        <input
          placeholder="Course Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Course Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <button>Create</button>
      </form>
    </div>
  );
}
