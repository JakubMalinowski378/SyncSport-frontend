import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import apiClient from '../services/apiClient';
import { BsChevronLeft, BsChevronRight, BsImages } from 'react-icons/bs';
import type { ImageDto } from '../types/ImageDto';

interface Court {
  id: string;
  slug?: string | null;
  name: string | null;
  surfaceType: string | null;
  isActive: boolean;
  images?: unknown[] | null;
}

interface CourtDtoPagedResult {
  items: Court[] | null;
}

interface Facility {
  id: string;
  slug?: string | null;
  name: string | null;
  address: string | null;
  images?: (string | ImageDto)[] | null;
}

export default function FacilityCourtsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [courts, setCourts] = useState<Court[]>([]);
  const [facility, setFacility] = useState<Facility | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeCourtImageIndexes, setActiveCourtImageIndexes] = useState<Record<string, number>>({});

  const getFacilityImageUrls = (images?: (string | ImageDto)[] | null) => {
    if (!images || images.length === 0) {
      return [] as string[];
    }

    return images
      .map((img) => {
        if (typeof img === 'string') {
          return img.trim();
        }

        return img?.url?.trim() || '';
      })
      .filter(Boolean);
  };

  const changeImage = (direction: 'prev' | 'next') => {
    const imageUrls = getFacilityImageUrls(facility?.images);
    if (imageUrls.length <= 1) {
      return;
    }

    setActiveImageIndex((current) => (
      direction === 'next'
        ? (current + 1) % imageUrls.length
        : (current - 1 + imageUrls.length) % imageUrls.length
    ));
  };

  const getCourtImageUrls = (images?: unknown[] | null) => {
    if (!images || images.length === 0) {
      return [] as string[];
    }

    return images
      .map((img) => {
        if (typeof img === 'string') {
          return img.trim();
        }

        if (img && typeof img === 'object') {
          const record = img as Record<string, unknown>;
          const candidate = record.url ?? record.imageUrl ?? record.src ?? record.path;
          return typeof candidate === 'string' ? candidate.trim() : '';
        }

        return '';
      })
      .filter(Boolean);
  };

  const changeCourtImage = (courtId: string, imageCount: number, direction: 'prev' | 'next') => {
    if (imageCount <= 1) {
      return;
    }

    setActiveCourtImageIndexes((current) => {
      const currentIndex = current[courtId] ?? 0;
      const nextIndex = direction === 'next'
        ? (currentIndex + 1) % imageCount
        : (currentIndex - 1 + imageCount) % imageCount;

      return {
        ...current,
        [courtId]: nextIndex,
      };
    });
  };

  useEffect(() => {
    const fetchFacilityAndCourts = async () => {
      setLoading(true);
      try {
        const facilityRes = await apiClient.get<Facility>(`/api/facilities/${slug}`);
        setFacility(facilityRes.data);
        setActiveImageIndex(0);

        const courtsRes = await apiClient.get<CourtDtoPagedResult>(`/api/facilities/${slug}/courts`, {
          params: { PageNumber: 1, PageSize: 30 }
        });
        setCourts(courtsRes.data.items || []);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Nie udało się załadować szczegółów');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchFacilityAndCourts();
  }, [slug]);

  const imageUrls = getFacilityImageUrls(facility?.images);
  const currentImageUrl = imageUrls[activeImageIndex] || imageUrls[0] || null;

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Ładowanie szczegółów obiektu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-primary">Go Back</Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="facility-image-shell position-relative" style={{ width: '180px', borderRadius: '1rem', overflow: 'hidden' }}>
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={facility?.name || 'Facility'}
                className="facility-card-image"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400/e9ecef/6c757d?text=Sports+Facility';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div className="facility-card-image facility-card-placeholder d-flex align-items-center justify-content-center bg-secondary bg-opacity-10">
                <BsImages className="fs-1 text-secondary" />
              </div>
            )}

            {imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  className="facility-image-nav facility-image-nav-prev btn btn-dark btn-sm rounded-circle"
                  aria-label="Poprzednie zdjęcie"
                  onClick={() => changeImage('prev')}
                >
                  <BsChevronLeft />
                </button>
                <button
                  type="button"
                  className="facility-image-nav facility-image-nav-next btn btn-dark btn-sm rounded-circle"
                  aria-label="Następne zdjęcie"
                  onClick={() => changeImage('next')}
                >
                  <BsChevronRight />
                </button>
                <div className="facility-image-badge">
                  <BsImages className="me-1" /> {activeImageIndex + 1}/{imageUrls.length}
                </div>
              </>
            )}
          </div>

          <div>
            <h2 className="fw-bold mb-1">{facility?.name || 'Facility'}</h2>
            <p className="text-secondary mb-0">{facility?.address || 'Adres nie podany'}</p>
            <div className="d-flex gap-2 flex-wrap mt-2">
              <Badge bg="secondary" className="rounded-pill">{courts.length} kortów</Badge>
              <Badge bg="info" className="rounded-pill">{imageUrls.length} zdjęć</Badge>
            </div>
          </div>
        </div>
        <Link to="/" className="btn btn-outline-secondary btn-sm">Powrót do wyszukiwania</Link>
      </div>

      <h4 className="mb-3">Korty</h4>
      {courts.length === 0 ? (
        <Alert variant="info">Do tego obiektu nie przypisano jeszcze żadnych kortów.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {courts.map(court => {
            const courtSlug = court.slug || court.id;
            const courtImageUrls = getCourtImageUrls(court.images);
            const activeCourtImageIndex = activeCourtImageIndexes[court.id] ?? 0;
            const currentCourtImageUrl = courtImageUrls[activeCourtImageIndex] || courtImageUrls[0] || null;

            return (
              <Col key={court.id}>
                <Card className={`h-100 shadow-sm border-secondary ${!court.isActive ? 'opacity-50' : ''}`}>
                  <div className="facility-image-shell position-relative" style={{ height: '180px' }}>
                    {currentCourtImageUrl ? (
                      <img
                        src={currentCourtImageUrl}
                        alt={court.name || 'Court'}
                        className="facility-card-image"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/600x400/e9ecef/6c757d?text=Court';
                        }}
                      />
                    ) : (
                      <div className="facility-card-image facility-card-placeholder d-flex align-items-center justify-content-center bg-secondary bg-opacity-10">
                        <BsImages className="fs-1 text-secondary" />
                      </div>
                    )}

                    {courtImageUrls.length > 1 && (
                      <>
                        <button
                          type="button"
                          className="facility-image-nav facility-image-nav-prev btn btn-dark btn-sm rounded-circle"
                          aria-label="Poprzednie zdjęcie kortu"
                          onClick={() => changeCourtImage(court.id, courtImageUrls.length, 'prev')}
                        >
                          <BsChevronLeft />
                        </button>
                        <button
                          type="button"
                          className="facility-image-nav facility-image-nav-next btn btn-dark btn-sm rounded-circle"
                          aria-label="Następne zdjęcie kortu"
                          onClick={() => changeCourtImage(court.id, courtImageUrls.length, 'next')}
                        >
                          <BsChevronRight />
                        </button>
                        <div className="facility-image-badge">
                          <BsImages className="me-1" /> {activeCourtImageIndex + 1}/{courtImageUrls.length}
                        </div>
                      </>
                    )}
                  </div>

                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                      <Card.Title className="mb-0">{court.name || 'Unnamed Court'}</Card.Title>
                      <Badge bg={court.isActive ? 'success' : 'secondary'} className="rounded-pill">
                        {court.isActive ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                    </div>

                    <div className="text-secondary small mb-2">Nawierzchnia: {court.surfaceType || 'Brak informacji'}</div>
                    <div className="text-secondary small mb-3">Identyfikator: {court.id}</div>

                    <div className="d-grid">
                      <Link
                        to={`/obiekt/${encodeURIComponent(slug || facility?.slug || facility?.id || '')}/${encodeURIComponent(courtSlug)}/rezerwacje`}
                        className="btn btn-primary"
                      >
                        Rezerwacje
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}