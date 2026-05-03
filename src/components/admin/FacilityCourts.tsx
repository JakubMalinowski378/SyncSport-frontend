import { useState } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { BsTrash, BsPencilSquare } from 'react-icons/bs';
import { useQueryClient } from '@tanstack/react-query';
import { useCourts, useTariffs } from '../../hooks/useFacilityQueries';
import CreateCourtModal from './modals/CreateCourtModal';
import EditCourtModal from './modals/EditCourtModal';
import DeleteCourtModal from './modals/DeleteCourtModal';
import CreateTariffModal from './modals/CreateTariffModal';

interface Court {
  id: string;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
}

interface FacilityCourtsProps {
  facilityId: string;
  facilitySlug: string;
}

export default function FacilityCourts({ facilityId, facilitySlug }: FacilityCourtsProps) {
  const queryClient = useQueryClient();
  const { data: courtsData, isLoading, error } = useCourts(facilitySlug, { PageNumber: 1, PageSize: 30 });
  const { data: tariffsData } = useTariffs(facilityId);

  const courts = courtsData?.items || [];
  const tariffs = tariffsData || [];
  const activeTariff = tariffs[0] ?? null;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTariffModal, setShowTariffModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['facilities'] });
  };

  const formatRate = (rate?: number | null) => {
    if (rate === null || rate === undefined || Number.isNaN(rate)) {
      return 'Brak';
    }

    return `${rate.toFixed(2)} PLN / h`;
  };

  if (isLoading) {
    return <div className="text-center py-3"><Spinner size="sm" /> Ładowanie kortów...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error instanceof Error ? error.message : 'Wystąpił błąd'}</Alert>;
  }

  return (
    <div className="p-3 bg-card border-top border-secondary">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div>
          <h6 className="fw-bold mb-1">Przypisane korty</h6>
          <div className="text-secondary small">
            Cennik obiektu: <span className="text-body fw-semibold">{formatRate(activeTariff?.baseHourlyRate)}</span>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={activeTariff ? 'outline-warning' : 'outline-success'}
            size="sm"
            onClick={() => setShowTariffModal(true)}
          >
            {activeTariff ? 'Edytuj cennik' : '+ Dodaj cennik'}
          </Button>
          <Button variant="success" size="sm" onClick={() => setShowCreateModal(true)}>
            + Dodaj kort
          </Button>
        </div>
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
        onSuccess={refresh}
        facilitySlug={facilitySlug}
        facilityId={facilityId}
      />

      <CreateTariffModal
        show={showTariffModal}
        onHide={() => setShowTariffModal(false)}
        onSuccess={refresh}
        facilityId={facilityId}
        initialTariff={activeTariff}
        courts={courts}
      />

      <EditCourtModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={refresh}
        facilityId={facilityId}
        court={selectedCourt}
      />

      <DeleteCourtModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedCourt(null);
        }}
        onSuccess={refresh}
        facilitySlug={facilitySlug}
        court={selectedCourt}
      />
    </div>
  );
}