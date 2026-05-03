import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useUpdateProfile } from '../../hooks/useUserQueries';

interface EditProfileModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  currentFirstName: string;
  currentLastName: string;
}

export default function EditProfileModal({
  show,
  onHide,
  onSuccess,
  currentFirstName,
  currentLastName,
}: EditProfileModalProps) {
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (show) {
      setEditFirstName(currentFirstName);
      setEditLastName(currentLastName);
      setEditError(null);
    }
  }, [show, currentFirstName, currentLastName]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    try {
      await updateProfileMutation.mutateAsync({
        firstName: editFirstName,
        lastName: editLastName,
      });
      onSuccess();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Nie udało się zaktualizować profilu.');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-card border-secondary">
        <Modal.Title>Edytuj profil</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card">
        {editError && <Alert variant="danger">{editError}</Alert>}
        <Form onSubmit={handleEditSubmit} id="editProfileForm">
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              required
              className="bg-card text-body"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              required
              className="bg-card text-body"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide} disabled={updateProfileMutation.isPending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="editProfileForm" disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
