import { Container, Row, Col, Nav } from 'react-bootstrap';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from '../../components/admin/UserManagement';
import FacilityManagement from '../../components/admin/FacilityManagement';

export default function AdminDashboardPage() {
  return (
    <Container fluid className="py-4 h-100">
      <Row className="h-100">
        <Col md={3} lg={2} className="border-end border-secondary mb-4 mb-md-0">
          <h4 className="fw-bold mb-4">Admin Panel</h4>
          <Nav className="flex-column nav-pills gap-2">
            <Nav.Item>
              <NavLink to="/admin/users" 
                       className={({ isActive }) => `nav-link rounded-3 ${isActive ? 'active' : 'text-body'}`}>
                User Management
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/admin/facilities" 
                       className={({ isActive }) => `nav-link rounded-3 ${isActive ? 'active' : 'text-body'}`}>
                Facility Management
              </NavLink>
            </Nav.Item>
          </Nav>
        </Col>

        <Col md={9} lg={10}>
          <Routes>
            <Route path="/" element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="facilities" element={<FacilityManagement />} />
          </Routes>
        </Col>
      </Row>
    </Container>
  );
}
