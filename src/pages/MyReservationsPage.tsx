import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Spinner, Alert, Table, Badge, Form, Row, Col, InputGroup } from 'react-bootstrap';
import {
  BsCalendarCheck,
  BsClock,
  BsArrowRight,
  BsXCircle,
  BsCheckCircle,
  BsHourglassSplit,
  BsSearch,
  BsSortDown,
  BsSortUp,
  BsFunnel,
  BsCreditCard,
  BsCashCoin,
} from 'react-icons/bs';
import dayjs from 'dayjs';
import { useMyReservations } from '../hooks/useReservationQueries';
import { useCreateCheckoutSession, useMarkPaidOnSite } from '../hooks/useReservationQueries';
import type { ReservationStatus } from '../services/reservationService';

type SortField = 'date' | 'status' | 'price';
type SortDir = 'asc' | 'desc';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  0: 'Oczekująca',
  1: 'Potwierdzona',
  2: 'Anulowana',
  3: 'Zakończona',
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
  3: 'secondary',
};

const STATUS_ICON: Record<ReservationStatus, React.ReactNode> = {
  0: <BsHourglassSplit />,
  1: <BsCheckCircle />,
  2: <BsXCircle />,
  3: <BsCalendarCheck />,
};

const ALL_STATUSES: ReservationStatus[] = [0, 1, 2, 3];

