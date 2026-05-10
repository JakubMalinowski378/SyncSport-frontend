import { useState, useMemo } from 'react';
import {
  Card, Table, Button, Spinner, Alert, Badge, Form, Row, Col, Modal, Pagination,
} from 'react-bootstrap';
import {
  BsCalendarCheck, BsClock, BsSearch, BsTrash, BsCashCoin, BsCreditCard,
  BsPlusCircle, BsXCircle, BsCheckCircle, BsHourglassSplit, BsPersonCircle,
} from 'react-icons/bs';
import dayjs from 'dayjs';
import { useUsers } from '../../hooks/useUserQueries';
import { useUserReservations, useAdminDeleteReservation, useAdminMarkPaidOnSite, useAdminCreateReservation } from '../../hooks/useReservationQueries';
import { useFacilities, useCourts } from '../../hooks/useFacilityQueries';
import type { ReservationStatus } from '../../services/reservationService';
import type { User } from '../../services/userService';

const STATUS_LABEL: Record<ReservationStatus, string> = {
  0: 'Oczekująca na płatność',
  1: 'Opłacona',
  2: 'Anulowana',
  3: 'Oczekuje na płatność na miejscu',
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  0: 'warning',
  1: 'success',
  2: 'danger',
  3: 'info',
};

const STATUS_ICON: Record<ReservationStatus, React.ReactNode> = {
  0: <BsHourglassSplit />,
  1: <BsCheckCircle />,
  2: <BsXCircle />,
  3: <BsCashCoin />,
};

