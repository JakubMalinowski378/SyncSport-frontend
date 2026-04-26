import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';
import ImageUploadReorder from '../../shared/ImageUploadReorder';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
  overrideReservationDuration?: number | null;
  images?: unknown[] | null;
}

interface EditCourtModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facilitySlug: string;
  court: Court | null;
}

export default function EditCourtModal({ show, onHide, onSuccess, facilitySlug, court }: EditCourtModalProps) {
  const [name, setName] = useState('');
  const [surfaceType, setSurfaceType] = useState('');
  const [overrideReservationDuration, setOverrideReservationDuration] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractImageUrls = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map(item => {
        if (typeof item === 'string') {
          return item;
        }

        if (item && typeof item === 'object') {
          const image = item as Record<string, unknown>;
          const candidate = image.url ?? image.imageUrl ?? image.src ?? image.path;
          return typeof candidate === 'string' ? candidate : null;
        }

        return null;
      })
      .filter((item): item is string => Boolean(item));
  };

  const urlToFile = async (imageUrl: string, index: number): Promise<File> => {
    const response = await apiClient.get<Blob>(imageUrl, { responseType: 'blob' });
    const blob = response.data;
    const mimeType = blob.type || response.headers['content-type'] || 'image/jpeg';
    const extension = mimeType.includes('png') ? 'png' : mimeType.includes('webp') ? 'webp' : 'jpg';

    return new File([blob], `existing-court-${index}.${extension}`, { type: mimeType });
  };

  useEffect(() => {
    if (court && show) {
      setName(court.name || '');
      setSurfaceType(court.surfaceType || '');
      setOverrideReservationDuration(court.overrideReservationDuration ?? '');
      setIsActive(court.isActive);
      setExistingImageUrls(extractImageUrls(court.images));
      setError(null);
    }
  }, [court, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!court || !facilitySlug) return;

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('surfaceType', surfaceType);
      
      if (overrideReservationDuration !== '') {
        formData.append('overrideReservationDuration', String(overrideReservationDuration));
      }
      
      formData.append('isActive', String(isActive));
      
      const existingImagesAsFiles = await Promise.all(
        existingImageUrls.map((imageUrl, index) => urlToFile(imageUrl, index))
      );

      [...existingImagesAsFiles, ...images].forEach(img => formData.append('images', img));

      await apiClient.put(`/api/facilities/${facilitySlug}/courts/${court.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się zaktualizować kortu');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setSurfaceType('');
    setOverrideReservationDuration('');
    setIsActive(true);
    setImages([]);
    setExistingImageUrls([]);
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Edytuj kort</Modal.Title>
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

          <Form.Group className="mb-3">
            <Form.Label>Override Reservation Duration (minutes)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={overrideReservationDuration}
              onChange={e => setOverrideReservationDuration(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="Leave empty to use facility's duration"
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <ImageUploadReorder
            label="Court Images"
            images={images}
            onChange={setImages}
            existingImageUrls={existingImageUrls}
            onExistingImageUrlsChange={setExistingImageUrls}
            existingLabel="Current images"
            removeTitle="Remove image"
          />

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              label="Is Active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}