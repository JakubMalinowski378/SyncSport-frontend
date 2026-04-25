import { Container, Row, Col, Nav } from 'react-bootstrap';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from '../../components/admin/UserManagement';
import FacilityManagement from '../../components/admin/FacilityManagement';

export default function AdminDashboardPage() {
  return (
    <Container fluid className="py-4 h-100">
      <Row className="h-100">
        <Col md={3} lg={2} className="border-end border-secondary mb-4 mb-md-0">
          <h4 className="fw-bold mb-4">Panel administracyjny</h4>
          <Nav className="flex-column nav-pills gap-2">
            <Nav.Item>
              <NavLink to="/panel-admina/uzytkownicy" 
                       className={({ isActive }) => `nav-link rounded-3 ${isActive ? 'active' : 'text-body'}`}>
                Zarządzanie użytkownikami
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/panel-admina/obiekty" 
                       className={({ isActive }) => `nav-link rounded-3 ${isActive ? 'active' : 'text-body'}`}>
                Zarządzanie obiektami
              </NavLink>
            </Nav.Item>
          </Nav>
        </Col>

        <Col md={9} lg={10}>
          <Routes>
            <Route path="/" element={<Navigate to="/panel-admina/uzytkownicy" replace />} />
            <Route path="uzytkownicy" element={<UserManagement />} />
            <Route path="obiekty" element={<FacilityManagement />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
}
