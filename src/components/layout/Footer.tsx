import { Container } from 'react-bootstrap';
import { BsTrophyFill, BsTwitterX, BsInstagram, BsFacebook, BsEnvelope, BsTelephone } from 'react-icons/bs';

export default function AppFooter() {
  return (
    <footer className="bg-body-tertiary border-top mt-5 py-4">
      <Container>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="d-flex align-items-center gap-2 mb-2">
              <BsTrophyFill className="text-warning fs-4" aria-hidden="true" />
              <span className="fw-bold fs-5">SyncSport</span>
            </div>
            <p className="text-secondary-emphasis small mb-2">
              Premium court booking ecosystem for sports lovers. Real-time availability, seamless reservations.
            </p>
            <div className="d-flex gap-3 fs-5 text-secondary-emphasis">
              <BsTwitterX aria-label="Twitter" />
              <BsInstagram aria-label="Instagram" />
              <BsFacebook aria-label="Facebook" />
            </div>
          </div>
          <div className="col-md-2">
            <h6 className="fw-bold">Quick links</h6>
            <ul className="list-unstyled small mb-0">
              <li><a href="/" className="footer-link text-secondary-emphasis">Find a court</a></li>
              <li><a href="/register" className="footer-link text-secondary-emphasis">Membership</a></li>
              <li><a href="/about" className="footer-link text-secondary-emphasis">Cancellation</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Support</h6>
            <ul className="list-unstyled small mb-0">
              <li>
                <BsEnvelope aria-hidden="true" className="me-1" />
                <a href="mailto:support@syncsport.com" className="footer-link text-secondary-emphasis">support@syncsport.com</a>
              </li>
              <li className="text-secondary-emphasis mt-1">
                <BsTelephone aria-hidden="true" className="me-1" />
                +1 (800) 456-7890
              </li>
            </ul>
          </div>
        </div>
        <hr className="my-3" />
        <div className="text-center small text-secondary-emphasis">
          © 2026 SyncSport - Smart facility management. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}