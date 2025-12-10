
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connection string is provided by Render or .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);

export const initDb = async () => {
  const client = await pool.connect();
  try {
    // Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL,
        department VARCHAR(50) NOT NULL,
        avatar TEXT,
        password VARCHAR(100) -- Simple text for demo, use bcrypt in production
      );
    `);

    // Requests Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at BIGINT
      );
    `);

    // Seed Data if empty
    const { rows } = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(rows[0].count) === 0) {
      console.log('Seeding initial data...');
      
      // Seed Users
      const users = [
        ['u1', 'Mario Rossi', 'mario@azienda.it', 'Manager', 'MANAGEMENT', 'https://picsum.photos/seed/u1/200', 'admin'],
        ['u2', 'Luca Bianchi', 'luca@azienda.it', 'Dipendente', 'HELPDESK', 'https://picsum.photos/seed/u2/200', null],
        ['u3', 'Giulia Verdi', 'giulia@azienda.it', 'Dipendente', 'PREVENDITA', 'https://picsum.photos/seed/u3/200', null],
        ['u4', 'Sofia Esposito', 'sofia@azienda.it', 'Dipendente', 'COMMERCIALI', 'https://picsum.photos/seed/u4/200', null],
        ['u5', 'Alessandro Romano', 'ale@azienda.it', 'Dipendente', 'HELPDESK', 'https://picsum.photos/seed/u5/200', null],
        ['u6', 'Francesca Colombo', 'fra@azienda.it', 'Dipendente', 'COMMERCIALI', 'https://picsum.photos/seed/u6/200', null],
        ['u7', 'Matteo Ricci', 'matteo@azienda.it', 'Dipendente', 'PREVENDITA', 'https://picsum.photos/seed/u7/200', null],
        ['u8', 'Chiara Marino', 'chiara@azienda.it', 'Dipendente', 'HELPDESK', 'https://picsum.photos/seed/u8/200', null],
        ['u9', 'Lorenzo Greco', 'lorenzo@azienda.it', 'Dipendente', 'COMMERCIALI', 'https://picsum.photos/seed/u9/200', null],
        ['u10', 'Alice Bruno', 'alice@azienda.it', 'Dipendente', 'PREVENDITA', 'https://picsum.photos/seed/u10/200', null]
      ];

      for (const u of users) {
        await client.query(
          'INSERT INTO users (id, name, email, role, department, avatar, password) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          u
        );
      }

      // Seed Requests
      const now = Date.now();
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      const requests = [
        ['req1', 'u2', today, nextWeek, 'Approvato', 'Vacanza estiva', now],
        ['req2', 'u5', today, new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], 'In Attesa', 'Visita medica', now],
        ['req3', 'u4', nextWeek, twoWeeks, 'In Attesa', 'Matrimonio sorella', now]
      ];

      for (const r of requests) {
        await client.query(
          'INSERT INTO leave_requests (id, user_id, start_date, end_date, status, reason, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          r
        );
      }
    }

  } catch (err) {
    console.error('Error initializing DB', err);
  } finally {
    client.release();
  }
};
