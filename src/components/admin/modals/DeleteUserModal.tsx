import { useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { useDeleteUser } from '../../../hooks/useUserQueries';
import type { User } from '../UserManagement';

interface DeleteUserModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  user: User | null;
}

export default function DeleteUserModal({ show, onHide, onSuccess, user }: DeleteUserModalProps) {
  const deleteUserMutation = useDeleteUser();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;
    setError(null);
    try {
      await deleteUserMutation.mutateAsync(user.id);
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się usunąć użytkownika');
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
        <Button variant="secondary" onClick={onHide} disabled={deleteUserMutation.isPending}>Cancel</Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleteUserMutation.isPending}>
          {deleteUserMutation.isPending ? <Spinner size="sm" animation="border" /> : 'Delete User'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
