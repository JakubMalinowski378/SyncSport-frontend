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
import ReservationPage from './pages/ReservationPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
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
            <Route path="/o-nas" element={<About />} />
            <Route path="/logowanie" element={<LoginPage />} />
            <Route path="/rejestracja" element={<RegisterPage />} />
            <Route path="/zapomniane-haslo" element={<ForgotPasswordPage />} />
            <Route path="/reset-hasla" element={<ResetPasswordPage />} />
            <Route path="/obiekt/:slug" element={<FacilityCourtsPage />} />
            <Route path="/obiekt/:facilitySlug/:courtSlug/rezerwacje" element={<ReservationPage />} />
            <Route path="/sukces" element={<PaymentSuccessPage />} />
            <Route path="/anulowano" element={<PaymentFailurePage />} />
            <Route path="/profil" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="/panel-admina/*" element={
              <PrivateRoute><AdminDashboardPage /></PrivateRoute>
            } />
          </Routes>
        </main>
        <AppFooter />
      </div>
    </BrowserRouter>
  );
}