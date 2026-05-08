import { useSearchParams, Link } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { BsCheckCircleFill, BsArrowRight } from 'react-icons/bs';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get('reservationId');

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

          {reservationId && (
            <div className="mt-2 text-secondary">
              <small>Numer rezerwacji:</small> <span className="fw-semibold font-monospace">{reservationId}</span>
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
