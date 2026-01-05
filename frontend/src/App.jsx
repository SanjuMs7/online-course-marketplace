import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Courses from './pages/Courses'; // new page
import CourseLessons from './pages/CourseLessons';
import LessonDetail from './pages/LessonDetail';
import CourseEdit from './pages/CourseEdit';
import LessonEdit from './pages/LessonEdit';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Cart from './pages/Cart';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses" element={<Courses />} /> {/* student courses */}
      <Route path="/courses/:id/lessons" element={<CourseLessons />} />
      <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetail />} />
      <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
      <Route path="/courses/:id/edit" element={<CourseEdit />} />
      <Route path="/courses/:courseId/lessons/:lessonId/edit" element={<LessonEdit />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/cart" element={<Cart />} />
    </Routes>
  );
}

export default App;
