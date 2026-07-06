import React from 'react';
import { Badge, Button } from 'react-bootstrap';

const STATUS_VARIANT = { confirmed: 'success', pending: 'warning', cancelled: 'danger' };

export default function BookingCard({ booking, onEdit, onDelete }) {
  const { id, title, doctor_name, doctor_specialty, date, time, phone_number, email, status, description } = booking;

  const doctorLabel = doctor_name
    ? `${doctor_name}${doctor_specialty ? ` — ${doctor_specialty}` : ''}`
    : 'No doctor assigned';

  return (
    <div className="booking-card">
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <div className="patient-name">{title}</div>
          <div className="doctor-name">{doctorLabel}</div>
        </div>
        <div className="d-flex gap-1 flex-shrink-0">
          <Button
            variant="outline-secondary"
            size="sm"
            style={{ padding: '3px 10px', fontSize: 12, borderRadius: 8 }}
            onClick={() => onEdit(booking)}
          >
            Edit
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            style={{ padding: '3px 10px', fontSize: 12, borderRadius: 8 }}
            onClick={() => onDelete(id)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="meta-row">
        <span>{date}</span>
        <span className="meta-dot" />
        <span>{time}</span>
        {phone_number && <><span className="meta-dot" /><span>{phone_number}</span></>}
        {email && <><span className="meta-dot" /><span>{email}</span></>}
        <Badge
          bg={STATUS_VARIANT[status] || 'secondary'}
          style={{ fontSize: 11, borderRadius: 20, padding: '3px 10px' }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {description && <div className="booking-desc">{description}</div>}
    </div>
  );
}
