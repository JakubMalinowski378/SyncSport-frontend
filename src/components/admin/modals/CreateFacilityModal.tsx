import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';

interface CreateFacilityModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
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
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export default function CreateFacilityModal({ show, onHide, onSuccess }: CreateFacilityModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHour[]>(
    DAYS_OF_WEEK.map(d => ({
      dayOfWeek: d.value,
      openTime: '08:00',
      closeTime: '22:00',
      isClosed: false
    }))
  );

  const [customDateHours, setCustomDateHours] = useState<CustomDateHour[]>([]);
  
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
      await apiClient.post('/api/facilities', {
        name,
        address,
        weeklyHours: weeklyHours.map(w => ({
          dayOfWeek: w.dayOfWeek,
          openTime: formatTime(w.openTime),
          closeTime: formatTime(w.closeTime),
          isClosed: w.isClosed
        })),
        customDateHours: customDateHours.map(c => ({
          date: c.date,
          openTime: formatTime(c.openTime),
          closeTime: formatTime(c.closeTime),
          isClosed: c.isClosed
        }))
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setAddress('');
    setWeeklyHours(DAYS_OF_WEEK.map(d => ({
      dayOfWeek: d.value,
      openTime: '08:00',
      closeTime: '22:00',
      isClosed: false
    })));
    setCustomDateHours([]);
    setError(null);
  };

  return (
    <Modal show={show} onHide={onHide} onExited={handleExited} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Create New Facility</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name</Form.Label>
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
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="bg-card text-body border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>

          <Card className="mb-3 bg-card border-secondary">
            <Card.Header className="border-secondary fw-bold">Weekly Hours</Card.Header>
            <Card.Body>
              {weeklyHours.map((wh, idx) => (
                <Row key={wh.dayOfWeek} className="align-items-center mb-2">
                  <Col xs={4} md={3} className="fw-semibold">
                    {DAYS_OF_WEEK.find(d => d.value === wh.dayOfWeek)?.label}
                  </Col>
                  <Col xs={4} md={3}>
                    <Form.Check 
                      type="switch"
                      label="Closed"
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
              Custom Date Overrides
              <Button variant="outline-primary" size="sm" onClick={addCustomDate}>+ Add Date</Button>
            </Card.Header>
            <Card.Body>
              {customDateHours.length === 0 ? (
                <p className="text-secondary small mb-0">No overrides added.</p>
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
                        ??
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
            {loading ? <Spinner animation="border" size="sm" /> : 'Create'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
