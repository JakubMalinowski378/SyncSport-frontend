import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../hooks/useAuth';
import { UserRole } from '../../context/AuthContext';
import { BsTrophyFill, BsCalendar3, BsBuilding, BsHeadset, BsMoonStars, BsSun, BsPersonCircle } from 'react-icons/bs';

export default function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <Navbar expand="lg" sticky="top" className="cr-navbar bg-body-tertiary border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <BsTrophyFill className="text-warning fs-4" aria-hidden="true" />
          <span className="fs-4">SyncSport</span>
          <small className="text-secondary-emphasis d-none d-sm-inline">| smart booking</small>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto mb-2 mb-lg-0 align-items-center gap-2">
            <Nav.Link as={NavLink} to="/" className="d-flex align-items-center gap-2">
              <BsCalendar3 aria-hidden="true" />
              <span>Dashboard</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="d-flex align-items-center gap-2">
              <BsBuilding aria-hidden="true" />
              <span>Facilities</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="d-flex align-items-center gap-2">
              <BsHeadset aria-hidden="true" />
              <span>Support</span>
            </Nav.Link>
            {user
              ? <>
                  {user.role === UserRole.Admin && (
                    <Nav.Link as={NavLink} to="/admin">Admin Dashboard</Nav.Link>
                  )}
                  <Nav.Link as={NavLink} to="/profile">My Profile</Nav.Link>
                  <Button variant="outline-danger" size="sm" onClick={logout}>Logout</Button>
                </>
              : <>
                  <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                  <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
                </>
            }
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill theme-toggle"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              {theme === 'dark' ? <BsSun /> : <BsMoonStars />}
            </Button>
            <Link to={user ? '/profile' : '/login'} className="btn btn-warning rounded-pill px-3 d-flex align-items-center gap-2">
              <BsPersonCircle aria-hidden="true" />
              <span>My account</span>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}