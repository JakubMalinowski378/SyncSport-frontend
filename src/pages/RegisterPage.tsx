import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSignUp } from '../hooks/useAuthQueries';
import PasswordInput from '../components/shared/PasswordInput';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const signUpMutation = useSignUp();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUpMutation.mutateAsync({ email, password, firstName, lastName });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/logowanie');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.title || 'Podczas rejestracji wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
      setError(msg);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Utwórz konto</h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {isSuccess && (
                <div className="alert alert-success" role="alert">
                  Rejestracja powiodła się! Przekierowywanie na stronę logowania...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="firstNameInput" className="form-label">Imię</label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstNameInput"
                      placeholder="Jan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="lastNameInput" className="form-label">Nazwisko</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastNameInput"
                      placeholder="Kowalski"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <label htmlFor="passwordInput" className="form-label">Hasło</label>
                  <PasswordInput
                    id="passwordInput"
                    placeholder="Utwórz silne hasło"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPasswordInput" className="form-label">Potwierdź hasło</label>
                  <PasswordInput
                    id="confirmPasswordInput"
                    placeholder="Potwierdź swoje hasło"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={signUpMutation.isPending || isSuccess}
                >
                  {signUpMutation.isPending ? 'Tworzenie konta...' : 'Utwórz konto'}
                </button>

                <div className="text-center">
                  <span className="text-muted">Masz już konto? </span>
                  <Link to="/logowanie" className="text-decoration-none">Zaloguj się</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
