import { Link } from 'react-router-dom';
import '../../styles/header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">EduPlatform</Link>
      </div>

      <nav className="nav-buttons">
        <Link to="/login" className="btn-outline">Login</Link>
        <Link to="/register" className="btn-primary">Register</Link>
      </nav>
    </header>
  );
}
