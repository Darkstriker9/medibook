import React from 'react';
import { Row, Col } from 'react-bootstrap';

export default function StatsRow({ bookings }) {
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const cancelled = bookings.filter((b) => b.status === 'cancelled').length;

  const stats = [
    { label: 'Total appointments', value: total, color: '#0d6efd' },
    { label: 'Confirmed', value: confirmed, color: '#198754' },
    { label: 'Pending', value: pending, color: '#e6a817' },
    { label: 'Cancelled', value: cancelled, color: '#dc3545' },
  ];

  return (
    <Row className="g-3 mb-4">
      {stats.map((s) => (
        <Col xs={6} md={3} key={s.label}>
          <div className="stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        </Col>
      ))}
    </Row>
  );
}
