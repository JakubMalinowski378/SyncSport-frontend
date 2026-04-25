import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AppNavbar from './components/layout/Navbar';
import AppFooter from './components/layout/Footer';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import FacilityCourtsPage from './pages/FacilityCourtsPage';
import PrivateRoute from './components/auth/PrivateRoute';

function About() {
  return (
    <div className="container mt-5">
      <h2>O SyncSport</h2>
      <p>To jest przykładowa aplikacja demonstrująca komponenty Bootstrap i nawigację React Router.</p>
      <Link className="btn btn-secondary" to="/">Wróć do strony głównej</Link>
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
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/facility/:slug" element={<FacilityCourtsPage />} />
            <Route path="/profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="/admin/*" element={
              <PrivateRoute><AdminDashboardPage /></PrivateRoute>
            } />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}