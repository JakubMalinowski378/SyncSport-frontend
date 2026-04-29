import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Card, Alert, Button, Spinner, Badge, Table } from 'react-bootstrap';
import { BsChevronLeft, BsChevronRight, BsImages } from 'react-icons/bs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/pl';
dayjs.extend(utc);
dayjs.extend(isoWeek);
dayjs.locale('pl');
import apiClient from '../services/apiClient';
import ReservationModal from '../components/modals/ReservationModal';

interface CourtImage {
  url: string;
  isMain?: boolean;
}

interface Court {
  id: string;
  name: string | null;
  slug: string | null;
  surfaceType: string | null;
  isActive: boolean;
  images?: CourtImage[] | null;
}

interface Slot {
  reservationId: string | null;
  startTime: string;
  endTime: string;
  isReserved: boolean;
  status: number;
}

interface DaySlots {
  date: string;
  dayOfWeek: number;
  slots: Slot[];
}

interface WeekReservations {
  weekStartDate: string;
  weekEndDate: string;
  days: DaySlots[];
}

export default function ReservationPage() {
  const { facilitySlug, courtSlug } = useParams<{ facilitySlug: string; courtSlug: string }>();

  const [court, setCourt] = useState<Court | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<dayjs.Dayjs>(dayjs().startOf('isoWeek'));
  const [weekReservations, setWeekReservations] = useState<WeekReservations | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{startTime: string; endTime: string} | null>(null);

  const getCourtImageUrls = (images?: CourtImage[] | null) => {
    if (!images || images.length === 0) {
      return [] as string[];
    }

    const normalizedImages = images
      .map((img) => img?.url?.trim() || '')
      .filter(Boolean);

    const mainImageIndex = images.findIndex((img) => img.isMain === true && !!img.url?.trim());

    if (mainImageIndex <= 0) {
      return normalizedImages;
    }

    const mainImageUrl = images[mainImageIndex].url.trim();

    return [
      mainImageUrl,
      ...normalizedImages.filter((url) => url !== mainImageUrl),
    ];
  };

  const changeImage = (direction: 'prev' | 'next') => {
    const imageUrls = getCourtImageUrls(court?.images);
    if (imageUrls.length <= 1) {
      return;
    }

    setActiveImageIndex((current) => (
      direction === 'next'
        ? (current + 1) % imageUrls.length
        : (current - 1 + imageUrls.length) % imageUrls.length
    ));
  };

  useEffect(() => {
    const fetchCourtAndReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const facilityRes = await apiClient.get<any>(`/api/facilities/${facilitySlug}`);
        setFacilityId(facilityRes.data.id);

        const courtRes = await apiClient.get<Court>(
          `/api/facilities/${facilitySlug}/courts/${courtSlug}`
        );
        setCourt(courtRes.data);
        setActiveImageIndex(0);

        if (courtRes.data.id) {
          const weekDate = weekStart.format('YYYY-MM-DD');
          const weekData = await apiClient.get<WeekReservations>(
            `/api/reservations/courts/${courtRes.data.id}`,
            {
              params: {
                weekDate,
              }
            }
          );
          setWeekReservations(weekData.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Nie udało się załadować danych rezerwacji');
      } finally {
        setLoading(false);
      }
    };

    if (facilitySlug && courtSlug) {
      fetchCourtAndReservations();
    }
  }, [facilitySlug, courtSlug, weekStart]);

  const canGoToPrevWeek = weekStart.isAfter(dayjs().startOf('isoWeek'));

  const changeWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (!canGoToPrevWeek) return;
      setWeekStart((current) => current.subtract(1, 'week'));
      return;
    }
    setWeekStart((current) => current.add(1, 'week'));
  };


  const imageUrls = getCourtImageUrls(court?.images);
  const currentImageUrl = imageUrls[activeImageIndex] || imageUrls[0] || null;

  const getDayName = (date: string) => {
    return dayjs(date).locale('pl').format('dddd');
  };

  const getDayDate = (date: string) => {
    return dayjs(date).format('DD.MM');
  };

  const handleSlotClick = (slot: Slot) => {
    if (slot.isReserved) return;
    setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime });
    setShowModal(true);
  };

  return (
    <Container className="py-4 py-md-5">
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" className="text-primary" />
          <p className="mt-2">Ładowanie szczegółów kortu...</p>
        </div>
      ) : error ? (
        <Alert variant="danger" className="mb-4">{error}</Alert>
      ) : (
        <>
          <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="h3 fw-bold mb-1">{court?.name || 'Kort'}</h1>
              <p className="text-secondary mb-0">{court?.surfaceType || 'Nawierzchnia'}</p>
            </div>
            <Link to={`/obiekt/${encodeURIComponent(facilitySlug || '')}`} className="btn btn-outline-secondary btn-sm">
              Powrót
            </Link>
          </div>

          {currentImageUrl && (
            <Card className="mb-4 shadow-sm border-secondary bg-card overflow-hidden">
              <div className="facility-image-shell position-relative" style={{ height: '280px' }}>
                <img
                  src={currentImageUrl}
                  alt={court?.name || 'Court'}
                  className="facility-card-image"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x400/e9ecef/6c757d?text=Court';
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

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
            </Card>
          )}

          <Card className="shadow-sm border-secondary bg-card mb-4">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h5 className="mb-0 fw-bold">Wybierz tydzień</h5>
                <div className="d-flex gap-2">
                  
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => changeWeek('prev')}
                    disabled={!canGoToPrevWeek}
                    title="Poprzedni tydzień"
                  >
                    <BsChevronLeft />
                  </Button>
                  <span className="px-3 py-2 text-secondary fw-semibold">
                    {weekStart.locale('pl').format('DD MMMM')} - {weekStart.add(6, 'days').locale('pl').format('DD MMMM YYYY')}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => changeWeek('next')}
                    title="Następny tydzień"
                  >
                    <BsChevronRight />
                  </Button>
                  </div>
              </div>
              {weekReservations && weekReservations!.days.length > 0 ? (
                  <div className="table-responsive">
                    <Table className="mb-0 text-center align-middle">
                      <thead className="table-light">
                        <tr>
                        {weekReservations!.days.map((day) => (
                          <th key={day.date} className="py-3 px-2">
                            <div className="fw-bold text-capitalize">{getDayName(day.date)}</div>
                            <div className="text-secondary small">{getDayDate(day.date)}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const allTimes = new Set<string>();
                        weekReservations!.days.forEach((day) => {
                          day.slots.forEach((slot) => {
                            if (slot.startTime && dayjs(slot.startTime).isValid()) {
                              const t = dayjs(slot.startTime).format('HH:mm');
                              allTimes.add(t);
                            }
                          });
                        });

                        const sortedTimes = Array.from(allTimes).sort();

                        return sortedTimes.map((time) => (
                          <tr key={time}>
                            {weekReservations!.days.map((day) => {
                              const slot = day.slots.find(
                                (s) => s.startTime && dayjs(s.startTime).isValid() && dayjs(s.startTime).format('HH:mm') === time
                              );

                              if (!slot) {
                                return <td key={`${day.date}-${time}`} className="py-2 px-1"></td>;
                              }

                              return (
                                <td key={`${day.date}-${time}`} className="py-2 px-1">
                                  <Badge
                                    bg={slot.isReserved ? 'danger' : 'success'}
                                    className="w-100 py-2"
                                    style={{ 
                                      fontSize: '0.85rem', 
                                      cursor: slot.isReserved ? 'not-allowed' : 'pointer' 
                                    }}
                                    onClick={() => handleSlotClick(slot)}
                                  >
                                    {time}
                                    <br />
                                    {slot.isReserved ? 'Zajęte' : 'Wolne'}
                                  </Badge>
                                </td>
                              );
                            })}
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info" className="mb-0">
                  Brak danych dostępności na wybrany tydzień.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {court && facilityId && (
            <ReservationModal
              show={showModal}
              onHide={() => setShowModal(false)}
              facilityId={facilityId}
              courtId={court.id}
              slot={selectedSlot}
            />
          )}
        </>
      )}
    </Container>
  );
}