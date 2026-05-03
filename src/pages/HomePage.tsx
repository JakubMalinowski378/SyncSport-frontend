import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  BsTrophyFill,
  BsDribbble,
  BsCheckCircle,
  BsClockHistory,
  BsBuilding,
  BsHourglassSplit,
  BsGeoAltFill,
  BsCalendarWeek,
  BsClock,
  BsExclamationCircle,
  BsCalendarCheck,
  BsCameraFill,
  BsChevronLeft,
  BsChevronRight,
  BsImages,
} from 'react-icons/bs';
import { useFacilities } from '../hooks/useFacilityQueries';
import type { OpeningHour } from '../services/facilityService';
import '../styles/home-page.css';

export default function HomePage() {
  const [activeImageIndexes, setActiveImageIndexes] = useState<Record<string, number>>({});
  const [page] = useState(1);

  const { data: facilitiesData, isLoading: loading, error: fetchError } = useFacilities({
    PageNumber: page,
    PageSize: 15,
  });

  const facilities = facilitiesData?.items || [];
  const totalCount = facilitiesData?.totalCount || 0;
  const error = fetchError instanceof Error ? fetchError.message : fetchError ? 'Nie udało się załadować obiektów' : null;

  const formatTime = (timeStr?: string) => {
    if (!timeStr || timeStr === '00:00:00') {
      return '-';
    }
    return timeStr.substring(0, 5);
  };

  const getDayNamePL = (englishDayName?: string) => {
    const dayMapping: { [key: string]: string } = {
      'Monday': 'pon',
      'Tuesday': 'wt',
      'Wednesday': 'śr',
      'Thursday': 'czw',
      'Friday': 'pt',
      'Saturday': 'sob',
      'Sunday': 'ndz',
    };
    return dayMapping[englishDayName || ''] || englishDayName?.substring(0, 3) || '';
  };

  const getPluralForm = (count: number, singular: string, fewForm: string, manyForm: string) => {
    const n = count % 100;
    const n10 = count % 10;

    if (n === 1) {
      return singular;
    } else if (n10 >= 2 && n10 <= 4 && (n < 10 || n > 20)) {
      return fewForm;
    } else {
      return manyForm;
    }
  };

  const getFacilityImageUrls = (images?: unknown[] | null) => {
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
          const url = record.url ?? record.imageUrl ?? record.src ?? record.path;
          return typeof url === 'string' ? url.trim() : '';
        }
        return '';
      })
      .filter(Boolean);
  };

  const changeImageIndex = (facilityId: string, imageCount: number, direction: 'prev' | 'next') => {
    if (imageCount <= 1) {
      return;
    }

    setActiveImageIndexes((current) => {
      const currentIndex = current[facilityId] ?? 0;
      const nextIndex = direction === 'next'
        ? (currentIndex + 1) % imageCount
        : (currentIndex - 1 + imageCount) % imageCount;

      return {
        ...current,
        [facilityId]: nextIndex,
      };
    });
  };

  const renderOpeningPreview = (openingHours?: OpeningHour[] | null) => {
    if (!openingHours || openingHours.length === 0) {
      return <span className="text-muted small">Brak informacji o godzinach</span>;
    }

    const daysToShow = openingHours.slice(0, 7);
    const firstOpenDay = openingHours.find((day) => !day.isClosed);

    return (
      <div className="hours-preview p-2">
        <div className="d-flex flex-wrap">
          {daysToShow.map((day) => (
            <span
              key={day.dayName}
              className={`day-badge me-1 mb-1 ${day.isClosed ? 'day-closed' : 'day-open'}`}
            >
              {getDayNamePL(day.dayName)}
            </span>
          ))}
          {openingHours.length > 7 && (
            <span className="day-badge bg-light text-secondary mb-1">+{openingHours.length - 7} więcej</span>
          )}
        </div>
        <div className="mt-2 small text-secondary">
          {firstOpenDay ? (
            <>
              <BsClock className="me-1" />
              np. {getDayNamePL(firstOpenDay.dayName)}: {formatTime(firstOpenDay.openTime)}-{formatTime(firstOpenDay.closeTime)}
            </>
          ) : (
            <span className="text-danger">
              <BsExclamationCircle className="me-1" />
              Czasowo zamknięte przez cały tydzień
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="container py-4 py-md-5 home-main">
      <section className="hero-gradient p-4 p-md-5 mb-5 shadow-sm">
        <Row className="align-items-center">
          <Col md={8}>
            <h1 className="display-5 fw-bold mb-3 d-flex align-items-center gap-2">
              <BsTrophyFill className="text-warning" />
              <span>SyncSport</span>
            </h1>
            <p className="lead fs-5 text-secondary">
              Znajdź i zarezerwuj halę sportową w swoim mieście. Dostępność w czasie rzeczywistym, elastyczne godziny i obiekty premium.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <Badge bg="success" className="bg-opacity-10 text-success rounded-pill px-3 py-2 fw-medium">
                <BsCheckCircle className="me-1" /> Obiekty zweryfikowane
              </Badge>
              <Badge bg="info" className="bg-opacity-10 text-info rounded-pill px-3 py-2 fw-medium">
                <BsClockHistory className="me-1" /> Miejsca w czasie rzeczywistym
              </Badge>
            </div>
          </Col>
          <Col md={4} className="text-center mt-4 mt-md-0">
            <BsDribbble style={{ fontSize: '4.5rem', opacity: 0.7 }} />
          </Col>
        </Row>
      </section>

      <section>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 className="h3 fw-semibold mb-0 d-flex align-items-center gap-2">
            <BsBuilding /> Wszystkie obiekty
          </h2>
          <span className="badge bg-secondary bg-opacity-25 text-dark rounded-pill px-3 py-2">
            <BsBuilding className="me-1" /> {loading ? 'Ładowanie obiektów...' : `${totalCount || facilities.length} ${getPluralForm(totalCount || facilities.length, 'obiekt', 'obiekty', 'obiektów')}`}
          </span>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" className="text-primary" />
          </div>
        ) : facilities.length === 0 ? (
          <Alert variant="light" className="text-center py-5">W tej chwili nie ma dostępnych obiektów.</Alert>
        ) : (
          <Row className="g-4">
            {facilities.map((facility) => {
              const imageUrls = getFacilityImageUrls(facility.images);
              const activeImageIndex = activeImageIndexes[facility.id] ?? 0;
              const imageUrl = imageUrls[activeImageIndex] || imageUrls[0] || null;
              const durationLabel = facility.reservationDuration ? `${facility.reservationDuration} minutowe rezerwacje` : 'Elastyczne sloty';
              const hasMultipleImages = imageUrls.length > 1;

              return (
                <Col key={facility.id} md={6} lg={4}>
                  <Card className="facility-card h-100 shadow-sm">
                    <div className="facility-image-shell position-relative">
                      {imageUrl ? (
                        <img
                          className="facility-card-image"
                          src={imageUrl}
                          alt={facility.name || 'Facility image'}
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/600x400/e9ecef/6c757d?text=Sports+Facility';
                          }}
                        />
                      ) : (
                        <div className="facility-card-image facility-card-placeholder d-flex align-items-center justify-content-center bg-secondary bg-opacity-10">
                          <BsCameraFill className="fs-1 text-secondary" />
                          <span className="ms-2 small">Brak obrazu</span>
                        </div>
                      )}

                      {hasMultipleImages && (
                        <>
                          <button
                            type="button"
                            className="facility-image-nav facility-image-nav-prev btn btn-dark btn-sm rounded-circle"
                            aria-label="Poprzednie zdjęcie"
                            onClick={() => changeImageIndex(facility.id, imageUrls.length, 'prev')}
                          >
                            <BsChevronLeft />
                          </button>
                          <button
                            type="button"
                            className="facility-image-nav facility-image-nav-next btn btn-dark btn-sm rounded-circle"
                            aria-label="Następne zdjęcie"
                            onClick={() => changeImageIndex(facility.id, imageUrls.length, 'next')}
                          >
                            <BsChevronRight />
                          </button>
                          <div className="facility-image-badge">
                            <BsImages className="me-1" /> {activeImageIndex + 1}/{imageUrls.length}
                          </div>
                        </>
                      )}
                    </div>

                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <h5 className="card-title fw-bold fs-5 mb-0">{facility.name || 'Obiekt bez nazwy'}</h5>
                        <span className="badge-duration rounded-pill">
                          <BsHourglassSplit className="me-1" /> {durationLabel}
                        </span>
                      </div>

                      <div className="mb-2 text-secondary small">
                        <BsGeoAltFill className="me-1" /> {facility.address || 'Adres nie podany'}
                      </div>

                      <div className="mt-2">
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <BsCalendarWeek className="text-primary" />
                          <span className="small fw-semibold">Harmonogram otwarcia</span>
                        </div>
                        {renderOpeningPreview(facility.openingHours)}
                      </div>

                      <div className="mt-3 d-grid">
                        <Link to={`/obiekt/${encodeURIComponent(facility.slug || facility.id)}`} className="btn btn-outline-primary rounded-pill">
                          <BsCalendarCheck className="me-1" /> Zobacz boiska
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </section>
    </main>
  );
}
