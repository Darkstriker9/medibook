const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'MediBook API is running.', database: 'Neon PostgreSQL' });
});

// ══════════════════════════════════════════════════════════════
// DOCTORS
// ══════════════════════════════════════════════════════════════

// GET all doctors
app.get('/doctors', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctors ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET single doctor
app.get('/doctors/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST create doctor
app.post('/doctors', async (req, res) => {
  try {
    const { name, specialty } = req.body;
    if (!name || !specialty) return res.status(400).json({ error: 'name and specialty are required.' });
    const result = await pool.query(
      'INSERT INTO doctors (name, specialty) VALUES ($1, $2) RETURNING *',
      [name, specialty]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT update doctor
app.put('/doctors/:id', async (req, res) => {
  try {
    const { name, specialty } = req.body;
    const existing = await pool.query('SELECT * FROM doctors WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Doctor not found.' });
    const current = existing.rows[0];
    const result = await pool.query(
      'UPDATE doctors SET name = $1, specialty = $2 WHERE id = $3 RETURNING *',
      [name ?? current.name, specialty ?? current.specialty, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE doctor
app.delete('/doctors/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM doctors WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Doctor not found.' });
    res.json({ message: 'Doctor deleted.', deleted: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ══════════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════════

// GET all bookings — optional ?status=  ?user_id=
app.get('/bookings', async (req, res) => {
  try {
    const { status, user_id } = req.query;
    let query = `
      SELECT b.*, d.name AS doctor_name, d.specialty AS doctor_specialty
      FROM bookings b
      LEFT JOIN doctors d ON b.doctor_id = d.id
    `;
    const values = [];
    const conditions = [];
    if (status) { conditions.push(`b.status = $${values.length + 1}`); values.push(status); }
    if (user_id) { conditions.push(`b.user_id = $${values.length + 1}`); values.push(user_id); }
    if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');
    query += ' ORDER BY b.created_at DESC';
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET single booking
app.get('/bookings/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, d.name AS doctor_name, d.specialty AS doctor_specialty
       FROM bookings b
       LEFT JOIN doctors d ON b.doctor_id = d.id
       WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST create booking
app.post('/bookings', async (req, res) => {
  try {
    const { title, description, date, time, phone_number, email, user_id, doctor_id, status } = req.body;
    if (!title || !date || !time) return res.status(400).json({ error: 'title, date, and time are required.' });
    const result = await pool.query(
      `INSERT INTO bookings (title, description, date, time, phone_number, email, user_id, doctor_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, date, time, phone_number, email, user_id, doctor_id, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT update booking
app.put('/bookings/:id', async (req, res) => {
  try {
    const { title, description, date, time, phone_number, email, user_id, doctor_id, status } = req.body;
    const existing = await pool.query('SELECT * FROM bookings WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    const c = existing.rows[0];
    const result = await pool.query(
      `UPDATE bookings
       SET title=$1, description=$2, date=$3, time=$4,
           phone_number=$5, email=$6, user_id=$7, doctor_id=$8, status=$9
       WHERE id=$10 RETURNING *`,
      [
        title ?? c.title, description ?? c.description, date ?? c.date, time ?? c.time,
        phone_number ?? c.phone_number, email ?? c.email, user_id ?? c.user_id,
        doctor_id ?? c.doctor_id, status ?? c.status, req.params.id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE booking
app.delete('/bookings/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ message: 'Booking deleted.', deleted: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = app;
