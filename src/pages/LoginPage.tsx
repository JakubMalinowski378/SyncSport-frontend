import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';
import PasswordInput from '../components/shared/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/accounts/sign-in', {
        email,
        password,
      });

      const { jwtToken, refreshToken } = response.data;
      if (jwtToken) {
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        login(jwtToken);
        navigate(from, { replace: true });
      } else {
        setError('Login failed: Invalid token received.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.title) {
        setError(err.response.data.title);
      } else {
        setError('An unexpected error occurred during login. Please try again.');
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
              <h2 className="text-center mb-4">Log In to SyncSport</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="emailInput" className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="emailInput"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="passwordInput" className="form-label mb-0">Password</label>
                    <Link to="/forgot-password" className="text-decoration-none small">Forgot password?</Link>
                  </div>
                  <PasswordInput 
                    className="mt-2" 
                    id="passwordInput"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Log In'}
                </button>

                <div className="text-center">
                  <span className="text-muted">Don't have an account? </span>
                  <Link to="/register" className="text-decoration-none">Sign Up</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
