import { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);
    setIsLoading(true);

    try {
      await apiClient.post('/api/accounts/forgot-password', { email });
      setIsSuccess(true);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.title) {
        setError(err.response.data.title);
      } else {
        setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">Zresetuj hasło</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {isSuccess && (
                <div className="alert alert-success" role="alert">
                  Jeśli konto z tym adresem e-mail istnieje, wysłaliśmy link do resetowania hasła.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
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
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
                </button>

                <div className="text-center">
                  <Link to="/logowanie" className="text-decoration-none">Wróć do logowania</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}