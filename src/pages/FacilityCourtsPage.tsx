import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import apiClient from '../services/apiClient';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
}

interface CourtDtoPagedResult {
  items: Court[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface Facility {
  id: string;
  name: string | null;
  address: string | null;
}

export default function FacilityCourtsPage() {
  const { id } = useParams<{ id: string }>();
  const [courts, setCourts] = useState<Court[]>([]);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilityAndCourts = async () => {
      setLoading(true);
      try {
        const facilityRes = await apiClient.get<Facility>(`/api/facilities/${id}`);
        setFacility(facilityRes.data);

        const courtsRes = await apiClient.get<CourtDtoPagedResult>(`/api/facilities/${id}/courts`, {
          params: { PageNumber: 1, PageSize: 30 }
        });
        setCourts(courtsRes.data.items || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchFacilityAndCourts();
    }
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Loading facility details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-primary">Go Back</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h2 className="fw-bold mb-1">{facility?.name || 'Facility'}</h2>
          <p className="text-secondary mb-0">{facility?.address}</p>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm">Back to Search</Link>
      </div>

      <h4 className="mb-3">Available Courts</h4>
      {courts.length === 0 ? (
        <Alert variant="info">No courts are assigned to this facility yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courts.map(court => (
            <Col key={court.id}>
              <Card className={`h-100 shadow-sm border-secondary ${!court.isActive ? 'opacity-50' : ''}`}>
                <Card.Body>
                  <Card.Title>{court.name || 'Unnamed Court'}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted small">Surface: {court.surfaceType}</Card.Subtitle>
                  <Card.Text className="mt-3">
                    Status: {court.isActive ? <span className="text-success">Active</span> : <span className="text-danger">Inactive</span>}
                  </Card.Text>
                  <Button variant="primary" disabled={!court.isActive} className="w-100 mt-2">
                    {court.isActive ? 'Book Court' : 'Currently Unavailable'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}