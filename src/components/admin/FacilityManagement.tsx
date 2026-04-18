import { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Card, Pagination, Form, Row, Col } from 'react-bootstrap';
import { BsArrowUp, BsArrowDown, BsPencilSquare } from 'react-icons/bs';
import apiClient from '../../services/apiClient';
import CreateFacilityModal from './modals/CreateFacilityModal';
import EditFacilityModal from './modals/EditFacilityModal';

export interface Facility {
  id: string;
  name: string | null;
  address: string | null;
}

interface GetFacilitiesResponsePagedResult {
  items: Facility[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function FacilityManagement() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 15;

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('Name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<GetFacilitiesResponsePagedResult>('/api/facilities', {
        params: { 
          PageNumber: pageNumber, 
          PageSize: pageSize,
          SearchTerm: searchTerm || undefined,
          SortColumn: sortColumn,
          SortOrder: sortOrder
        }
      });
      setFacilities(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [pageNumber, sortColumn, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pageNumber === 1) {
      fetchFacilities();
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

  return (
    <Card className="bg-card w-100 border-secondary">
      <Card.Header className="d-flex justify-content-between align-items-center bg-card border-secondary">
        <h5 className="mb-0 fw-bold">Facility Management</h5>
        <div>
          <Button variant="success" size="sm" className="me-2" onClick={() => setShowCreateModal(true)}>
            Add Facility
          </Button>
          <Button variant="outline-primary" size="sm" onClick={fetchFacilities} disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Refresh'}
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        <Form onSubmit={handleSearchSubmit} className="mb-3">
          <Row className="g-2">
            <Col xs={12} sm={8} md={6} lg={4}>
              <Form.Control
                type="text"
                placeholder="Search facilities..."
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
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('Name')}>
                Name {sortColumn === 'Name' && (sortOrder === 'asc' ? <BsArrowUp className="ms-1" /> : <BsArrowDown className="ms-1" />)}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSortChange('Address')}>
                Address {sortColumn === 'Address' && (sortOrder === 'asc' ? <BsArrowUp className="ms-1" /> : <BsArrowDown className="ms-1" />)}
              </th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && facilities.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4"><Spinner /></td></tr>
            ) : facilities.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-secondary">No facilities found.</td></tr>
            ) : (
              facilities.map(f => (
                <tr key={f.id}>
                  <td className="text-secondary small text-truncate" style={{ maxWidth: '100px' }}>{f.id}</td>
                  <td>{f.name}</td>
                  <td>{f.address}</td>
                  <td className="text-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      title="Edit"
                      onClick={() => {
                        setSelectedFacility(f);
                        setShowEditModal(true);
                      }}
                    >
                      <BsPencilSquare />
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

      <CreateFacilityModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={fetchFacilities}
      />

      <EditFacilityModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedFacility(null);
        }}
        onSuccess={fetchFacilities}
        facility={selectedFacility}
      />
    </Card>
  );
}