export default function ReservationManagement() {
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [resPage, setResPage] = useState(1);
  const [resStatusFilter, setResStatusFilter] = useState<ReservationStatus | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; facilityId: string } | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFacilityId, setCreateFacilityId] = useState('');
  const [createCourtId, setCreateCourtId] = useState('');
  const [createDate, setCreateDate] = useState('');
  const [createStartTime, setCreateStartTime] = useState('');
  const [createEndTime, setCreateEndTime] = useState('');
  const [createPayOnSite, setCreatePayOnSite] = useState(false);

  const [payingId, setPayingId] = useState<string | null>(null);

  const [userPage, setUserPage] = useState(1);
  const userParams: Record<string, string | number | undefined> = {
    PageNumber: userPage,
    PageSize: 10,
    SearchTerm: userSearchTerm || undefined,
  };
  const { data: usersData, isLoading: usersLoading } = useUsers(userParams);
  const users = usersData?.items || [];

  const resParams: Record<string, string | number | undefined> = {
    PageNumber: resPage,
    PageSize: 10,
    Status: resStatusFilter !== null ? resStatusFilter : undefined,
  };
  const { data: reservationsData, isLoading: resLoading, error: resError } = useUserReservations(
    selectedUserId || '',
    selectedUserId ? resParams : undefined,
  );
  const reservations = reservationsData?.items || [];
  const totalPages = reservationsData?.totalPages || 1;

  const { data: facilitiesData } = useFacilities({ PageSize: 30 });
  const facilities = facilitiesData?.items || [];

  const selectedFacility = useMemo(
    () => facilities.find((f: any) => f.id === createFacilityId) ?? null,
    [createFacilityId, facilities],
  );
  const courtSlug = selectedFacility?.slug ?? '';

  const { data: courtsData } = useCourts(courtSlug, { PageNumber: 1, PageSize: 30 });
  const courts = courtsData?.items || [];

  const deleteMutation = useAdminDeleteReservation();
  const markPaidMutation = useAdminMarkPaidOnSite();
  const createMutation = useAdminCreateReservation();

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setResPage(1);
    setResStatusFilter(null);
    setUserSearchTerm('');
  };

  const handleDeleteReservation = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch {
    }
  };

  const handleMarkPaidOnSite = async (id: string) => {
    setPayingId(id);
    try {
      await markPaidMutation.mutateAsync(id);
    } catch {
    } finally {
      setPayingId(null);
    }
  };

  const handleCreateReservation = async () => {
    if (!selectedUserId || !createCourtId || !createDate || !createStartTime || !createEndTime) return;

    const startTime = dayjs(`${createDate}T${createStartTime}`).toISOString();
    const endTime = dayjs(`${createDate}T${createEndTime}`).toISOString();

    try {
      await createMutation.mutateAsync({
        userId: selectedUserId,
        courtId: createCourtId,
        startTime,
        endTime,
        payOnSite: createPayOnSite,
      });
      setShowCreateModal(false);
      resetCreateForm();
    } catch {
    }
  };

  const resetCreateForm = () => {
    setCreateFacilityId('');
    setCreateCourtId('');
    setCreateDate('');
    setCreateStartTime('');
    setCreateEndTime('');
    setCreatePayOnSite(false);
  };

  const handleCreateFacilityChange = (facilityId: string) => {
    setCreateFacilityId(facilityId);
    setCreateCourtId('');
  };

  const filteredReservations = useMemo(() => {
    if (resStatusFilter === null) return reservations;
    return reservations.filter((r) => r.status === resStatusFilter);
  }, [reservations, resStatusFilter]);

  return (
    <Card className="bg-card w-100 border-secondary">
      <Card.Header className="d-flex justify-content-between align-items-center bg-card border-secondary">
        <h5 className="mb-0 fw-bold">
          <BsCalendarCheck className="me-2" />
          Zarządzanie rezerwacjami
        </h5>
      </Card.Header>

      <Card.Body>
        {/* User search */}
        <Form className="mb-3">
          <Row className="g-2">
            <Col xs={12} md={6}>
              <Form.Control
                type="text"
                placeholder="Szukaj użytkownika po emailu lub nazwie..."
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value);
                  setUserPage(1);
                }}
              />
            </Col>
            <Col xs="auto">
              <Button variant="outline-secondary" disabled>
                <BsSearch />
              </Button>
            </Col>
          </Row>
        </Form>

        {usersLoading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </div>
        )}

        {!usersLoading && userSearchTerm && users.length === 0 && (
          <Alert variant="info" className="py-2 small">
            Nie znaleziono użytkowników.
          </Alert>
        )}

        {!usersLoading && users.length > 0 && !selectedUserId && (
          <Card className="bg-card border-secondary mb-3">
            <Card.Body className="p-2">
              {users.map((u: User) => (
                <div
                  key={u.id}
                  className="d-flex align-items-center gap-3 p-2 rounded-3 cursor-pointer"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectUser(u.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSelectUser(u.id); }}
                  role="button"
                  tabIndex={0}
                >
                  <BsPersonCircle size={32} className="text-secondary" />
                  <div>
                    <div className="fw-semibold">
                      {u.firstName || ''} {u.lastName || ''}
                    </div>
                    <div className="small text-secondary">{u.email}</div>
                  </div>
                  <Badge bg="info" className="ms-auto">{u.role}</Badge>
                </div>
              ))}
            </Card.Body>
          </Card>
        )}

        {selectedUserId && (
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <strong className="me-2">Wybrany użytkownik:</strong>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setSelectedUserId(null)}
              >
                Zmień użytkownika <BsXCircle className="ms-1" />
              </Button>
            </div>
            <Button
              variant="success"
              size="sm"
              onClick={() => {
                resetCreateForm();
                setShowCreateModal(true);
              }}
            >
              <BsPlusCircle className="me-1" />
              Utwórz rezerwację
            </Button>
          </div>
        )}

        {selectedUserId && (
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <Form.Select
              size="sm"
              style={{ width: 'auto' }}
              value={resStatusFilter === null ? '' : resStatusFilter}
              onChange={(e) => {
                const v = e.target.value;
                setResStatusFilter(v === '' ? null : (Number(v) as ReservationStatus));
                setResPage(1);
              }}
            >
              <option value="">Wszystkie statusy</option>
              {([0, 1, 2, 3] as ReservationStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </Form.Select>
          </div>
        )}

        {resError && (
          <Alert variant="danger">
            {resError instanceof Error ? resError.message : 'Nie udało się pobrać rezerwacji.'}
          </Alert>
        )}

        {resLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {selectedUserId && !resLoading && filteredReservations.length === 0 && (
          <p className="text-center text-secondary py-4">
            Ten użytkownik nie ma żadnych rezerwacji.
          </p>
        )}

        {selectedUserId && !resLoading && filteredReservations.length > 0 && (
          <>
            <Card className="bg-card border-secondary rounded-4 shadow-sm d-none d-md-block">
              <Card.Body className="p-0">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th className="ps-3">Data</th>
                      <th>Godziny</th>
                      <th>Status</th>
                      <th className="text-end pe-3">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((r) => (
                      <tr key={r.id}>
                        <td className="ps-3 fw-semibold text-nowrap">
                          {dayjs.utc(r.startTime).local().format('DD.MM.YYYY')}
                        </td>
                        <td className="text-nowrap">
                          <BsClock className="me-1 text-secondary" size={14} />
                          {dayjs.utc(r.startTime).local().format('HH:mm')} –{' '}
                          {dayjs.utc(r.endTime).local().format('HH:mm')}
                        </td>
                        <td>
                          <Badge bg={STATUS_BADGE[r.status]} className="d-flex align-items-center gap-1 w-fit">
                            {STATUS_ICON[r.status]}
                            {STATUS_LABEL[r.status]}
                          </Badge>
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-flex gap-1 justify-content-end">
                            {r.status === 3 && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                disabled={payingId === r.id}
                                onClick={() => handleMarkPaidOnSite(r.id)}
                              >
                                {payingId === r.id ? (
                                  <Spinner as="span" animation="border" size="sm" />
                                ) : (
                                  <BsCashCoin className="me-1" />
                                )}
                                Oznacz opłacone
                              </Button>
                            )}
                            {r.status !== 2 && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setDeleteTarget({ id: r.id, facilityId: '' });
                                  setShowDeleteModal(true);
                                }}
                              >
                                <BsTrash />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <div className="d-md-none d-flex flex-column gap-3">
              {filteredReservations.map((r) => (
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
                    <div className="d-flex gap-1 mt-1">
                      {r.status === 3 && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          disabled={payingId === r.id}
                          onClick={() => handleMarkPaidOnSite(r.id)}
                        >
                          {payingId === r.id ? (
                            <Spinner as="span" animation="border" size="sm" />
                          ) : (
                            <BsCashCoin className="me-1" />
                          )}
                          Opłać
                        </Button>
                      )}
                      {r.status !== 2 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setDeleteTarget({ id: r.id, facilityId: '' });
                            setShowDeleteModal(true);
                          }}
                        >
                          <BsTrash />
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination size="sm">
                  <Pagination.Prev disabled={resPage <= 1} onClick={() => setResPage((p) => p - 1)} />
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Pagination.Item key={p} active={p === resPage} onClick={() => setResPage(p)}>
                      {p}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next disabled={resPage >= totalPages} onClick={() => setResPage((p) => p + 1)} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card.Body>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Potwierdzenie usunięcia</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Czy na pewno chcesz usunąć tę rezerwację? Tej operacji nie można cofnąć.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Anuluj
          </Button>
          <Button variant="danger" onClick={handleDeleteReservation} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <Spinner size="sm" /> : 'Usuń'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Utwórz rezerwację</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Obiekt</Form.Label>
                  <Form.Select
                    value={createFacilityId}
                    onChange={(e) => handleCreateFacilityChange(e.target.value)}
                  >
                    <option value="">-- Wybierz obiekt --</option>
                    {facilities.map((f: any) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Kort</Form.Label>
                  <Form.Select
                    value={createCourtId}
                    onChange={(e) => setCreateCourtId(e.target.value)}
                    disabled={!createFacilityId}
                  >
                    <option value="">-- Wybierz kort --</option>
                    {courts.filter((c: any) => c.isActive).map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.surfaceType ? `(${c.surfaceType})` : ''}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label>Data</Form.Label>
                  <Form.Control
                    type="date"
                    value={createDate}
                    min={dayjs().format('YYYY-MM-DD')}
                    onChange={(e) => setCreateDate(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} md={3}>
                <Form.Group>
                  <Form.Label>Godzina rozpoczęcia</Form.Label>
                  <Form.Control
                    type="time"
                    value={createStartTime}
                    onChange={(e) => setCreateStartTime(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} md={3}>
                <Form.Group>
                  <Form.Label>Godzina zakończenia</Form.Label>
                  <Form.Control
                    type="time"
                    value={createEndTime}
                    onChange={(e) => setCreateEndTime(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Check
                  type="switch"
                  id="pay-on-site"
                  label="Płatność na miejscu"
                  checked={createPayOnSite}
                  onChange={(e) => setCreatePayOnSite(e.target.checked)}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Anuluj
          </Button>
          <Button
            variant="success"
            onClick={handleCreateReservation}
            disabled={createMutation.isPending || !createCourtId || !createDate || !createStartTime || !createEndTime}
          >
            {createMutation.isPending ? <Spinner size="sm" /> : <BsCreditCard className="me-1" />}
            Utwórz rezerwację
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
