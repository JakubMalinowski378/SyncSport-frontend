import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs';
import apiClient from '../../../services/apiClient';
import ImageUploadReorder from '../../shared/ImageUploadReorder';

interface CreateFacilityModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: (facilityId: string) => void;
}

interface WeeklyHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface CustomDateHour {
  date: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

export default function CreateFacilityModal({ show, onHide, onSuccess }: CreateFacilityModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [reservationDuration, setReservationDuration] = useState<number>(60);
  
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHour[]>(
    DAYS_OF_WEEK.map(d => ({
      dayOfWeek: d.value,
      openTime: '06:00',
      closeTime: '23:00',
      isClosed: false
    }))
  );

  const [customDateHours, setCustomDateHours] = useState<CustomDateHour[]>([]);
  const [images, setImages] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWeeklyHourChange = (index: number, field: keyof WeeklyHour, value: any) => {
    const newHours = [...weeklyHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setWeeklyHours(newHours);
  };

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
        dayOfWeek: w.dayOfWeek,
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
    setWeeklyHours(DAYS_OF_WEEK.map(d => ({
      dayOfWeek: d.value,
      openTime: '08:00',
      closeTime: '22:00',
      isClosed: false
    })));
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

          <Card className="mb-3 bg-card border-secondary">
            <Card.Header className="border-secondary fw-bold">Godziny tygodniowe</Card.Header>
            <Card.Body>
              {weeklyHours.map((wh, idx) => (
                <Row key={wh.dayOfWeek} className="align-items-center mb-2">
                  <Col xs={4} md={3} className="fw-semibold">
                    {DAYS_OF_WEEK.find(d => d.value === wh.dayOfWeek)?.label}
                  </Col>
                  <Col xs={4} md={3}>
                    <Form.Check 
                      type="switch"
                      label="Zamknięte"
                      checked={wh.isClosed}
                      onChange={e => handleWeeklyHourChange(idx, 'isClosed', e.target.checked)}
                    />
                  </Col>
                  <Col xs={6} md={3} className="mt-2 mt-md-0">
                    <Form.Control
                      type="time"
                      value={wh.openTime}
                      disabled={wh.isClosed}
                      onChange={e => handleWeeklyHourChange(idx, 'openTime', e.target.value)}
                      className="bg-card text-body border-secondary"
                    />
                  </Col>
                  <Col xs={6} md={3} className="mt-2 mt-md-0">
                    <Form.Control
                      type="time"
                      value={wh.closeTime}
                      disabled={wh.isClosed}
                      onChange={e => handleWeeklyHourChange(idx, 'closeTime', e.target.value)}
                      className="bg-card text-body border-secondary"
                    />
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>

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
