import { useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { BsCheckCircleFill, BsArrowRight } from 'react-icons/bs';
import { useReservation } from '../hooks/useReservationQueries';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');

  const { data: reservation, isLoading: loading, error: fetchError } = useReservation(reservationId || '');
  const error = !reservationId
    ? 'Brak identyfikatora rezerwacji.'
    : fetchError
      ? (fetchError instanceof Error ? fetchError.message : 'Nie udało się pobrać szczegółów rezerwacji.')
      : null;

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <Card className="bg-card border border-secondary rounded-4 shadow-sm text-center p-4">
        <Card.Body className="d-flex flex-column align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: 80,
              height: 80,
              background: 'rgba(25, 135, 84, 0.15)',
            }}
          >
            <BsCheckCircleFill size={48} className="text-success" />
          </div>

          <h2 className="fw-bold mt-2">Płatność powiodła się!</h2>
          <p className="text-secondary mb-1">
            Twoja rezerwacja została potwierdzona. Dziękujemy za skorzystanie z
            SyncSport!
          </p>

          {loading && (
            <div className="py-3">
              <Spinner animation="border" size="sm" /> Ładowanie szczegółów…
            </div>
          )}

          {error && <Alert variant="warning">{error}</Alert>}

          {reservation && (
            <div
              className="w-100 mt-2 p-3 rounded-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div className="d-flex flex-column gap-2 text-start">
                {reservation.facilityName && (
                  <div>
                    <small className="text-secondary">Obiekt</small>
                    <div className="fw-semibold">{reservation.facilityName}</div>
                  </div>
                )}
                {reservation.courtName && (
                  <div>
                    <small className="text-secondary">Kort / sala</small>
                    <div className="fw-semibold">{reservation.courtName}</div>
                  </div>
                )}
                <div>
                  <small className="text-secondary">Numer rezerwacji</small>
                  <div className="fw-semibold font-monospace">
                    {reservation.id}
                  </div>
                </div>
                <div>
                  <small className="text-secondary">Termin</small>
                  <div className="fw-semibold">
                    {new Date(reservation.startTime).toLocaleString('pl-PL', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}{' '}
                    –{' '}
                    {new Date(reservation.endTime).toLocaleString('pl-PL', {
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
            <Button as={Link as any} to="/" variant="primary">
              Strona główna
            </Button>
            <Button as={Link as any} to="/moje-rezerwacje" variant="outline-secondary">
              Moje rezerwacje <BsArrowRight className="ms-1" />
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
