import { Card, Row, Col, Form } from 'react-bootstrap';

export type EnglishDayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface OpeningHour {
  dayName: EnglishDayName;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DAY_ORDER: EnglishDayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const DAY_LABELS_PL: Record<EnglishDayName, string> = {
  Monday: 'Poniedzialek',
  Tuesday: 'Wtorek',
  Wednesday: 'Sroda',
  Thursday: 'Czwartek',
  Friday: 'Piatek',
  Saturday: 'Sobota',
  Sunday: 'Niedziela'
};

export const createDefaultOpeningHours = (
  openTime: string,
  closeTime: string
): OpeningHour[] => DAY_ORDER.map(dayName => ({
  dayName,
  openTime,
  closeTime,
  isClosed: false
}));

interface FacilityOpeningHoursEditorProps {
  openingHours: OpeningHour[];
  onChange: (hours: OpeningHour[]) => void;
  title?: string;
}

const normalizeOpeningHours = (openingHours: OpeningHour[]): OpeningHour[] => {
  return DAY_ORDER.map(dayName => {
    const existing = openingHours.find(hour => hour.dayName === dayName);
    if (existing) {
      return existing;
    }

    return {
      dayName,
      openTime: '08:00',
      closeTime: '22:00',
      isClosed: false
    };
  });
};

export default function FacilityOpeningHoursEditor({
  openingHours,
  onChange,
  title = 'Godziny otwarcia'
}: FacilityOpeningHoursEditorProps) {
  const orderedHours = normalizeOpeningHours(openingHours);

  const updateHour = (dayName: EnglishDayName, field: keyof OpeningHour, value: string | boolean) => {
    onChange(
      orderedHours.map(hour => {
        if (hour.dayName !== dayName) {
          return hour;
        }

        return {
          ...hour,
          [field]: value
        };
      })
    );
  };

  return (
    <Card className="bg-card border-secondary text-body mb-3 mt-3">
      <Card.Header className="bg-card border-secondary fw-bold text-body">{title}</Card.Header>
      <Card.Body>
        {orderedHours.map(hour => (
          <Row key={hour.dayName} className="mb-2 align-items-center">
            <Col xs={4} md={3} className="fw-semibold">
              {DAY_LABELS_PL[hour.dayName]}
            </Col>
            <Col xs={4} md={3}>
              <Form.Control
                type="time"
                value={hour.openTime}
                onChange={e => updateHour(hour.dayName, 'openTime', e.target.value)}
                disabled={hour.isClosed}
                className="bg-card text-body border-secondary"
              />
            </Col>
            <Col xs={4} md={3}>
              <Form.Control
                type="time"
                value={hour.closeTime}
                onChange={e => updateHour(hour.dayName, 'closeTime', e.target.value)}
                disabled={hour.isClosed}
                className="bg-card text-body border-secondary"
              />
            </Col>
            <Col xs={12} md={3} className="mt-2 mt-md-0 d-flex align-items-center">
              <Form.Check
                type="switch"
                label="Zamkniete"
                checked={hour.isClosed}
                onChange={e => updateHour(hour.dayName, 'isClosed', e.target.checked)}
              />
            </Col>
          </Row>
        ))}
      </Card.Body>
    </Card>
  );
}