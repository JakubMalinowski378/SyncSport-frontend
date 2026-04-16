import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AppNavbar from './components/layout/Navbar';
import AppFooter from './components/layout/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';

function About() {
  return (
    <div className="container mt-5">
      <h2>About SyncSport</h2>
      <p>This is a sample application demonstrating Bootstrap components and React Router navigation.</p>
      <Link className="btn btn-secondary" to="/">Go Back Home</Link>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="d-flex flex-column min-vh-100">
        <AppNavbar />
        <main className="flex-grow-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}