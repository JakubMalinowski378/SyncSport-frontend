import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import { BsTrash } from 'react-icons/bs';
import apiClient from '../../../services/apiClient';

interface Facility {
  id: string;
  name: string | null;
  address: string | null;
}

interface EditFacilityModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facility: Facility | null;
}

interface OpeningHour {
  dayName: string;
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
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function EditFacilityModal({ show, onHide, onSuccess, facility }: EditFacilityModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    DAYS_OF_WEEK.map(dayName => ({
      dayName,
      openTime: '08:00',
      closeTime: '22:00',
      isClosed: false
    }))
  );

  const [customDateHours, setCustomDateHours] = useState<CustomDateHour[]>([]);
  
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilityDetails = async (id: string) => {
    setInitialLoading(true);
    try {
      const res = await apiClient.get(`/api/facilities/${id}`);
      const data = res.data;
      setName(data.name || '');
      setAddress(data.address || '');
      
      if (data.openingHours && data.openingHours.length > 0) {
        setOpeningHours(DAYS_OF_WEEK.map(day => {
          const loaded = data.openingHours.find((h: any) => h.dayName === day);
          if (loaded) {
            return {
              dayName: day,
              openTime: loaded.openTime.substring(0, 5),
              closeTime: loaded.closeTime.substring(0, 5),
              isClosed: loaded.isClosed
            };
          }
          return { dayName: day, openTime: '08:00', closeTime: '22:00', isClosed: false };
        }));
      }
      
      if (data.customDateHours) {
        setCustomDateHours(data.customDateHours.map((c: any) => ({
          date: c.date.substring(0, 10),
          openTime: c.openTime.substring(0, 5),
          closeTime: c.closeTime.substring(0, 5),
          isClosed: c.isClosed
        })));
      } else {
        setCustomDateHours([]);
      }
    } catch (err: any) {
      setError('Failed to fetch facility details');
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (facility && show) {
      fetchFacilityDetails(facility.id);
      setError(null);
    }
  }, [facility, show]);

  const handleOpeningHourChange = (index: number, field: keyof OpeningHour, value: any) => {
    const newHours = [...openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOpeningHours(newHours);
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
    if (!facility) return;

    setLoading(true);
    setError(null);
    try {
      await apiClient.put(`/api/facilities/${facility.id}`, {
        id: facility.id,
        name,
        address,
        openingHours: openingHours.map(w => ({
          dayName: w.dayName,
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
      setError(err.response?.data?.detail || 'Failed to update facility');
    } finally {
      setLoading(false);
    }
  };

  const handleExited = () => {
    setName('');
    setAddress('');
    setOpeningHours(DAYS_OF_WEEK.map(dayName => ({
      dayName,
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
          <Modal.Title>Edit Facility</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {error && <Alert variant="danger">{error}</Alert>}
          
          {initialLoading ? (
            <div className="text-center py-4"><Spinner animation="border" /></div>
          ) : (
            <>
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

              <Card className="bg-card border-secondary text-body mb-3 mt-3">
                <Card.Header className="bg-card border-secondary fw-bold text-body">Opening Hours</Card.Header>
                <Card.Body>
                  {openingHours.map((h, index) => (
                    <Row key={h.dayName} className="mb-2 align-items-center">
                      <Col xs={4} md={3} className="fw-semibold">
                        {h.dayName}
                      </Col>
                      <Col xs={4} md={3}>
                        <Form.Control
                          type="time"
                          value={h.openTime}
                          onChange={e => handleOpeningHourChange(index, 'openTime', e.target.value)}
                          disabled={h.isClosed}
                          className="bg-card text-body border-secondary"
                        />
                      </Col>
                      <Col xs={4} md={3}>
                        <Form.Control
                          type="time"
                          value={h.closeTime}
                          onChange={e => handleOpeningHourChange(index, 'closeTime', e.target.value)}
                          disabled={h.isClosed}
                          className="bg-card text-body border-secondary"
                        />
                      </Col>
                      <Col xs={12} md={3} className="mt-2 mt-md-0 d-flex align-items-center">
                        <Form.Check
                          type="switch"
                          label="Closed"
                          checked={h.isClosed}
                          onChange={e => handleOpeningHourChange(index, 'isClosed', e.target.checked)}
                        />
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>

              <Card className="bg-card border-secondary text-body mb-3">
                <Card.Header className="bg-card border-secondary d-flex justify-content-between align-items-center text-body">
                  <span className="fw-bold">Custom Date Hours</span>
                  <Button variant="outline-success" size="sm" onClick={addCustomDate}>
                    + Add Date
                  </Button>
                </Card.Header>
                <Card.Body>
                  {customDateHours.length === 0 ? (
                    <div className="text-secondary small">No custom dates configured.</div>
                  ) : (
                    customDateHours.map((c, index) => (
                      <Row key={index} className="mb-2 align-items-center">
                        <Col xs={12} md={3} className="mb-2 mb-md-0">
                          <Form.Control
                            type="date"
                            required
                            value={c.date}
                            onChange={e => handleCustomDateChange(index, 'date', e.target.value)}
                            className="bg-card text-body border-secondary"
                          />
                        </Col>
                        <Col xs={4} md={3}>
                          <Form.Control
                            type="time"
                            value={c.openTime}
                            onChange={e => handleCustomDateChange(index, 'openTime', e.target.value)}
                            disabled={c.isClosed}
                            className="bg-card text-body border-secondary"
                          />
                        </Col>
                        <Col xs={4} md={3}>
                          <Form.Control
                            type="time"
                            value={c.closeTime}
                            onChange={e => handleCustomDateChange(index, 'closeTime', e.target.value)}
                            disabled={c.isClosed}
                            className="bg-card text-body border-secondary"
                          />
                        </Col>
                        <Col xs={4} md={3} className="d-flex align-items-center justify-content-between">
                          <Form.Check
                            type="switch"
                            label="Closed"
                            checked={c.isClosed}
                            onChange={e => handleCustomDateChange(index, 'isClosed', e.target.checked)}
                          />
                          <Button variant="outline-danger" size="sm" onClick={() => removeCustomDate(index)}>
                            <BsTrash />
                          </Button>
                        </Col>
                      </Row>
                    ))
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || initialLoading}>
            {loading ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}