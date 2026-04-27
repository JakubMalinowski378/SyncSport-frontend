import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs';
import apiClient from '../../../services/apiClient';
import ImageUploadReorder from '../../shared/ImageUploadReorder';
import FacilityOpeningHoursEditor, {
  createDefaultOpeningHours
} from '../FacilityOpeningHoursEditor';
import type { OpeningHour } from '../FacilityOpeningHoursEditor';

interface CreateFacilityModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (facilityId: string) => void;
}

interface CustomDateHour {
  date: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export default function CreateFacilityModal({ show, onHide, onSuccess }: CreateFacilityModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [reservationDuration, setReservationDuration] = useState<number>(60);
  
  const [weeklyHours, setWeeklyHours] = useState<OpeningHour[]>(
    createDefaultOpeningHours('06:00', '23:00')
  );

  const [customDateHours, setCustomDateHours] = useState<CustomDateHour[]>([]);
  const [images, setImages] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCustomDate = () => {
    setCustomDateHours([
      ...customDateHours,
      { date: '', openTime: '08:00', closeTime: '22:00', isClosed: false }
    ]);
  };

  const handleCustomDateChange = (index: number, field: keyof CustomDateHour, value: any) => {
    const newDates = [...customDateHours];
    newDates[index] = { ...newDates[index], [field]: value };
    setCustomDateHours(newDates);
  };

  const removeCustomDate = (index: number) => {
    setCustomDateHours(customDateHours.filter((_, i) => i !== index));
  };

  const formatTime = (time: string) => time.length === 5 ? `${time}:00` : time;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('address', address);
      formData.append('reservationDuration', String(reservationDuration));
      formData.append('weeklyHours', JSON.stringify(weeklyHours.map(w => ({
        dayName: w.dayName,
        openTime: formatTime(w.openTime),
        closeTime: formatTime(w.closeTime),
        isClosed: w.isClosed
      }))));
      formData.append('customDateHours', JSON.stringify(customDateHours.map(c => ({
        date: c.date,
        openTime: formatTime(c.openTime),
        closeTime: formatTime(c.closeTime),
        isClosed: c.isClosed
      }))));
      
      images.forEach(img => {
        formData.append('images', img);
      });

      const res = await apiClient.post<string>('/api/facilities', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      onSuccess(res.data);
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się utworzyć obiektu');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setAddress('');
    setReservationDuration(60);
    setWeeklyHours(createDefaultOpeningHours('08:00', '22:00'));
    setCustomDateHours([]);
    setImages([]);
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Utwórz nowy obiekt</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Nazwa</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="bg-card text-body border-secondary"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Adres</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="bg-card text-body border-secondary"
                />
              </Form.Group>
            </Col>
            <Col md={12} className="mt-3">
              <Form.Group>
                <Form.Label>Czas rezerwacji (minuty)</Form.Label>
                <Form.Control
                  type="number"
                  required
                  min="1"
                  value={reservationDuration}
                  onChange={e => setReservationDuration(parseInt(e.target.value) || 60)}
                  className="bg-card text-body border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>

          <ImageUploadReorder
            label="Zdjęcia obiektu"
            images={images}
            onChange={setImages}
          />

          <FacilityOpeningHoursEditor
            openingHours={weeklyHours}
            onChange={setWeeklyHours}
            title="Godziny tygodniowe"
          />

          <Card className="bg-card border-secondary">
            <Card.Header className="d-flex justify-content-between align-items-center border-secondary fw-bold">
              Przesunięcia dat niestandardowych
              <Button variant="outline-primary" size="sm" onClick={addCustomDate}>+ Dodaj datę</Button>
            </Card.Header>
            <Card.Body>
              {customDateHours.length === 0 ? (
                <p className="text-secondary small mb-0">Brak przesunięć.</p>
              ) : (
                customDateHours.map((cd, idx) => (
                  <Row key={idx} className="align-items-center mb-3">
                    <Col md={3}>
                      <Form.Control
                        type="date"
                        required
                        value={cd.date}
                        onChange={e => handleCustomDateChange(idx, 'date', e.target.value)}
                        className="bg-card text-body border-secondary"
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Check 
                        type="switch"
                        label="Closed"
                        checked={cd.isClosed}
                        onChange={e => handleCustomDateChange(idx, 'isClosed', e.target.checked)}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="time"
                        value={cd.openTime}
                        disabled={cd.isClosed}
                        onChange={e => handleCustomDateChange(idx, 'openTime', e.target.value)}
                        className="bg-card text-body border-secondary"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="time"
                        value={cd.closeTime}
                        disabled={cd.isClosed}
                        onChange={e => handleCustomDateChange(idx, 'closeTime', e.target.value)}
                        className="bg-card text-body border-secondary"
                      />
                    </Col>
                    <Col md={1} className="text-end">
                      <Button variant="outline-danger" size="sm" onClick={() => removeCustomDate(idx)} title="Remove date">
                        <BsTrash />
                      </Button>
                    </Col>
                  </Row>
                ))
              )}
            </Card.Body>
          </Card>

        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Utwórz'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
