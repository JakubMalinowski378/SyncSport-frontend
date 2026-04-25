import { useState, useEffect } from 'react';
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
} from 'react-icons/bs';
import apiClient from '../services/apiClient';
import '../styles/home-page.css';

interface Facility {
  id: string;
  slug: string | null;
  name: string | null;
  address: string | null;
  reservationDuration?: number | null;
  openingHours?: OpeningHour[] | null;
  images?: (string | FacilityImage)[] | null;
}

interface FacilityImage {
  url: string;
  isMain?: boolean;
}

interface OpeningHour {
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface GetFacilitiesResponsePagedResult {
  items: Facility[] | null;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export default function HomePage() {
  const [totalCount, setTotalCount] = useState(0);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<GetFacilitiesResponsePagedResult>('/api/facilities', {
        params: {
          PageNumber: 1,
          PageSize: 15,
        },
      });
      setFacilities(res.data.items || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Nie udało się załadować obiektów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

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

  const getMainImageUrl = (images?: (string | FacilityImage)[] | null) => {
    if (!images || images.length === 0) {
      return null;
    }

    const firstObjectImage = images.find((img): img is FacilityImage => typeof img !== 'string' && !!img?.url);
    if (firstObjectImage) {
      const mainObjectImage = images.find((img): img is FacilityImage => typeof img !== 'string' && img.isMain === true && !!img.url);
      return (mainObjectImage || firstObjectImage).url;
    }

    const firstStringImage = images.find((img): img is string => typeof img === 'string' && img.length > 0);
    return firstStringImage || null;
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
              const imageUrl = getMainImageUrl(facility.images);
              const durationLabel = facility.reservationDuration ? `${facility.reservationDuration} min rezerwacji` : 'Elastyczne sloty';

              return (
                <Col key={facility.id} md={6} lg={4}>
                  <Card className="facility-card h-100 shadow-sm">
                    {imageUrl ? (
                      <Card.Img
                        className="card-img-top"
                        src={imageUrl}
                        alt={facility.name || 'Facility image'}
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/600x400/e9ecef/6c757d?text=Sports+Facility';
                        }}
                      />
                    ) : (
                      <div className="card-img-top d-flex align-items-center justify-content-center bg-secondary bg-opacity-10">
                        <BsCameraFill className="fs-1 text-secondary" />
                        <span className="ms-2 small">Brak obrazu</span>
                      </div>
                    )}

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
                        <Link to={`/facility/${encodeURIComponent(facility.slug || facility.id)}`} className="btn btn-outline-primary rounded-pill">
                          <BsCalendarCheck className="me-1" /> Sprawdź dostępność
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
