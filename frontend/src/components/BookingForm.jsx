import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { getDoctors } from '../api';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function parseTime(timeStr) {
  if (!timeStr) return { hour: '09', minute: '00', ampm: 'AM' };
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: '09', minute: '00', ampm: 'AM' };
  return { hour: match[1].padStart(2, '0'), minute: match[2], ampm: match[3].toUpperCase() };
}

// Format phone as user types: xxx-xxx-xxxx
function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Validation helpers
function validatePhone(phone) {
  if (!phone) return true; // optional field
  return /^\d{3}-\d{3}-\d{4}$/.test(phone);
}

function validateEmail(email) {
  if (!email) return true; // optional field
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateDate(date) {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  // Must be a real date (year between 2000 and 2100)
  const year = d.getFullYear();
  return year >= 2000 && year <= 2100;
}

const EMPTY = {
  title: '', doctor_id: '', date: '',
  phone_number: '', email: '', status: 'pending', description: '',
};

export default function BookingForm({ editing, onSave, onCancel, loading }) {
  const [form, setForm] = useState(EMPTY);
  const [timeParts, setTimeParts] = useState({ hour: '09', minute: '00', ampm: 'AM' });
  const [doctors, setDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Load doctors from Neon via API
  useEffect(() => {
    getDoctors()
      .then((res) => {
        setDoctors(res.data);
        if (!editing && res.data.length > 0) {
          setForm((prev) => ({ ...prev, doctor_id: res.data[0].id }));
        }
      })
      .catch(() => setApiError('Could not load doctors list.'))
      .finally(() => setLoadingDocs(false));
  }, [editing]);

  useEffect(() => {
    if (editing) {
      setForm({ ...EMPTY, ...editing, doctor_id: editing.doctor_id || '' });
      setTimeParts(parseTime(editing.time));
    } else {
      setForm((prev) => ({ ...EMPTY, doctor_id: prev.doctor_id }));
      setTimeParts({ hour: '09', minute: '00', ampm: 'AM' });
    }
    setErrors({});
    setApiError('');
  }, [editing]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' })); // clear error on change
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setForm((prev) => ({ ...prev, phone_number: formatted }));
    setErrors((prev) => ({ ...prev, phone_number: '' }));
  };

  const setTime = (part) => (e) =>
    setTimeParts((prev) => ({ ...prev, [part]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Patient name is required.';
    if (!form.doctor_id) e.doctor_id = 'Please select a doctor.';
    if (!validateDate(form.date)) e.date = 'Enter a valid date (e.g. 2026-07-15).';
    if (!validatePhone(form.phone_number))
      e.phone_number = 'Format must be xxx-xxx-xxxx (e.g. 012-345-6789).';
    if (!validateEmail(form.email))
      e.email = 'Enter a valid email address with @ and domain.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const userId = editing?.user_id || 'user_' + Date.now();
    const builtTime = `${timeParts.hour}:${timeParts.minute} ${timeParts.ampm}`;
    onSave({ ...form, time: builtTime, user_id: userId });
  };

  return (
    <div className="panel-card">
      <p className="panel-title">{editing ? 'Edit appointment' : 'New appointment'}</p>

      {apiError && (
        <Alert variant="danger" className="py-2 px-3" style={{ fontSize: 13 }}>{apiError}</Alert>
      )}

      <Form onSubmit={handleSubmit} noValidate>

        {/* Patient name + Doctor */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Patient name *</Form.Label>
              <Form.Control
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Ahmad bin Razali"
                size="sm"
                isInvalid={!!errors.title}
              />
              <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Doctor / specialist *</Form.Label>
              <Form.Select
                value={form.doctor_id}
                onChange={set('doctor_id')}
                size="sm"
                disabled={loadingDocs}
                isInvalid={!!errors.doctor_id}
              >
                {loadingDocs ? (
                  <option>Loading doctors...</option>
                ) : (
                  <>
                    <option value="">Select a doctor</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} — {d.specialty}
                      </option>
                    ))}
                  </>
                )}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.doctor_id}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Date + Time */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Date *</Form.Label>
              <Form.Control
                type="date"
                value={form.date}
                onChange={set('date')}
                size="sm"
                min="2000-01-01"
                max="2100-12-31"
                isInvalid={!!errors.date}
              />
              <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Time *</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select value={timeParts.hour} onChange={setTime('hour')} size="sm">
                  {HOURS.map((h) => <option key={h}>{h}</option>)}
                </Form.Select>
                <Form.Select value={timeParts.minute} onChange={setTime('minute')} size="sm">
                  {MINUTES.map((m) => <option key={m}>{m}</option>)}
                </Form.Select>
                <Form.Select value={timeParts.ampm} onChange={setTime('ampm')} size="sm" style={{ maxWidth: 80 }}>
                  <option>AM</option>
                  <option>PM</option>
                </Form.Select>
              </div>
            </Form.Group>
          </Col>
        </Row>

        {/* Phone + Email */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Phone number</Form.Label>
              <Form.Control
                value={form.phone_number}
                onChange={handlePhoneChange}
                placeholder="012-345-6789"
                size="sm"
                maxLength={12}
                isInvalid={!!errors.phone_number}
              />
              <Form.Control.Feedback type="invalid">{errors.phone_number}</Form.Control.Feedback>
              <Form.Text className="text-muted" style={{ fontSize: 11 }}>Format: xxx-xxx-xxxx</Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                value={form.email}
                onChange={set('email')}
                placeholder="patient@email.com"
                size="sm"
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Status */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select value={form.status} onChange={set('status')} size="sm">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Notes */}
        <Form.Group className="mb-4">
          <Form.Label>Reason for visit / notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={form.description}
            onChange={set('description')}
            placeholder="Describe symptoms or reason for the appointment..."
            size="sm"
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={loading || loadingDocs}>
            {loading ? 'Saving…' : editing ? 'Save changes' : 'Add appointment'}
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
}
