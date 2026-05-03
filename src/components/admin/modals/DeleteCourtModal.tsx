import { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { useDeleteCourt } from '../../../hooks/useFacilityQueries';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
}

interface DeleteCourtModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facilitySlug: string;
  court: Court | null;
}

export default function DeleteCourtModal({ show, onHide, onSuccess, facilitySlug, court }: DeleteCourtModalProps) {
  const deleteCourtMutation = useDeleteCourt();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!court || !facilitySlug) return;

    setError(null);

    try {
      await deleteCourtMutation.mutateAsync({ facilitySlug, courtId: court.id });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się usunąć kortu');
    }
  };

  const handleExited = () => {
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Modal.Header closeButton className="bg-card border-secondary text-danger">
        <Modal.Title>Delete Court</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-card text-body">
        {error && <Alert variant="danger">{error}</Alert>}

        <p>
          Are you sure you want to delete the court <strong>{court?.name}</strong>?
        </p>
        <p className="text-danger small mb-0">
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-card border-secondary">
        <Button variant="secondary" onClick={onHide} disabled={deleteCourtMutation.isPending}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDelete} disabled={deleteCourtMutation.isPending}>
          {deleteCourtMutation.isPending ? <Spinner size="sm" /> : 'Usuń kort'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}