import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Form, Button, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';

interface Facility {
  id: string;
  name: string | null;
  address: string | null;
}

interface GetFacilitiesResponsePagedResult {
  items: Facility[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function HomePage() {
  const { user, logout } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async (search: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<GetFacilitiesResponsePagedResult>('/api/facilities', {
        params: { 
          PageNumber: 1, 
          PageSize: 15,
          SearchTerm: search || undefined
        }
      });
      setFacilities(res.data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFacilities(searchTerm);
  };
  
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

      <div className="mt-5 mb-5 align-items-center d-flex flex-column">
        <h2 className="mb-4">Explore Facilities</h2>
        <Form onSubmit={handleSearch} className="d-flex w-100 mb-4" style={{ maxWidth: '600px' }}>
          <Form.Control
            type="search"
            placeholder="Search by name or address..."
            className="me-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Search'}
          </Button>
        </Form>
        
        <div className="w-100">
          {error && <Alert variant="danger">{error}</Alert>}
          {!loading && facilities.length === 0 && !error && (
            <p className="text-secondary text-center">No facilities found. Try adjusting your search.</p>
          )}
          
          <Row xs={1} md={2} lg={3} className="g-4">
            {facilities.map(facility => (
              <Col key={facility.id}>
                <Card className="h-100 shadow-sm border-secondary">
                  <Card.Body>
                    <Card.Title>{facility.name || 'Unnamed Facility'}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted small">{facility.address || 'No address provided'}</Card.Subtitle>
                    <Card.Text className="mt-3">
                      This facility is available for booking. Browse and book courts seamlessly!
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
}
