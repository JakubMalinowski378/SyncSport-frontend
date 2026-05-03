import { useState } from 'react';
import { Container, Card, Spinner, Alert, Row, Col, Badge, Button } from 'react-bootstrap';
import { useProfile } from '../hooks/useUserQueries';
import EditProfileModal from '../components/profile/EditProfileModal';

export default function ProfilePage() {
  const { data: userProfile, isLoading: loading, error: fetchError } = useProfile();
  const [showEditModal, setShowEditModal] = useState(false);

  const error = fetchError instanceof Error
    ? fetchError.message
    : fetchError
      ? 'Nie udało się załadować informacji profilu użytkownika.'
      : null;

  const openEditModal = () => {
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
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
