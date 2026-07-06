import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Toast, ToastContainer } from 'react-bootstrap';
import { getBooking, createBooking, updateBooking, getDoctors } from '../api';
import BookingForm from '../components/BookingForm';

export default function AppointmentPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing: /appointment/5
  const isEditing = Boolean(id);

  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [toast, setToast] = useState({ show: false, msg: '', variant: 'danger' });

  // If editing, load the existing booking
  useEffect(() => {
    if (!isEditing) return;
    getBooking(id)
      .then((res) => setEditing(res.data))
      .catch(() => setToast({ show: true, msg: 'Could not load appointment.', variant: 'danger' }))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      if (isEditing) {
        await updateBooking(id, formData);
      } else {
        await createBooking(formData);
      }
      // Go back to dashboard with ?saved=1 so it shows a toast there
      navigate('/?saved=1');
    } catch (err) {
      setToast({
        show: true,
        msg: err.response?.data?.error || 'Something went wrong.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Back button + page title */}
      <div className="form-page-header">
        <a href="/" className="back-btn" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          ← Back
        </a>
        <div>
          <div className="page-title">{isEditing ? 'Edit appointment' : 'New appointment'}</div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            {isEditing ? 'Update the appointment details below' : 'Fill in the details to book an appointment'}
          </div>
        </div>
      </div>

      {fetching ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : (
        <BookingForm
          editing={editing}
          onSave={handleSave}
          onCancel={() => navigate('/')}
          loading={loading}
        />
      )}

      <ToastContainer className="toast-container" position="bottom-end">
        <Toast
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
          delay={4000}
          autohide
          bg={toast.variant}
        >
          <Toast.Body style={{ color: '#fff', fontSize: 13 }}>{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
