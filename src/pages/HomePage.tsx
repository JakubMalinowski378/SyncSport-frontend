import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="container mt-5">
      <div className="jumbotron p-5 bg-light rounded text-center shadow-sm">
        <h1 className="display-4 text-primary fw-bold mb-3">Welcome to SyncSport!</h1>
        <p className="lead text-secondary">
          Your ultimate destination for discovering, booking, and managing sports facilities.
        </p>
        <hr className="my-4" />
        <p className="mb-4">
          Whether you're looking for a quick tennis match, booking a football pitch, or managing your own facility, SyncSport has got you covered.
        </p>
        
        {user ? (
           <div className="mt-4 p-4 border rounded bg-white shadow-sm d-inline-block text-start">
             <h4 className="mb-3 text-success">👋 Welcome back, {user.email}!</h4>
             <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item border-0 px-0">
                  <span className="badge bg-secondary me-2">Role</span> 
                  {user.role === 1 ? 'User' : user.role === 2 ? 'Manager' : 'Admin'}
                </li>
                {user.managedFacilityIds && user.managedFacilityIds.length > 0 && (
                  <li className="list-group-item border-0 px-0">
                    <span className="badge bg-info me-2">Facilities</span> 
                    {user.managedFacilityIds.join(', ')}
                  </li>
                )}
             </ul>
             <div className="d-flex gap-2">
               <button className="btn btn-outline-danger w-100" onClick={logout}>Logout</button>
             </div>
           </div>
        ) : (
           <div className="mt-4 gap-3 d-flex justify-content-center">
             <Link className="btn btn-success btn-lg px-4" to="/login" role="button">Log In</Link>
             <Link className="btn btn-outline-primary btn-lg px-4" to="/about" role="button">Learn more</Link>
           </div>
        )}
      </div>

      {!user && (
        <div className="row mt-5 text-center">
          <div className="col-md-4 mb-4">
            <div className="h-100 p-4 border rounded bg-white shadow-sm">
              <div className="fs-1 mb-3">🔍</div>
              <h3 className="h5">Find Courts</h3>
              <p className="text-muted small">Easily browse available courts and facilities in your area.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="h-100 p-4 border rounded bg-white shadow-sm">
              <div className="fs-1 mb-3">📅</div>
              <h3 className="h5">Book Instantly</h3>
              <p className="text-muted small">Secure your spot instantly with our streamlined booking system.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="h-100 p-4 border rounded bg-white shadow-sm">
              <div className="fs-1 mb-3">🏆</div>
              <h3 className="h5">Play & Enjoy</h3>
              <p className="text-muted small">Show up with your friends and enjoy your favorite sports.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
