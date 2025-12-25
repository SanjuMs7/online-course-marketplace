import { useState } from 'react';
import { registerUser } from '../../api/auth';
import '../../styles/regLog.css'

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); // default role

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(fullName, email, password, role);
      alert('Registration successful!');
      console.log('Registration Data:', data);
    } catch (err) {
      alert('Registration failed! Check console for details.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        
        <select value={role} onChange={e => setRole(e.target.value)} required>
          <option value="STUDENT">Student</option>
          <option value="INSTRUCTOR">Instructor</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
