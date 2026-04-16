import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/api/accounts/sign-up', {
        email,
        password,
        firstName,
        lastName
      });

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.title) {
        setError(err.response.data.title);
      } else {
        setError('An unexpected error occurred during registration. Please try again.');
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
              <h2 className="text-center mb-4">Create an Account</h2>
              
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {isSuccess && (
                <div className="alert alert-success" role="alert">
                  Registration successful! Redirecting to login...
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="firstNameInput" className="form-label">First Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="firstNameInput"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col">
                    <label htmlFor="lastNameInput" className="form-label">Last Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="lastNameInput"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <label htmlFor="passwordInput" className="form-label">Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="passwordInput"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPasswordInput" className="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="confirmPasswordInput"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn btn-primary w-100 py-2 mb-3"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </button>
                
                <div className="text-center">
                  <span className="text-muted">Already have an account? </span>
                  <Link to="/login" className="text-decoration-none">Log In</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
