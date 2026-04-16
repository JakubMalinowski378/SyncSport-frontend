import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../hooks/useAuth';

export default function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <Navbar expand="md" className="bg-card border-bottom border-secondary sticky-top">
      <Container fluid="xl">
        <Navbar.Brand as={Link} to="/" className="fw-bold text-primary-brand fs-4">
          ⚡ SyncSport
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto align-items-md-center gap-2">
            <Nav.Link as={NavLink} to="/browse">Browse</Nav.Link>
            {user
              ? <>
                  <Nav.Link as={NavLink} to="/my-bookings">My Bookings</Nav.Link>
                  <Nav.Link as={NavLink} to="/profile">My Profile</Nav.Link>
                  <Button variant="outline-danger" size="sm" onClick={logout}>Logout</Button>
                </>
              : <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
            }
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}