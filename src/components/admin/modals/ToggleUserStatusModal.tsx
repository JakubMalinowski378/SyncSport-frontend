import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import type { User } from '../UserManagement';

interface ToggleUserStatusModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function ToggleUserStatusModal({ show, onHide, onSuccess, user }: ToggleUserStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setError(null);
    }
  }, [show]);

  const handleToggleStatus = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.patch(`/api/users/${user.id}/status`, {
        isActive: !user.isActive
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-card border-secondary">
        <Modal.Title>Confirm Status Change</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card">
        {error && <Alert variant="danger">{error}</Alert>}
        Are you sure you want to {user?.isActive ? 'disable' : 'enable'} <strong>{user?.email}</strong>?
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
        <Button 
          variant={user?.isActive ? "warning" : "success"} 
          onClick={handleToggleStatus}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" animation="border" /> : (user?.isActive ? 'Disable User' : 'Enable User')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
