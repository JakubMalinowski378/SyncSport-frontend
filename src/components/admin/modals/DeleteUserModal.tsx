import { useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import type { User } from '../UserManagement';

interface DeleteUserModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function DeleteUserModal({ show, onHide, onSuccess, user }: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/users/${user.id}`);
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-card border-secondary">
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card">
        {error && <Alert variant="danger">{error}</Alert>}
        Are you sure you want to delete user <strong>{user?.email}</strong>? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={handleDelete} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Delete User'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
