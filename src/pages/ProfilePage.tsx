import { useState, useEffect } from 'react';
import { Container, Card, Spinner, Alert, Row, Col, Badge, Button } from 'react-bootstrap';
import apiClient from '../services/apiClient';
import EditProfileModal from '../components/profile/EditProfileModal';

interface GetCurrentUserResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
  isActive: boolean;
  managedFacilityIds: string[] | null;
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<GetCurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get<GetCurrentUserResponse>('/api/users/me');
      setUserProfile(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się załadować informacji profilu użytkownika.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await fetchProfile();
  };

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold">Mój profil</h2>
        {userProfile && (
          <Button variant="primary" onClick={openEditModal}>
            Edytuj profil
          </Button>
        )}
      </div>
      
      {loading && <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>}
      
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && userProfile && (
        <Card className="bg-card border-secondary shadow-sm rounded-4">
          <Card.Body className="p-4">
            <Row className="gy-3">

              <Col sm={4} className="text-secondary fw-semibold">Imię i nazwisko:</Col>
              <Col sm={8}>{userProfile.firstName} {userProfile.lastName}</Col>

              <Col sm={4} className="text-secondary fw-semibold">E-mail:</Col>
              <Col sm={8}>{userProfile.email}</Col>

              <Col sm={4} className="text-secondary fw-semibold">Rola:</Col>
              <Col sm={8}>
                <Badge bg={userProfile.role === 'Admin' ? 'danger' : 'primary'}>
                  {userProfile.role || 'User'}
                </Badge>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {userProfile && (
        <EditProfileModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          currentFirstName={userProfile.firstName || ''}
          currentLastName={userProfile.lastName || ''}
        />
      )}
    </Container>
  );
}
