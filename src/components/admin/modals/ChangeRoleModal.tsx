import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import type { User } from '../UserManagement';

interface ChangeRoleModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function ChangeRoleModal({ show, onHide, onSuccess, user }: ChangeRoleModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<number>(1);

  useEffect(() => {
    if (show && user) {
      const currentRoleIndex = user.role?.toLowerCase() === 'admin' ? 3 : user.role?.toLowerCase() === 'manager' ? 2 : 1;
      setNewRole(currentRoleIndex);
      setError(null);
    }
  }, [show, user]);

  const handleRoleChange = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await apiClient.patch(`/api/users/${user.id}/role`, { role: newRole });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-card border-secondary">
        <Modal.Title>Change Role</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card">
        {error && <Alert variant="danger">{error}</Alert>}
        <p>Update role for <strong>{user?.email}</strong>:</p>
        <Form.Select 
          className="bg-card text-body" 
          value={newRole} 
          onChange={e => setNewRole(parseInt(e.target.value))}
          disabled={loading}
        >
          <option value={1}>User</option>
          <option value={2}>Manager</option>
          <option value={3}>Admin</option>
        </Form.Select>
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide} disabled={loading}>Cancel</Button>
        <Button variant="primary" onClick={handleRoleChange} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Save Role'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
