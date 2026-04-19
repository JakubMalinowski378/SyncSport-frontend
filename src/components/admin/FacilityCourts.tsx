import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import apiClient from '../../services/apiClient';
import CreateCourtModal from './modals/CreateCourtModal';
import DeleteCourtModal from './modals/DeleteCourtModal';
import { BsTrash } from 'react-icons/bs';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
}

interface CourtDtoPagedResult {
  items: Court[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface FacilityCourtsProps {
  facilityId: string;
}

export default function FacilityCourts({ facilityId }: FacilityCourtsProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<CourtDtoPagedResult>(`/api/facilities/${facilityId}/courts`, {
        params: { PageNumber: 1, PageSize: 30 }
      });
      setCourts(res.data.items || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch courts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, [facilityId]);

  if (loading) {
    return <div className="text-center py-3"><Spinner size="sm" /> Loading courts...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <div className="p-3 bg-card border-top border-secondary">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Assigned Courts</h6>
        <Button variant="success" size="sm" onClick={() => setShowCreateModal(true)}>
          + Add Court
        </Button>
      </div>
      
      {courts.length === 0 ? (
        <p className="text-secondary small">No courts assigned to this facility.</p>
      ) : (
        <Table size="sm" responsive className="mb-0 text-body">
          <thead>
            <tr>
              <th>Name</th>
              <th>Surface</th>
              <th>Active</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courts.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.surfaceType}</td>
                <td>{c.isActive ? 'Yes' : 'No'}</td>
                <td className="text-end">
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    title="Delete Court"
                    onClick={() => {
                      setSelectedCourt(c);
                      setShowDeleteModal(true);
                    }}
                  >
                    <BsTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <CreateCourtModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={fetchCourts}
        facilityId={facilityId}
      />

      <DeleteCourtModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={fetchCourts}
        facilityId={facilityId}
        court={selectedCourt}
      />
    </div>
  );
}