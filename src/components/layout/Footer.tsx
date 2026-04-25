import { Container } from 'react-bootstrap';
import { BsTrophyFill, BsTwitterX, BsInstagram, BsFacebook, BsEnvelope, BsTelephone } from 'react-icons/bs';

export default function AppFooter() {
  return (
    <footer className="bg-body-tertiary border-top mt-5 py-4">
      <Container>
        <div className="row g-4 justify-content-center text-center">
          <div className="col-md-4 col-lg-3">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <BsTrophyFill className="text-warning fs-4" aria-hidden="true" />
              <span className="fw-bold fs-5">SyncSport</span>
            </div>
            <p className="text-secondary-emphasis small mb-2">
              Ekosystem rezerwacji kortów dla miłośników sportu. Dostępność w czasie rzeczywistym, bezproblemowe rezerwacje.
            </p>
            <div className="d-flex gap-3 fs-5 text-secondary-emphasis justify-content-center">
              <BsTwitterX aria-label="Twitter" />
              <BsInstagram aria-label="Instagram" />
              <BsFacebook aria-label="Facebook" />
            </div>
          </div>
          <div className="col-md-2 col-lg-2">
            <h6 className="fw-bold">Szybkie linki</h6>
            <ul className="list-unstyled small mb-0">
              <li><a href="/" className="footer-link text-secondary-emphasis">Znajdź kort</a></li>
              <li><a href="/rejestracja" className="footer-link text-secondary-emphasis">Członkostwo</a></li>
              <li><a href="/o-nas" className="footer-link text-secondary-emphasis">Anulowanie</a></li>
            </ul>
          </div>
          <div className="col-md-3 col-lg-3">
            <h6 className="fw-bold">Wsparcie</h6>
            <ul className="list-unstyled small mb-0">
              <li>
                <BsEnvelope aria-hidden="true" className="me-1" />
                <a href="mailto:support@syncsport.com" className="footer-link text-secondary-emphasis">support@syncsport.com</a>
              </li>
              <li className="text-secondary-emphasis mt-1">
                <BsTelephone aria-hidden="true" className="me-1" />
                +48 000-000-000
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-3" />
        <div className="text-center small text-secondary-emphasis">
          © 2026 SyncSport - Inteligentne zarządzanie obiektami. Wszystkie prawa zastrzeżone.
        </div>
      </Container>
    </footer>
  );
}