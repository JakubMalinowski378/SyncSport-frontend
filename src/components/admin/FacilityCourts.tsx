import { useState, useEffect } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import apiClient from '../../services/apiClient';

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

  useEffect(() => {
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

    fetchCourts();
  }, [facilityId]);

  if (loading) {
    return <div className="text-center py-3"><Spinner size="sm" /> Loading courts...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  if (courts.length === 0) {
    return <p className="text-secondary small m-3">No courts assigned to this facility.</p>;
  }

  return (
    <div className="p-3 bg-card border-top border-secondary">
      <h6 className="fw-bold mb-3">Assigned Courts</h6>
      <Table size="sm" responsive className="mb-0 text-body">
        <thead>
          <tr>
            <th>Name</th>
            <th>Surface</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {courts.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.surfaceType}</td>
              <td>{c.isActive ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}