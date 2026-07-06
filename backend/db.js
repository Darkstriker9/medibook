const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in .env — paste your Neon connection string there.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Could not connect to Neon database:', err.message);
    return;
  }
  console.log('Connected to Neon PostgreSQL.');
  release();
});

const initDB = async () => {
  try {
    // Doctors table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        specialty  VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Bookings table — doctor_id is a foreign key to doctors
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(255) NOT NULL,
        description  TEXT,
        date         VARCHAR(50)  NOT NULL,
        time         VARCHAR(50)  NOT NULL,
        phone_number VARCHAR(50),
        email        VARCHAR(255),
        user_id      VARCHAR(100),
        doctor_id    INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
        status       VARCHAR(50)  DEFAULT 'pending',
        created_at   TIMESTAMP    DEFAULT NOW()
      );
    `);

    console.log('Tables ready (doctors + bookings).');
  } catch (err) {
    console.error('Error creating tables:', err.message);
  }
};

initDB();

module.exports = pool;
