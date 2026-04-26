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

interface CourtRateOverride {
  courtId: string;
  hourlyRate: number;
}

interface TariffDto {
  id: string;
  facilityId: string;
  baseHourlyRate: number;
  courtOverrides: CourtRateOverride[] | null;
}

interface FacilityCourtsProps {
  facilityId: string;
  facilitySlug: string;
}

export default function FacilityCourts({ facilityId, facilitySlug }: FacilityCourtsProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [tariffs, setTariffs] = useState<TariffDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const activeTariff = tariffs[0] ?? null;

  const formatRate = (rate?: number | null) => {
    if (rate === null || rate === undefined || Number.isNaN(rate)) {
      return 'Brak';
    }

    return `${rate.toFixed(2)} PLN / h`;
  };

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const [courtsResult, tariffsResult] = await Promise.allSettled([
        apiClient.get<CourtDtoPagedResult>(`/api/facilities/${facilitySlug}/courts`, {
          params: { PageNumber: 1, PageSize: 30 }
        }),
        apiClient.get<TariffDto[]>(`/api/tariffs/facility/${facilityId}`)
      ]);

      if (courtsResult.status === 'fulfilled') {
        setCourts(courtsResult.value.data.items || []);
      } else {
        throw courtsResult.reason;
      }

      if (tariffsResult.status === 'fulfilled') {
        setTariffs(tariffsResult.value.data || []);
      } else {
        setTariffs([]);
      }

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się załadować korty');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, [facilitySlug]);

  if (loading) {
    return <div className="text-center py-3"><Spinner size="sm" /> Ładowanie kortów...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <div className="p-3 bg-card border-top border-secondary">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div>
          <h6 className="fw-bold mb-1">Przypisane korty</h6>
          <div className="text-secondary small">
            Przelicznik obiektu: <span className="text-body fw-semibold">{formatRate(activeTariff?.baseHourlyRate)}</span>
          </div>
        </div>
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
              <th>Stawka godzinowa</th>
              <th>Aktywny</th>
              <th className="text-end">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {courts.map(c => (
              (() => {
                const courtRate = activeTariff?.courtOverrides?.find(override => override.courtId === c.id)?.hourlyRate ?? activeTariff?.baseHourlyRate;

                return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.surfaceType}</td>
                <td>{formatRate(courtRate)}</td>
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
                );
              })()
            ))}
          </tbody>
        </Table>
      )}

      <CreateCourtModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onSuccess={fetchCourts}
        facilityId={facilitySlug}
      />

      <EditCourtModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={fetchCourts}
        facilityId={facilitySlug}
        court={selectedCourt}
      />

      <DeleteCourtModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={fetchCourts}
        facilityId={facilitySlug}
        court={selectedCourt}
      />
    </div>
  );
}