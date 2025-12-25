import Header from '../components/common/Header';
import '../styles/home.css';

export default function Home() {
  return (
    <>
      <Header />

      <main className="home-container">
        <div className="home-content">
          <h1>Learn Skills That Matter</h1>
          <p>
            A modern online learning platform where instructors create
            high-quality courses and students learn at their own pace.
          </p>

          <ul>
            <li>✔ Expert instructors</li>
            <li>✔ Flexible learning</li>
            <li>✔ Progress tracking</li>
          </ul>
        </div>
      </main>
    </>
  );
}
