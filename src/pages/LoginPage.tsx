import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSignIn } from '../hooks/useAuthQueries';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from '../components/shared/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signInMutation = useSignIn();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const data = await signInMutation.mutateAsync({ email, password });
      if (data.jwtToken) {
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        login(data.jwtToken);
        navigate(from, { replace: true });
      } else {
        setError('Login failed: Invalid token received.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.title || err.response?.data?.message || 'Podczas logowania wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
      setError(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Zaloguj się do SyncSport</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">Adres e-mail</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailInput"
                    placeholder="imie@przyklad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="passwordInput" className="form-label mb-0">Hasło</label>
                    <Link to="/zapomniane-haslo" className="text-decoration-none small">Zapomniałeś hasła?</Link>
                  </div>
                  <PasswordInput
                    className="mt-2"
                    id="passwordInput"
                    placeholder="Wprowadź swoje hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={signInMutation.isPending}
                >
                  {signInMutation.isPending ? 'Logowanie...' : 'Zaloguj się'}
                </button>

                <div className="text-center">
                  <span className="text-muted">Nie masz konta? </span>
                  <Link to="/rejestracja" className="text-decoration-none">Utwórz konto</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
