import { Container } from 'react-bootstrap';

export default function AppFooter() {
  return (
    <footer className="bg-card border-top border-secondary py-4 mt-auto">
      <Container fluid="xl" className="text-center text-secondary">
        <p className="mb-0">© 2026 SyncSport. All rights reserved.</p>
      </Container>
    </footer>
  );
}