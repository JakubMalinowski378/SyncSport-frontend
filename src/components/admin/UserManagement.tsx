import { useState } from 'react';
import { Table, Button, Spinner, Alert, Card, Form, Row, Col, Pagination } from 'react-bootstrap';
import { BsArrowUp, BsArrowDown, BsListCheck } from 'react-icons/bs';
import { useQueryClient } from '@tanstack/react-query';
import { useUsers, userKeys } from '../../hooks/useUserQueries';
import DeleteUserModal from './modals/DeleteUserModal';
import ChangeRoleModal from './modals/ChangeRoleModal';
import ToggleUserStatusModal from './modals/ToggleUserStatusModal';
import ManagedFacilitiesModal from './modals/ManagedFacilitiesModal';

export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  isActive: boolean;
  managedFacilityIds: string[] | null;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToChangeRole, _setUserToChangeRole] = useState<User | null>(null);

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState<User | null>(null);

  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [userToViewFacilities, setUserToViewFacilities] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('Email');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 15;

  const params: Record<string, string | number | undefined> = {
    PageNumber: pageNumber,
    PageSize: pageSize,
    SearchTerm: searchTerm || undefined,
    SortColumn: sortColumn,
    SortOrder: sortOrder,
  };
  const { data, isLoading, error } = useUsers(params);
  const users = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPageNumber(1);
  };

  const handleSortChange = (col: string) => {
    if (sortColumn === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortOrder('asc');
    }
    setPageNumber(1);
  };

  const refreshUsers = () => queryClient.invalidateQueries({ queryKey: userKeys.lists() });

  const openRoleModal = (user: User) => {
    _setUserToChangeRole(user);
    setShowRoleModal(true);
  };

  const openFacilitiesModal = (user: User) => {
    setUserToViewFacilities(user);
    setShowFacilitiesModal(true);
  };

  return (
    <Card className="bg-card w-100 border-secondary">
      <Card.Header className="d-flex justify-content-between align-items-center bg-card border-secondary">
        <h5 className="mb-0 fw-bold">Zarządzanie użytkownikami</h5>
        <Button variant="outline-primary" size="sm" onClick={refreshUsers} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Odśwież'}
        </Button>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSearchSubmit} className="mb-3">
          <Row className="g-2">
            <Col xs={12} sm={8} md={6} lg={4}>
              <Form.Control
                type="text"
                placeholder="Szukaj..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-card text-body border-secondary"
              />
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary" disabled={isLoading}>Szukaj</Button>
            </Col>
          </Row>
        </Form>

        {error && <Alert variant="danger">{error instanceof Error ? error.message : 'Nie udało się załadować użytkowników'}</Alert>}

        <Table responsive hover className="align-middle mb-0 text-body">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('FirstName')}>
                Imię {sortColumn === 'FirstName' && (sortOrder === 'asc' ? <BsArrowUp className="ms-1" /> : <BsArrowDown className="ms-1" />)}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('Email')}>
                E-mail {sortColumn === 'Email' && (sortOrder === 'asc' ? <BsArrowUp className="ms-1" /> : <BsArrowDown className="ms-1" />)}
              </th>
              <th>Rola</th>
              <th>Status</th>
              <th className="text-end">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4"><Spinner /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-secondary">Nie znaleziono użytkowników.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td className="text-secondary small text-truncate" style={{ maxWidth: '100px' }}>{u.id}</td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role?.toLowerCase() === 'admin' ? 'bg-danger' :
                                          u.role?.toLowerCase() === 'manager' ? 'bg-warning' : 'bg-primary'}`}>
                      {u.role || 'User'}
                    </span>
                    {u.role?.toLowerCase() === 'manager' && (
                      <Button
                        variant="link"
                        size="sm"
                        className="ms-2 p-0 text-decoration-none"
                        onClick={() => openFacilitiesModal(u)}
                        title="Wyświetl zarządzane obiekty"
                      >
                        <BsListCheck size={18} />
                      </Button>
                    )}
                  </td>
                  <td>
                     <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {u.isActive ? 'Aktywny' : 'Nieaktywny'}
                    </span>
                  </td>
                  <td className="text-end">
                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => openRoleModal(u)}>
                      Rola
                    </Button>
                    <Button
                      variant={u.isActive ? "outline-warning" : "outline-success"}
                      size="sm"
                      className="me-2"
                      onClick={() => { setUserToDisable(u); setShowDisableModal(true); }}
                    >
                      {u.isActive ? 'Dezaktywuj' : 'Aktywuj'}
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => { setUserToDelete(u); setShowDeleteModal(true); }}>
                      Usuń
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination className="mb-0">
              <Pagination.Prev onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1 || isLoading} />
              <Pagination.Item disabled>{pageNumber} z {totalPages}</Pagination.Item>
              <Pagination.Next onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages || isLoading} />
            </Pagination>
          </div>
        )}
      </Card.Body>

      <DeleteUserModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onSuccess={refreshUsers}
        user={userToDelete}
      />

      <ChangeRoleModal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        onSuccess={refreshUsers}
        user={userToChangeRole}
      />

      <ToggleUserStatusModal
        show={showDisableModal}
        onHide={() => setShowDisableModal(false)}
        onSuccess={refreshUsers}
        user={userToDisable}
      />

      <ManagedFacilitiesModal
        show={showFacilitiesModal}
        onHide={() => setShowFacilitiesModal(false)}
        user={userToViewFacilities}
      />
    </Card>
  );
}
