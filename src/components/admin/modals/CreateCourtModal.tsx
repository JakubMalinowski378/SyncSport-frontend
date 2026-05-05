import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import ImageUploadReorder from '../../shared/ImageUploadReorder';

interface CreateCourtModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facilityId: string;
}

export default function CreateCourtModal({ show, onHide, onSuccess, facilityId }: CreateCourtModalProps) {
  const [name, setName] = useState('');
  const [surfaceType, setSurfaceType] = useState('');
  const [overrideReservationDuration, setOverrideReservationDuration] = useState<number | ''>('');
  const [images, setImages] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('facilityId', facilityId);
      formData.append('name', name);
      formData.append('surfaceType', surfaceType);

      if (overrideReservationDuration !== '') {
        formData.append('overrideReservationDuration', String(overrideReservationDuration));
      }

      images.forEach(img => formData.append('images', img));

      await apiClient.post(`/api/facilities/${facilityId}/courts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się utworzyć kortu');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setSurfaceType('');
    setOverrideReservationDuration('');
    setImages([]);
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Dodaj nowy kort</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Nazwa</Form.Label>
            <Form.Control
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Typ nawierzchni</Form.Label>
            <Form.Control
              type="text"
              required
              value={surfaceType}
              onChange={e => setSurfaceType(e.target.value)}
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Zmiana czasu rezerwacji (minuty)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={overrideReservationDuration}
              onChange={e => setOverrideReservationDuration(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Pozostaw puste, aby użyć czasu obiektu"
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <ImageUploadReorder
            label="Zdjęcia kortu"
            images={images}
            onChange={setImages}
          />
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Anuluj
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Dodaj kort'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}