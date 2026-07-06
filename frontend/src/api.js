import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// ── Doctors ──────────────────────────────────────────────────
export const getDoctors = () => API.get('/doctors');
export const getDoctor = (id) => API.get(`/doctors/${id}`);
export const createDoctor = (data) => API.post('/doctors', data);
export const updateDoctor = (id, data) => API.put(`/doctors/${id}`, data);
export const deleteDoctor = (id) => API.delete(`/doctors/${id}`);

// ── Bookings ─────────────────────────────────────────────────
export const getBookings = (params = {}) => API.get('/bookings', { params });
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const createBooking = (data) => API.post('/bookings', data);
export const updateBooking = (id, data) => API.put(`/bookings/${id}`, data);
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);
