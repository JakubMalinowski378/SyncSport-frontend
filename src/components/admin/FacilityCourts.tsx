import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import apiClient from '../../services/apiClient';
import CreateCourtModal from './modals/CreateCourtModal';
import EditCourtModal from './modals/EditCourtModal';
import DeleteCourtModal from './modals/DeleteCourtModal';
import { BsTrash, BsPencilSquare } from 'react-icons/bs';

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
  const [showEditModal, setShowEditModal] = useState(false);
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
      setError(err.response?.data?.detail || 'Nie udało się załadować korty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, [facilityId]);

  if (loading) {
    return <div className="text-center py-3"><Spinner size="sm" /> Ładowanie kortów...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <div className="p-3 bg-card border-top border-secondary">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-bold mb-0">Przypisane korty</h6>
        <Button variant="success" size="sm" onClick={() => setShowCreateModal(true)}>
          + Dodaj kort
        </Button>
      </div>
      
      {courts.length === 0 ? (
        <p className="text-secondary small">Do tego obiektu nie przypisano żadnych kortów.</p>
      ) : (
        <Table size="sm" responsive className="mb-0 text-body">
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Typ</th>
              <th>Aktywny</th>
              <th className="text-end">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {courts.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.surfaceType}</td>
                <td>{c.isActive ? 'Tak' : 'Nie'}</td>
                <td className="text-end">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    title="Edytuj kort"
                    className="me-2"
                    onClick={() => {
                      setSelectedCourt(c);
                      setShowEditModal(true);
                    }}
                  >
                    <BsPencilSquare />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    title="Usuń kort"
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

      <EditCourtModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={fetchCourts}
        facilityId={facilityId}
        court={selectedCourt}
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