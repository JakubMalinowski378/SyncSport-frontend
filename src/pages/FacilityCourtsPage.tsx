import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Form, Button, Modal } from 'react-bootstrap';
import dayjs from 'dayjs';
import apiClient from '../services/apiClient';
import { useAuth } from '../hooks/useAuth';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
}

interface CourtDtoPagedResult {
  items: Court[] | null;
}

interface Facility {
  id: string;
  name: string | null;
  address: string | null;
}

interface CourtAvailabilityDto {
  courtId: string;
  courtName: string | null;
  availableStartTimes: string[] | null;
}

interface AvailableSlotsResponse {
  date: string;
  courts: CourtAvailabilityDto[] | null;
}

export default function FacilityCourtsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [courts, setCourts] = useState<Court[]>([]);
  const [facility, setFacility] = useState<Facility | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [slots, setSlots] = useState<CourtAvailabilityDto[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookingCourt, setBookingCourt] = useState<Court | null>(null);
  const [bookingTime, setBookingTime] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

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
    
    if (id) fetchFacilityAndCourts();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!id || !selectedDate) return;
      setSlotsLoading(true);
      try {
        const slotsRes = await apiClient.get<AvailableSlotsResponse>(`/api/facilities/${id}/available-slots`, {
          params: { date: selectedDate }
        });
        setSlots(slotsRes.data.courts || []);
      } catch (err: any) {
        console.error('Failed to fetch available slots', err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  const handleBookClick = (court: Court, time: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingCourt(court);
    setBookingTime(time);
    setBookingError(null);
    setBookingSuccess(null);
  };

  const confirmBooking = async () => {
    if (!bookingCourt || !bookingTime) return;
    setBookingLoading(true);
    setBookingError(null);
    
    // Combining selectedDate and bookingTime into standard ISO Strings
    const startObj = dayjs(`${selectedDate}T${bookingTime}`);
    const endObj = startObj.add(1, 'hour'); // Assuming 1 hour slots based on availableStartTimes

    try {
      await apiClient.post('/api/reservations/me', {
        courtId: bookingCourt.id,
        startTime: startObj.format('YYYY-MM-DDTHH:mm:ssZ'),
        endTime: endObj.format('YYYY-MM-DDTHH:mm:ssZ')
      });
      setBookingSuccess('Court booked successfully!');
      
      // Refresh slots
      const slotsRes = await apiClient.get<AvailableSlotsResponse>(`/api/facilities/${id}/available-slots`, {
        params: { date: selectedDate }
      });
      setSlots(slotsRes.data.courts || []);
    } catch (err: any) {
      setBookingError(err.response?.data?.detail || 'Failed to book the court.');
    } finally {
      setBookingLoading(false);
    }
  };

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

      <div className="d-flex align-items-center mb-4 p-3 bg-card border border-secondary rounded shadow-sm">
        <h5 className="mb-0 me-3">Select Date:</h5>
        <Form.Control
          type="date"
          value={selectedDate}
          min={dayjs().format('YYYY-MM-DD')}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto border-secondary"
          style={{ minWidth: '200px' }}
        />
        {slotsLoading && <Spinner animation="border" size="sm" className="ms-3 text-primary" />}
      </div>

      <h4 className="mb-3">Available Courts & Times</h4>
      {courts.length === 0 ? (
        <Alert variant="info">No courts are assigned to this facility yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courts.map(court => {
            const courtSlots = slots.find(s => s.courtId === court.id)?.availableStartTimes || [];
            
            return (
              <Col key={court.id}>
                <Card className={`h-100 shadow-sm border-secondary ${!court.isActive ? 'opacity-50' : ''}`}>
                  <Card.Body>
                    <Card.Title>{court.name || 'Unnamed Court'}</Card.Title>
                    <Card.Subtitle className="mb-3 text-muted small">Surface: {court.surfaceType}</Card.Subtitle>
                    
                    {!court.isActive ? (
                      <Alert variant="secondary" className="mb-0 text-center py-2">
                        Currently Inactive
                      </Alert>
                    ) : (
                      <>
                        <h6 className="fw-semibold mt-3 mb-2 font-monospace text-secondary">Free slots:</h6>
                        {courtSlots.length === 0 ? (
                          <p className="text-muted small mb-0">No available slots on this date.</p>
                        ) : (
                          <div className="d-flex flex-wrap gap-2">
                            {courtSlots.map(time => (
                              <Button
                                key={time}
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleBookClick(court, time)}
                              >
                                {time.substring(0, 5)}
                              </Button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Booking Modal */}
      <Modal show={!!bookingCourt} onHide={() => {
        if (!bookingLoading && !bookingSuccess) setBookingCourt(null);
        if (bookingSuccess) setBookingCourt(null);
      }} centered>
        <Modal.Header closeButton={!bookingLoading} className="bg-card border-secondary">
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {bookingSuccess ? (
            <Alert variant="success" className="mb-0">{bookingSuccess}</Alert>
          ) : (
            <>
              {bookingError && <Alert variant="danger">{bookingError}</Alert>}
              <p>You are about to book:</p>
              <ul className="mb-0">
                <li><strong>Court:</strong> {bookingCourt?.name}</li>
                <li><strong>Date:</strong> {dayjs(selectedDate).format('MMMM D, YYYY')}</li>
                <li><strong>Time:</strong> {bookingTime?.substring(0, 5)}</li>
              </ul>
              <p className="mt-3 text-muted small">Note: Your booking will be for 1 hour by default.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          {!bookingSuccess ? (
            <>
              <Button variant="secondary" onClick={() => setBookingCourt(null)} disabled={bookingLoading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmBooking} disabled={bookingLoading}>
                {bookingLoading ? <Spinner size="sm" /> : 'Confirm Reservation'}
              </Button>
            </>
          ) : (
            <Button variant="success" onClick={() => setBookingCourt(null)}>
              Done
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}