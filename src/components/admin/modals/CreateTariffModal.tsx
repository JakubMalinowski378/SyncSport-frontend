import { useEffect, useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import apiClient from '../../../services/apiClient';

interface CourtOverride {
  courtId: string;
  hourlyRate: string;
}

interface CreateTariffModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  facilityId: string;
}

export default function CreateTariffModal({ show, onHide, onSuccess, facilityId }: CreateTariffModalProps) {
  const [baseHourlyRate, setBaseHourlyRate] = useState('');
  const [courtOverrides, setCourtOverrides] = useState<CourtOverride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOverride = () => {
    setCourtOverrides(prev => [...prev, { courtId: '', hourlyRate: '' }]);
  };

  const updateOverride = (index: number, field: keyof CourtOverride, value: string) => {
    setCourtOverrides(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const removeOverride = (index: number) => {
    setCourtOverrides(prev => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const parsedBaseHourlyRate = Number(baseHourlyRate);
    const invalidOverride = courtOverrides.find(override => !override.courtId.trim() || override.hourlyRate === '');

    if (!facilityId || Number.isNaN(parsedBaseHourlyRate)) {
      setError('Bazowa stawka godzinowa jest wymagana.');
      setLoading(false);
      return;
    }

    if (invalidOverride) {
      setError('Każde nadpisanie kortu musi zawierać ID kortu i stawkę godzinową.');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post('/api/tariffs', {
        facilityId,
        baseHourlyRate: parsedBaseHourlyRate,
        courtOverrides: courtOverrides.map(override => ({
          courtId: override.courtId,
          hourlyRate: Number(override.hourlyRate)
        }))
      });
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się zapisać taryfy');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) {
      return;
    }

    setBaseHourlyRate('');
    setCourtOverrides([]);
    setError(null);
  }, [show, facilityId]);

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-card border-secondary">
          <Modal.Title>Ustaw stawki dla obiektu</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-card text-body">
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Bazowa stawka godzinowa</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              required
              value={baseHourlyRate}
              onChange={e => setBaseHourlyRate(e.target.value)}
              placeholder="0.00"
              className="bg-card text-body border-secondary"
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <Form.Label className="mb-0">Nadpisania kortów</Form.Label>
            <Button variant="outline-primary" size="sm" type="button" onClick={addOverride}>
              + Dodaj nadpisanie
            </Button>
          </div>

          {courtOverrides.length === 0 ? (
            <p className="text-secondary small mb-3">Brak nadpisań kortów.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {courtOverrides.map((override, index) => (
                <Row key={index} className="g-2 align-items-end">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>ID kortu</Form.Label>
                      <Form.Control
                        type="text"
                        required
                        value={override.courtId}
                        onChange={e => updateOverride(index, 'courtId', e.target.value)}
                        className="bg-card text-body border-secondary"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Stawka godzinowa</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={override.hourlyRate}
                        onChange={e => updateOverride(index, 'hourlyRate', e.target.value)}
                        className="bg-card text-body border-secondary"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button variant="outline-danger" type="button" onClick={() => removeOverride(index)}>
                      Usuń
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-card border-secondary">
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Anuluj
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Zapisz stawki'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
