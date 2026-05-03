import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useResetPassword } from '../hooks/useAuthQueries';
import PasswordInput from '../components/shared/PasswordInput';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const resetMutation = useResetPassword();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await resetMutation.mutateAsync({ resetToken: token, newPassword });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/logowanie');
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.title || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
      setError(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Ustaw nowe hasło</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {isSuccess && (
                <div className="alert alert-success" role="alert">
                  Hasło zostało zresetowane pomyślnie! Przekierowywanie na stronę logowania...
                </div>
              )}

              {!isSuccess && (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="passwordInput" className="form-label">Nowe hasło</label>
                    <PasswordInput
                      id="passwordInput"
                      placeholder="Wprowadź nowe hasło"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPasswordInput" className="form-label">Potwierdź hasło</label>
                    <PasswordInput
                      id="confirmPasswordInput"
                      placeholder="Potwierdź nowe hasło"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 mb-3"
                    disabled={resetMutation.isPending || !token}
                >
                    {resetMutation.isPending ? 'Resetowanie...' : 'Zresetuj hasło'}
                  </button>

                  <div className="text-center">
                    <Link to="/logowanie" className="text-decoration-none">Wróć do logowania</Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}