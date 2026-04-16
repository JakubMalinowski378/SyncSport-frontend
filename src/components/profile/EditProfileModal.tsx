import { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../services/apiClient';

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
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setEditFirstName(currentFirstName);
      setEditLastName(currentLastName);
      setEditError(null);
    }
  }, [show, currentFirstName, currentLastName]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditError(null);
    try {
      await apiClient.put('/api/users/me', {
        firstName: editFirstName,
        lastName: editLastName,
      });
      onSuccess();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-card border-secondary">
        <Modal.Title>Edit Profile</Modal.Title>
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
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="editProfileForm" disabled={saving}>
          {saving ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
