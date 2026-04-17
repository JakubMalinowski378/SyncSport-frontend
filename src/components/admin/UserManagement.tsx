import { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Card, Form, Row, Col, Pagination } from 'react-bootstrap';
import apiClient from '../../services/apiClient';
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

interface GetUserResponsePagedResult {
  items: User[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);

  const [showDisableModal, setShowDisableModal] = useState(false);
  const [userToDisable, setUserToDisable] = useState<User | null>(null);

  const [showFacilitiesModal, setShowFacilitiesModal] = useState(false);
  const [userToViewFacilities, setUserToViewFacilities] = useState<User | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('Email');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<GetUserResponsePagedResult>('/api/users', {
        params: { 
          PageNumber: pageNumber, 
          PageSize: pageSize,
          SearchTerm: searchTerm || undefined,
          SortColumn: sortColumn,
          SortOrder: sortOrder
        }
      });
      setUsers(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pageNumber, sortColumn, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageNumber === 1) {
      fetchUsers();
    } else {
      setPageNumber(1);
    }
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

  const openRoleModal = (user: User) => {
    setUserToChangeRole(user);
    setShowRoleModal(true);
  };

  const openFacilitiesModal = (user: User) => {
    setUserToViewFacilities(user);
    setShowFacilitiesModal(true);
  };

  return (
    <Card className="bg-card w-100 border-secondary">
      <Card.Header className="d-flex justify-content-between align-items-center bg-card border-secondary">
        <h5 className="mb-0 fw-bold">User Management</h5>
        <Button variant="outline-primary" size="sm" onClick={fetchUsers} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Refresh'}
        </Button>
      </Card.Header>
      
      <Card.Body>
        <Form onSubmit={handleSearchSubmit} className="mb-3">
          <Row className="g-2">
            <Col xs={12} sm={8} md={6} lg={4}>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-card text-body border-secondary"
              />
            </Col>
            <Col xs="auto">
              <Button type="submit" variant="primary" disabled={loading}>Search</Button>
            </Col>
          </Row>
        </Form>

        {error && <Alert variant="danger">{error}</Alert>}

        <Table responsive hover className="align-middle mb-0 text-body">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('FirstName')}>
                Name {sortColumn === 'FirstName' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('Email')}>
                Email {sortColumn === 'Email' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4"><Spinner /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4 text-secondary">No users found.</td></tr>
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
                        title="View Managed Facilities"
                      >
                        📋
                      </Button>
                    )}
                  </td>
                  <td>
                     <span className={`badge ${u.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-end">
                    <Button variant="outline-info" size="sm" className="me-2" onClick={() => openRoleModal(u)}>
                      Role
                    </Button>
                    <Button 
                      variant={u.isActive ? "outline-warning" : "outline-success"} 
                      size="sm" 
                      className="me-2"
                      onClick={() => { setUserToDisable(u); setShowDisableModal(true); }}
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => { setUserToDelete(u); setShowDeleteModal(true); }}>
                      Delete
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
              <Pagination.Prev onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1 || loading} />
              <Pagination.Item disabled>{pageNumber} of {totalPages}</Pagination.Item>
              <Pagination.Next onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages || loading} />
            </Pagination>
          </div>
        )}
      </Card.Body>

      <DeleteUserModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onSuccess={fetchUsers}
        user={userToDelete}
      />

      <ChangeRoleModal
        show={showRoleModal}
        onHide={() => setShowRoleModal(false)}
        onSuccess={fetchUsers}
        user={userToChangeRole}
      />

      <ToggleUserStatusModal
        show={showDisableModal}
        onHide={() => setShowDisableModal(false)}
        onSuccess={fetchUsers}
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
