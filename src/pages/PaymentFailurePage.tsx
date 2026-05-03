import { useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { BsXCircleFill, BsArrowRight } from 'react-icons/bs';
import { useReservation } from '../hooks/useReservationQueries';

export default function PaymentFailurePage() {
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
              background: 'rgba(220, 53, 69, 0.15)',
            }}
          >
            <BsXCircleFill size={48} className="text-danger" />
          </div>

          <h2 className="fw-bold mt-2">Płatność nie powiodła się</h2>
          <p className="text-secondary mb-1">
            Twoja płatność nie została zrealizowana. Rezerwacja nie została
            potwierdzona — możesz spróbować ponownie lub wybrać inny termin.
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

          {!loading && (
            <Alert variant="info" className="text-start w-100 mt-2">
              <strong>Co teraz?</strong>
              <ul className="mb-0 mt-1">
                <li>Spróbuj ponownie dokonać rezerwacji tego samego terminu.</li>
                <li>Wybierz inny dostępny termin.</li>
                <li>
                  Skontaktuj się z obsługą obiektu, jeśli problem się
                  powtarza.
                </li>
              </ul>
            </Alert>
          )}

          <div className="d-flex flex-wrap gap-2 justify-content-center mt-3">
            {reservation?.facilitySlug && reservation?.courtSlug ? (
              <Button
                as={Link as any}
                to={`/obiekt/${reservation.facilitySlug}/${reservation.courtSlug}/rezerwacje`}
                variant="primary"
              >
                Spróbuj ponownie <BsArrowRight className="ms-1" />
              </Button>
            ) : (
              <Button as={Link as any} to="/" variant="primary">
                Przeglądaj obiekty
              </Button>
            )}
            <Button as={Link as any} to="/" variant="outline-secondary">
              Strona główna
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
