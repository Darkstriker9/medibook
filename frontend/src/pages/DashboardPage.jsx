import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form, InputGroup, Toast, ToastContainer, Modal } from 'react-bootstrap';
import { getBookings, deleteBooking } from '../api';
import BookingCard from '../components/BookingCard';
import StatsRow from '../components/StatsRow';

const FILTERS = ['all', 'confirmed', 'pending', 'cancelled'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [toast, setToast] = useState({ show: false, msg: '', variant: 'success' });
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const fetchBookings = useCallback(async () => {
    try {
      setFetching(true); setFetchError('');
      const res = await getBookings();
      setBookings(res.data);
    } catch {
      setFetchError('Could not reach the API. Is the backend running?');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    const params = new URLSearchParams(window.location.search);
    if (params.get('saved')) {
      setToast({ show: true, msg: 'Appointment saved!', variant: 'success' });
      window.history.replaceState({}, '', '/');
    }
  }, [fetchBookings]);

  const confirmDelete = async () => {
    try {
      await deleteBooking(deleteModal.id);
      setDeleteModal({ show: false, id: null });
      setToast({ show: true, msg: 'Appointment deleted.', variant: 'danger' });
      fetchBookings();
    } catch {
      setToast({ show: true, msg: 'Could not delete.', variant: 'danger' });
    }
  };

  const visible = bookings.filter((b) => {
    const matchFilter = filter === 'all' || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      b.title.toLowerCase().includes(q) ||
      (b.doctor_name || '').toLowerCase().includes(q) ||
      b.date.includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="page-wrapper">

      {/* ── Hero banner ── */}
      <div className="hero-banner">
        {/* Left image — magnifying glass / healthcare icon */}
        <img
          src="/hero-left.jpg"
          alt="Healthcare"
          className="hero-img left"
        />

        {/* Centre text */}
        <div className="hero-center">
          <div className="hero-title">Your Health, Our Priority</div>
          <div className="hero-sub">
            Book appointments with our specialist doctors quickly and easily.
            Manage your healthcare schedule all in one place.
          </div>
          <button className="hero-btn" onClick={() => navigate('/appointment')}>
            + Book an appointment
          </button>
        </div>

        {/* Right image — doctor figure */}
        <img
          src="/hero-right.jpg"
          alt="Doctor"
          className="hero-img right"
        />
      </div>

      {/* ── Page heading ── */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <div className="page-title">Appointments</div>
          <div className="page-sub">Manage all healthcare bookings</div>
        </div>
        <Button variant="primary" onClick={() => navigate('/appointment')}>
          + New appointment
        </Button>
      </div>

      {fetchError && <div className="banner-error">{fetchError}</div>}

      <StatsRow bookings={bookings} />

      <div className="panel-card">
        <div className="panel-title">All appointments</div>

        <InputGroup className="mb-3" size="sm">
          <Form.Control
            placeholder="Search by patient, doctor, or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Button variant="outline-secondary" onClick={() => setSearch('')}>Clear</Button>
          )}
        </InputGroup>

        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {fetching ? (
          <div className="empty-state"><p>Loading appointments...</p></div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No appointments found.</p>
            <Button variant="primary" size="sm" onClick={() => navigate('/appointment')}>
              Add first appointment
            </Button>
          </div>
        ) : (
          visible.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onEdit={() => navigate(`/appointment/${b.id}`)}
              onDelete={(id) => setDeleteModal({ show: true, id })}
            />
          ))
        )}
      </div>

      {/* Delete modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: null })} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: 16 }}>Delete appointment?</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: 14, color: '#495057' }}>
          This will permanently remove the appointment record.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" size="sm" onClick={confirmDelete}>Delete</Button>
          <Button variant="outline-secondary" size="sm" onClick={() => setDeleteModal({ show: false, id: null })}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer className="toast-container" position="bottom-end">
        <Toast show={toast.show} onClose={() => setToast(t => ({ ...t, show: false }))} delay={3000} autohide bg={toast.variant}>
          <Toast.Body style={{ color: '#fff', fontSize: 13 }}>{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
