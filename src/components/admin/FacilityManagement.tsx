import React, { useState } from 'react';
import { Table, Button, Spinner, Alert, Card, Pagination, Form, Row, Col } from 'react-bootstrap';
import { BsArrowUp, BsArrowDown, BsPencilSquare, BsTrash } from 'react-icons/bs';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../context/AuthContext';
import { useFacilities } from '../../hooks/useFacilityQueries';
import CreateFacilityModal from './modals/CreateFacilityModal';
import CreateTariffModal from './modals/CreateTariffModal';
import EditFacilityModal from './modals/EditFacilityModal';
import DeleteFacilityModal from './modals/DeleteFacilityModal';
import FacilityCourts from './FacilityCourts';

export interface Facility {
  id: string;
  slug?: string | null;
  name: string | null;
  address: string | null;
}

interface FacilityManagementProps {
  managedFacilityIds?: string[];
}

export default function FacilityManagement({ managedFacilityIds }: FacilityManagementProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isManager = user?.role === UserRole.Manager && managedFacilityIds && managedFacilityIds.length > 0;
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 15;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('Name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [expandedFacilityId, setExpandedFacilityId] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateTariffModal, setShowCreateTariffModal] = useState(false);
  const [createdFacilityId, setCreatedFacilityId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const params: Record<string, string | number | undefined> = {
    PageNumber: pageNumber,
    PageSize: pageSize,
    SearchTerm: searchTerm || undefined,
    SortColumn: sortColumn,
    SortOrder: sortOrder,
  };

  if (isManager && managedFacilityIds!.length > 0) {
    params.ManagedFacilityIds = managedFacilityIds!.join(',');
  }
  const { data, isLoading, error } = useFacilities(params);
  const facilities = data?.items || [];
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
    setExpandedFacilityId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedFacilityId(prev => (prev === id ? null : id));
  };

  return (
    <Card className="bg-card w-100 border-secondary">
      <Card.Header className="d-flex justify-content-between align-items-center bg-card border-secondary">
        <h5 className="mb-0 fw-bold">Zarządzanie obiektami</h5>
        <div>
          <Button variant="success" size="sm" className="me-2" onClick={() => setShowCreateModal(true)}>
            Dodaj obiekt
          </Button>
          <Button variant="outline-primary" size="sm" onClick={() => {}} disabled={isLoading}>
            {isLoading ? <Spinner size="sm" /> : 'Odśwież'}
          </Button>
        </div>
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

        {error && <Alert variant="danger">{error instanceof Error ? error.message : 'Nie udało się załadować obiekty'}</Alert>}

        <Table responsive hover className="align-middle mb-0 text-body">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('Name')}>
                Nazwa {sortColumn === 'Name' && (sortOrder === 'asc' ? <BsArrowUp className="ms-1" /> : <BsArrowDown className="ms-1" />)}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('Address')}>
                Adres {sortColumn === 'Address' && (sortOrder === 'asc' ? <BsArrowUp className="ms-1" /> : <BsArrowDown className="ms-1" />)}
              </th>
              <th className="text-end">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && facilities.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4"><Spinner /></td></tr>
            ) : facilities.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-secondary">Nie znaleziono obiektów.</td></tr>
            ) : (
              facilities.map(f => (
                <React.Fragment key={f.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => toggleExpand(f.id)}>
                    <td className="text-secondary small text-truncate" style={{ maxWidth: '100px' }}>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{f.address}</td>
                    <td className="text-end" onClick={e => e.stopPropagation()}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        title="Edytuj"
                        className="me-2"
                        onClick={() => {
                          setSelectedFacility(f);
                          setShowEditModal(true);
                        }}
                      >
                        <BsPencilSquare />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        title="Usuń"
                        onClick={() => {
                          setSelectedFacility(f);
                          setShowDeleteModal(true);
                        }}
                      >
                        <BsTrash />
                      </Button>
                    </td>
                  </tr>
                  {expandedFacilityId === f.id && (
                    <tr>
                      <td colSpan={4} className="p-0 border-bottom border-secondary">
                        <FacilityCourts facilityId={f.id} facilitySlug={f.slug || f.id} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

      <CreateFacilityModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={facilityId => {
          setCreatedFacilityId(facilityId);
          setShowCreateTariffModal(true);
          queryClient.invalidateQueries({ queryKey: ['facilities'] });
        }}
      />

      <CreateTariffModal
        show={showCreateTariffModal}
        onHide={() => {
          setShowCreateTariffModal(false);
          setCreatedFacilityId('');
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['facilities'] })}
        facilityId={createdFacilityId}
      />

      <EditFacilityModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedFacility(null);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['facilities'] })}
        facility={selectedFacility}
      />

      <DeleteFacilityModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedFacility(null);
        }}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['facilities'] })}
        facility={selectedFacility}
      />
    </Card>
  );
}