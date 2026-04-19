import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
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
  const [isActive, setIsActive] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (court && show) {
      setName(court.name || '');
      setSurfaceType(court.surfaceType || '');
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
      await apiClient.put(`/api/facilities/${facilityId}/courts/${court.id}`, {
        name,
        surfaceType,
        isActive
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update court');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setSurfaceType('');
    setIsActive(true);
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Edit Court</Modal.Title>
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