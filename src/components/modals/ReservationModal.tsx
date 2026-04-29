import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import dayjs from 'dayjs';
import apiClient from '../../services/apiClient';

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
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingReserve, setLoadingReserve] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (show && slot) {
      calculatePrice();
    } else {
      setPrice(null);
      setError(null);
    }
  }, [show, slot]);

  const calculatePrice = async () => {
    if (!slot) return;
    setLoadingPrice(true);
    setError(null);
    try {
      const response = await apiClient.post('/api/tariffs/calculate', {
        facilityId,
        courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      setPrice(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Wystąpił błąd podczas obliczania kwoty.');
    } finally {
      setLoadingPrice(false);
    }
  };

  const handleReserve = async () => {
    if (!slot) return;
    setLoadingReserve(true);
    setError(null);
    
    try {
      // Create the reservation
      const response = await apiClient.post('/api/reservations/me', {
        courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      
      const reservationId = response.data;
      
      // Temporary mock for payment redirect since it's not defined in Swagger yet
      // You can replace this later with the actual payment endpoint if needed.
      alert(`Rezerwacja ${reservationId} utworzona! Przekierowanie do płatności...`);
      window.location.href = `/platnosc?reservationId=${reservationId}&price=${price || 0}`;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Wystąpił nieoczekiwany błąd podczas rezerwacji.');
    } finally {
      setLoadingReserve(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Potwierdzenie Rezerwacji</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {slot && (
          <div className="mb-3">
            <p className="mb-1"><strong>Początek:</strong> {dayjs(slot.startTime).format('DD.MM.YYYY HH:mm')}</p>
            <p className="mb-1"><strong>Koniec:</strong> {dayjs(slot.endTime).format('DD.MM.YYYY HH:mm')}</p>
          </div>
        )}

        {loadingPrice ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" /> Obliczanie ceny...
          </div>
        ) : price !== null ? (
          <div className="alert alert-success mt-2">
            <strong>Do zapłaty:</strong> {price.toFixed(2)} PLN
          </div>
        ) : null}

        {error && <Alert variant="danger">{error}</Alert>}
        
        <p className="mt-3 mb-0">Czy chcesz przejść do płatności za ten termin?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loadingReserve}>
          Anuluj
        </Button>
        <Button variant="primary" onClick={handleReserve} disabled={loadingReserve || loadingPrice || price === null}>
          {loadingReserve ? <Spinner as="span" animation="border" size="sm" /> : 'Przejdź do płatności'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