export default function MyReservationsPage() {
  const [page, setPage] = useState(1);

  const [filterStatus, setFilterStatus] = useState<ReservationStatus | null>(null);
  const [searchText, setSearchText] = useState('');

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [, setPayError] = useState<string | null>(null);

  const queryParams: Record<string, string | number> = {
    PageNumber: page,
    PageSize: 10,
    SortColumn: sortField,
    SortOrder: sortDir,
  };

  if (searchText.trim()) {
    queryParams.SearchTerm = searchText.trim();
  }

  const { data, isLoading: loading, error: fetchError } = useMyReservations(queryParams);
  const createCheckoutSessionMutation = useCreateCheckoutSession();
  const markPaidOnSiteMutation = useMarkPaidOnSite();

  const reservations = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const error = fetchError
    ? (fetchError instanceof Error ? fetchError.message : 'Nie udało się pobrać listy rezerwacji.')
    : null;

  const payReservation = async (reservationId: string) => {
    setPayingId(reservationId);
    try {
      const stripeResponse = await createCheckoutSessionMutation.mutateAsync({
        reservationId,
        successUrl: `${window.location.origin}/sukces?reservationId=${reservationId}`,
        cancelUrl: `${window.location.origin}/anulowano?reservationId=${reservationId}`,
      });
      window.location.href = stripeResponse.url;
    } catch (err: any) {
      setPayError(
        err.response?.data?.detail || 'Nie udało się rozpocząć płatności.'
      );
    } finally {
      setPayingId(null);
    }
  };

  const handleMarkPaidOnSite = async (reservationId: string) => {
    setPayingId(reservationId);
    try {
      await markPaidOnSiteMutation.mutateAsync(reservationId);
    } catch (err: any) {
      setPayError(
        err.response?.data?.detail || 'Nie udało się oznaczyć jako zapłacone.'
      );
    } finally {
      setPayingId(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...reservations];

    if (filterStatus !== null) {
      result = result.filter((r) => r.status === filterStatus);
    }

    return result;
  }, [reservations, filterStatus]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setFilterStatus(null);
    setSearchText('');
    setSortField('date');
    setSortDir('desc');
  };

  const hasActiveFilters = filterStatus !== null || searchText.trim() !== '';

  return (
    <Container className="py-5" style={{ maxWidth: '960px' }}>
      <div className="d-flex align-items-center gap-3 mb-4">
        <BsCalendarCheck size={28} className="text-primary-brand" />
        <h2 className="fw-bold mb-0">Moje rezerwacje</h2>
        {totalCount > 0 && (
          <Badge bg="secondary" className="ms-2 fs-6">
            {totalCount}
          </Badge>
        )}
      </div>

      <Card className="bg-card border-secondary rounded-4 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-end">
            <Col xs={12} md={4}>
              <Form.Label className="small text-secondary mb-1">
                <BsSearch className="me-1" />
                Szukaj
              </Form.Label>
              <InputGroup size="sm">
                <Form.Control
                  placeholder="Nazwa obiektu, kortu..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col xs={6} md={3}>
              <Form.Label className="small text-secondary mb-1">
                <BsFunnel className="me-1" />
                Status
              </Form.Label>
              <Form.Select
                size="sm"
                value={filterStatus === null ? '' : filterStatus}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilterStatus(v === '' ? null : (Number(v) as ReservationStatus));
                }}
              >
                <option value="">Wszystkie</option>
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} md={4}>
              <Form.Label className="small text-secondary mb-1">Sortuj po</Form.Label>
              <div className="d-flex gap-1">
                {(['date', 'status', 'price'] as SortField[]).map((field) => (
                  <button
                    key={field}
                    className={`btn btn-sm flex-grow-1 ${sortField === field ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => toggleSort(field)}
                  >
                    {field === 'date' ? 'Data' : field === 'status' ? 'Status' : 'Cena'}{' '}
                    {sortField === field && (sortDir === 'asc' ? <BsSortUp /> : <BsSortDown />)}
                  </button>
                ))}
              </div>
            </Col>

            <Col xs={6} md={2} className="d-flex align-items-end">
              {hasActiveFilters && (
                <button className="btn btn-sm btn-outline-danger w-100" onClick={clearFilters}>
                  Wyczyść filtry
                </button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && reservations.length === 0 && (
        <Card className="bg-card border-secondary rounded-4 text-center p-5">
          <Card.Body className="d-flex flex-column align-items-center gap-3">
            <BsCalendarCheck size={48} className="text-secondary" />
            <h5 className="fw-semibold">Brak rezerwacji</h5>
            <p className="text-secondary mb-3">
              Nie masz jeszcze żadnych rezerwacji. Przeglądaj dostępne obiekty i
              zarezerwuj kort!
            </p>
            <Link to="/" className="btn btn-primary">
              Przeglądaj obiekty <BsArrowRight className="ms-1" />
            </Link>
          </Card.Body>
        </Card>
      )}

      {!loading && reservations.length > 0 && (
        <>
          {hasActiveFilters && (
            <p className="text-secondary small mb-2">
              Wyświetlono {filtered.length} z {reservations.length} rezerwacji (filtry aktywne)
            </p>
          )}

          <Card className="bg-card border-secondary rounded-4 shadow-sm d-none d-md-block">
            <Card.Body className="p-0">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th className="ps-3">Data</th>
                    <th>Godziny</th>
                    <th>Obiekt</th>
                    <th>Kort</th>
                    <th>Cena</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td className="ps-3 fw-semibold text-nowrap">
                        {dayjs.utc(r.startTime).local().format('DD.MM.YYYY')}
                      </td>
                      <td className="text-nowrap">
                        <BsClock className="me-1 text-secondary" size={14} />
                        {dayjs.utc(r.startTime).local().format('HH:mm')} –{' '}
                        {dayjs.utc(r.endTime).local().format('HH:mm')}
                      </td>
                      <td>{r.facilityName || <span className="text-secondary">—</span>}</td>
                      <td>{r.courtName || <span className="text-secondary">—</span>}</td>
                      <td className="fw-semibold text-nowrap">
                        {r.price != null ? `${r.price.toFixed(2)} PLN` : <span className="text-secondary">—</span>}
                      </td>
                      <td>
                        <Badge bg={STATUS_BADGE[r.status]} className="d-flex align-items-center gap-1 w-fit">
                          {STATUS_ICON[r.status]}
                          {STATUS_LABEL[r.status]}
                        </Badge>
                      </td>
                      <td className="text-end pe-3">
                        {r.status === 0 && (
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="btn btn-primary btn-sm"
                              disabled={payingId === r.id}
                              onClick={() => payReservation(r.id)}
                            >
                              {payingId === r.id ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <BsCreditCard className="me-1" />
                              )}
                              Zapłać
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm"
                              disabled={payingId === r.id}
                              onClick={() => handleMarkPaidOnSite(r.id)}
                            >
                              {payingId === r.id ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <BsCashCoin className="me-1" />
                              )}
                              Zapłać na miejscu
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-secondary py-4">
                        Brak wyników dla wybranych filtrów
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          <div className="d-md-none d-flex flex-column gap-3">
            {filtered.length === 0 && (
              <p className="text-center text-secondary py-3">
                Brak wyników dla wybranych filtrów
              </p>
            )}
            {filtered.map((r) => (
              <Card key={r.id} className="bg-card border-secondary rounded-4 shadow-sm">
                <Card.Body className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">
                      {dayjs.utc(r.startTime).local().format('DD.MM.YYYY')}
                    </span>
                    <Badge bg={STATUS_BADGE[r.status]} className="d-flex align-items-center gap-1">
                      {STATUS_ICON[r.status]}
                      {STATUS_LABEL[r.status]}
                    </Badge>
                  </div>
                  <div className="text-secondary">
                    <BsClock className="me-1" size={14} />
                    {dayjs.utc(r.startTime).local().format('HH:mm')} –{' '}
                    {dayjs.utc(r.endTime).local().format('HH:mm')}
                  </div>
                  <div className="d-flex flex-wrap gap-x-3 gap-1 small">
                    {r.facilityName && (
                      <span><span className="text-secondary">Obiekt:</span> {r.facilityName}</span>
                    )}
                    {r.courtName && (
                      <span><span className="text-secondary">Kort:</span> {r.courtName}</span>
                    )}
                  </div>
                  {r.price != null && (
                    <div className="fw-bold text-primary-brand">
                      {r.price.toFixed(2)} PLN
                    </div>
                  )}
                  {r.status === 0 && (
                    <div className="d-flex gap-1 align-self-end mt-1">
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={payingId === r.id}
                        onClick={() => payReservation(r.id)}
                      >
                        {payingId === r.id ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          <BsCreditCard className="me-1" />
                        )}
                        Zapłać
                      </button>
                      <button
                        className="btn btn-outline-success btn-sm"
                        disabled={payingId === r.id}
                        onClick={() => handleMarkPaidOnSite(r.id)}
                      >
                        {payingId === r.id ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          <BsCashCoin className="me-1" />
                        )}
                        Na miejscu
                      </button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Poprzednia
              </button>
              <span className="text-secondary">
                Strona {page} z {totalPages}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Następna →
              </button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}
