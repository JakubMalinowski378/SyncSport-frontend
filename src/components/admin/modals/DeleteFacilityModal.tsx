import { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';

interface Facility {
  id: string;
  name: string | null;
  address: string | null;
}

interface DeleteFacilityModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facility: Facility | null;
}

export default function DeleteFacilityModal({ show, onHide, onSuccess, facility }: DeleteFacilityModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!facility) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiClient.delete(`/api/facilities/${facility.id}`);
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete facility');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Modal.Header closeButton className="bg-card border-secondary text-danger">
        <Modal.Title>Delete Facility</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card text-body">
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p>
          Are you sure you want to delete the facility <strong>{facility?.name}</strong>?
        </p>
        <p className="text-danger small mb-0">
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Delete Facility'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}