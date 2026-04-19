import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';

interface CreateCourtModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facilityId: string;
}

export default function CreateCourtModal({ show, onHide, onSuccess, facilityId }: CreateCourtModalProps) {
  const [name, setName] = useState('');
  const [surfaceType, setSurfaceType] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post(`/api/facilities/${facilityId}/courts`, {
        facilityId,
        name,
        surfaceType
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create court');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setSurfaceType('');
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Add New Court</Modal.Title>
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
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Add Court'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}