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
  BsGeoAlt,
  BsTelephone,
  BsEnvelope,
  BsCameraFill,
} from 'react-icons/bs';
import apiClient from '../services/apiClient';
import '../styles/home-page.css';

interface Facility {
  id: string;
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
      setError(err.response?.data?.detail || 'Failed to fetch facilities');
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
      return <span className="text-muted small">No hours info</span>;
    }

    const daysToShow = openingHours.slice(0, 5);
    const firstOpenDay = openingHours.find((day) => !day.isClosed);

    return (
      <div className="hours-preview p-2">
        <div className="d-flex flex-wrap">
          {daysToShow.map((day) => (
            <span
              key={day.dayName}
              className={`day-badge me-1 mb-1 ${day.isClosed ? 'day-closed' : 'day-open'}`}
            >
              {day.dayName.substring(0, 3)}
            </span>
          ))}
          {openingHours.length > 5 && (
            <span className="day-badge bg-light text-secondary mb-1">+{openingHours.length - 5} more</span>
          )}
        </div>
        <div className="mt-2 small text-secondary">
          {firstOpenDay ? (
            <>
              <BsClock className="me-1" />
              e.g. {firstOpenDay.dayName}: {formatTime(firstOpenDay.openTime)}-{formatTime(firstOpenDay.closeTime)}
            </>
          ) : (
            <span className="text-danger">
              <BsExclamationCircle className="me-1" />
              Temporarily closed all week
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
              <span>sport.courts</span>
            </h1>
            <p className="lead fs-5 text-secondary">
              Find and reserve indoor and outdoor courts in your city. Real-time availability, flexible hours, and premium facilities.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-3">
              <Badge bg="success" className="bg-opacity-10 text-success rounded-pill px-3 py-2 fw-medium">
                <BsCheckCircle className="me-1" /> Verified facilities
              </Badge>
              <Badge bg="info" className="bg-opacity-10 text-info rounded-pill px-3 py-2 fw-medium">
                <BsClockHistory className="me-1" /> Real-time slots
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
            <BsBuilding /> All facilities
          </h2>
          <span className="badge bg-secondary bg-opacity-25 text-dark rounded-pill px-3 py-2">
            <BsBuilding className="me-1" /> {loading ? 'Loading facilities...' : `${totalCount || facilities.length} facilities`}
          </span>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" className="text-primary" />
          </div>
        ) : facilities.length === 0 ? (
          <Alert variant="light" className="text-center py-5">No facilities available at the moment.</Alert>
        ) : (
          <Row className="g-4">
            {facilities.map((facility) => {
              const imageUrl = getMainImageUrl(facility.images);
              const durationLabel = facility.reservationDuration ? `${facility.reservationDuration} min slots` : 'Flexible slots';

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
                        <span className="ms-2 small">No image</span>
                      </div>
                    )}

                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                        <h5 className="card-title fw-bold fs-5 mb-0">{facility.name || 'Unnamed facility'}</h5>
                        <span className="badge-duration rounded-pill">
                          <BsHourglassSplit className="me-1" /> {durationLabel}
                        </span>
                      </div>

                      <div className="mb-2 text-secondary small">
                        <BsGeoAltFill className="me-1" /> {facility.address || 'No address provided'}
                      </div>

                      <div className="mt-2">
                        <div className="d-flex align-items-center gap-1 mb-1">
                          <BsCalendarWeek className="text-primary" />
                          <span className="small fw-semibold">Opening schedule</span>
                        </div>
                        {renderOpeningPreview(facility.openingHours)}
                      </div>

                      <div className="mt-3 d-grid">
                        <Link to={`/facility/${facility.id}`} className="btn btn-outline-primary rounded-pill">
                          <BsCalendarCheck className="me-1" /> Check availability
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

      <section className="mt-5 pt-4 border-top text-center text-secondary">
        <Row>
          <Col md={6} className="text-md-start mb-3 mb-md-0">
            <BsGeoAlt className="text-primary me-1" /> Green Meadows Sports District
          </Col>
          <Col md={6} className="text-md-end">
            <span className="me-3 d-inline-block">
              <BsTelephone className="me-1" /> +48 22 123 45 67
            </span>
            <span className="d-inline-block">
              <BsEnvelope className="me-1" /> booking@sportcourts.com
            </span>
          </Col>
        </Row>
        <div className="mt-3 small">© 2025 SportCourts - smart facility reservation system</div>
      </section>
    </main>
  );
}
