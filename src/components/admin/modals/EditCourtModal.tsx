import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
  overrideReservationDuration?: number | null;
}

interface EditCourtModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facilityId: string;
  court: Court | null;
}

export default function EditCourtModal({ show, onHide, onSuccess, facilityId, court }: EditCourtModalProps) {
  const [name, setName] = useState('');
  const [surfaceType, setSurfaceType] = useState('');
  const [overrideReservationDuration, setOverrideReservationDuration] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (court && show) {
      setName(court.name || '');
      setSurfaceType(court.surfaceType || '');
      setOverrideReservationDuration(court.overrideReservationDuration ?? '');
      setIsActive(court.isActive);
      setError(null);
    }
  }, [court, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!court || !facilityId) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('surfaceType', surfaceType);
      
      if (overrideReservationDuration !== '') {
        formData.append('overrideReservationDuration', String(overrideReservationDuration));
      }
      
      formData.append('isActive', String(isActive));
      
      images.forEach(img => formData.append('images', img));

      await apiClient.put(`/api/facilities/${facilityId}/courts/${court.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się zaktualizować kortu');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setSurfaceType('');
    setOverrideReservationDuration('');
    setIsActive(true);
    setImages([]);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Edytuj kort</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-card text-body border-secondary"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Surface Type</Form.Label>
            <Form.Control
              type="text"
              required
              value={surfaceType}
              onChange={e => setSurfaceType(e.target.value)}
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Override Reservation Duration (minutes)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={overrideReservationDuration}
              onChange={e => setOverrideReservationDuration(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Leave empty to use facility's duration"
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Court Images</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="bg-card text-body border-secondary"
            />
            {images.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="position-relative border border-secondary rounded p-1" style={{ width: '80px', height: '80px' }}>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`preview-${idx}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 p-0"
                      style={{ width: '20px', height: '20px', transform: 'translate(30%, -30%)' }}
                      title="Remove image"
                      onClick={() => removeImage(idx)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              label="Is Active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}