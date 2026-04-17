import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import type { User } from '../UserManagement';

interface ManagedFacilitiesModalProps {
  show: boolean;
  onHide: () => void;
  user: User | null;
}

export default function ManagedFacilitiesModal({ show, onHide, user }: ManagedFacilitiesModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<string[]>([]);

  useEffect(() => {
    if (show && user) {
      fetchFacilities();
    }
  }, [show, user]);

  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/api/users/${user?.id}`);
      const ids = res.data.managedFacilityIds || [];
      setFacilities(ids);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-card border-secondary">
        <Modal.Title>Managed Facilities</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card text-body">
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : facilities.length === 0 ? (
          <p className="text-secondary text-center mb-0">No managed facilities found.</p>
        ) : (
          <ListGroup>
            {facilities.map((id, idx) => (
              <ListGroup.Item key={idx} className="bg-card text-body border-secondary">
                {id}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
