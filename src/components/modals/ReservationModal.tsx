import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Form } from 'react-bootstrap';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
import { useCalculatePrice } from '../../hooks/useFacilityQueries';
import { useCreateReservation } from '../../hooks/useReservationQueries';
import { useCreateCheckoutSession } from '../../hooks/usePaymentQueries';

interface ReservationModalProps {
  show: boolean;
  onHide: () => void;
  facilityId: string;
  courtId: string;
  slot: {
    startTime: string;
    endTime: string;
  } | null;
}

export default function ReservationModal({ show, onHide, facilityId, courtId, slot }: ReservationModalProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payOnSite, setPayOnSite] = useState(false);

  const calculatePriceMutation = useCalculatePrice();
  const createReservationMutation = useCreateReservation();
  const createCheckoutSessionMutation = useCreateCheckoutSession();

  useEffect(() => {
    if (show && slot) {
      calculatePrice();
    } else {
      setPrice(null);
      setError(null);
      setPayOnSite(false);
    }
  }, [show, slot]);

  const calculatePrice = async () => {
    if (!slot) return;
    setError(null);
    try {
      const result = await calculatePriceMutation.mutateAsync({
        facilityId,
        courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      setPrice(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Wystąpił błąd podczas obliczania kwoty.');
    }
  };

  const handleReserve = async () => {
    if (!slot) return;
    setError(null);

    try {
      const reservationId = await createReservationMutation.mutateAsync({
        courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        payOnSite,
      });

      if (payOnSite) {
        // Just reserve — admin will mark as paid on site later
        onHide();
      } else {
        // Pay online via Stripe
        const stripeResponse = await createCheckoutSessionMutation.mutateAsync({
          reservationId,
          successUrl: `${window.location.origin}/sukces?reservationId=${reservationId}`,
          cancelUrl: `${window.location.origin}/anulowano?reservationId=${reservationId}`,
        });

        window.location.href = stripeResponse.url;
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Wystąpił nieoczekiwany błąd podczas rezerwacji.');
    }
  };

  const isProcessing = calculatePriceMutation.isPending || createReservationMutation.isPending || createCheckoutSessionMutation.isPending;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Potwierdzenie Rezerwacji</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {slot && (
          <div className="mb-3">
            <p className="mb-1"><strong>Początek:</strong> {dayjs.utc(slot.startTime).local().format('DD.MM.YYYY HH:mm')}</p>
            <p className="mb-1"><strong>Koniec:</strong> {dayjs.utc(slot.endTime).local().format('DD.MM.YYYY HH:mm')}</p>
          </div>
        )}

        {calculatePriceMutation.isPending ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" /> Obliczanie ceny...
          </div>
        ) : price !== null ? (
          <div className="alert alert-success mt-2">
            <strong>Do zapłaty:</strong> {price.toFixed(2)} PLN
          </div>
        ) : null}

        {error && <Alert variant="danger">{error}</Alert>}

        <div className="mt-3 mb-2">
          <Form.Check
            type="switch"
            id="pay-on-site-switch"
            label="Zapłacę na miejscu (przy odbiorze)"
            checked={payOnSite}
            onChange={(e) => setPayOnSite(e.target.checked)}
            disabled={isProcessing}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isProcessing}>
          Anuluj
        </Button>
        <Button variant="primary" onClick={handleReserve} disabled={isProcessing || price === null}>
          {isProcessing ? <Spinner as="span" animation="border" size="sm" /> : payOnSite ? 'Zarezerwuj' : 'Przejdź do płatności'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
