import { Navbar, Nav, Container, Button, NavDropdown, Dropdown } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth }  from '../../hooks/useAuth';
import { UserRole } from '../../context/AuthContext';
import { BsTrophyFill, BsCalendar3, BsBuilding, BsHeadset, BsMoonStars, BsSun, BsPersonCircle, BsBoxArrowRight, BsChevronDown } from 'react-icons/bs';

export default function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <Navbar expand="lg" sticky="top" className="cr-navbar bg-body-tertiary border-bottom shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center gap-2">
          <BsTrophyFill className="text-warning fs-4" aria-hidden="true" />
          <span className="fs-4">SyncSport</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto mb-2 mb-lg-0 align-items-center gap-2">
            <Nav.Link as={NavLink} to="/" className="d-flex align-items-center gap-2">
              <BsCalendar3 aria-hidden="true" />
              <span>Strona główna</span>
            </Nav.Link>
            <Nav.Link as={NavLink} to="/o-nas" className="d-flex align-items-center gap-2">
              <BsBuilding aria-hidden="true" />
              <span>Obiekty</span>
            </Nav.Link>
            {user
              ? <>
                  {user.role === UserRole.Admin && (
                    <Nav.Link as={NavLink} to="/panel-admina">Panel administratora</Nav.Link>
                  )}
                  {user.role === UserRole.Manager && (
                    <Nav.Link as={NavLink} to="/panel-admina">Zarządzaj obiektami</Nav.Link>
                  )}
                  <NavDropdown
                    title={
                      <span className="d-flex align-items-center gap-2">
                        <BsPersonCircle aria-hidden="true" />
                        <span>Moje konto</span>
                        <BsChevronDown size={14} aria-hidden="true" />
                      </span>
                    }
                    id="account-dropdown"
                    align="end"
                  >
                    <Dropdown.Item as={Link} to="/moje-rezerwacje" className="d-flex align-items-center gap-2">
                      <BsCalendar3 size={16} />
                      <span>Moje rezerwacje</span>
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/profil" className="d-flex align-items-center gap-2">
                      <BsPersonCircle size={16} />
                      <span>Profil</span>
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={logout} className="d-flex align-items-center gap-2 text-danger">
                      <BsBoxArrowRight size={16} />
                      <span>Wyloguj</span>
                    </Dropdown.Item>
                  </NavDropdown>
                </>
              : <>
                  <Nav.Link as={NavLink} to="/logowanie">Zaloguj się</Nav.Link>
                  <Nav.Link as={NavLink} to="/rejestracja">Utwórz konto</Nav.Link>
                </>
            }
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill theme-toggle"
              onClick={toggleTheme}
              title="Przełącz motyw"
            >
              {theme === 'dark' ? <BsSun /> : <BsMoonStars />}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}