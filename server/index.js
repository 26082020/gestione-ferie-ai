
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, initDb } from './db.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

// Email Transporter (Configure vars in Render or .env)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your provider
  auth: {
    user: process.env.EMAIL_USER, // e.g., your gmail
    pass: process.env.EMAIL_PASS  // your app password
  }
});

const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Ferie Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};

// API Routes

// Login
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    if (user.role !== role) return res.status(403).json({ error: 'Ruolo non corrispondente' });
    
    if (role === 'Manager' && user.password !== password) {
      return res.status(401).json({ error: 'Password errata' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Users
app.get('/api/users', async (req, res) => {
  try {
    const result = await query('SELECT * FROM users ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create User
app.post('/api/users', async (req, res) => {
  const { id, name, email, role, department, avatar, password } = req.body;
  try {
    await query(
      'INSERT INTO users (id, name, email, role, department, avatar, password) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, name, email, role, department, avatar, password]
    );
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Requests
app.get('/api/requests', async (req, res) => {
  try {
    // We map snake_case db columns to camelCase for frontend consistency
    const result = await query(`
      SELECT 
        id, user_id as "userId", start_date as "startDate", end_date as "endDate", 
        status, reason, created_at as "createdAt"
      FROM leave_requests ORDER BY created_at DESC
    `);
    
    // Format dates to simple strings YYYY-MM-DD to match frontend expectations
    const formatted = result.rows.map(r => ({
      ...r,
      startDate: new Date(r.startDate).toISOString().split('T')[0],
      endDate: new Date(r.endDate).toISOString().split('T')[0],
      createdAt: parseInt(r.createdAt)
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Request
app.post('/api/requests', async (req, res) => {
  const { id, userId, startDate, endDate, status, reason, createdAt } = req.body;
  try {
    await query(
      'INSERT INTO leave_requests (id, user_id, start_date, end_date, status, reason, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, userId, startDate, endDate, status, reason, createdAt]
    );

    // Get user details for email
    const userRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    // Email to Manager
    await sendEmail(
      'matteo.vizzani@rematarlazzi.it',
      `Nuova Richiesta Ferie: ${user.name}`,
      `Il dipendente ${user.name} (${user.department}) ha richiesto ferie dal ${startDate} al ${endDate}.\nMotivo: ${reason}`
    );

    res.status(201).json({ message: 'Request created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update Request Status
app.put('/api/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await query('UPDATE leave_requests SET status = $1 WHERE id = $2', [status, id]);
    
    // Get request details for email
    const reqRes = await query('SELECT * FROM leave_requests WHERE id = $1', [id]);
    const request = reqRes.rows[0];
    
    if (request) {
      const userRes = await query('SELECT * FROM users WHERE id = $1', [request.user_id]);
      const user = userRes.rows[0];
      
      if (user) {
        await sendEmail(
          user.email,
          `Aggiornamento Ferie: ${status}`,
          `Ciao ${user.name}, la tua richiesta di ferie dal ${new Date(request.start_date).toISOString().split('T')[0]} è stata: ${status}.`
        );
      }
    }

    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send Custom Email (Frontend triggered notification helper)
app.post('/api/notify', async (req, res) => {
  const { to, subject, body } = req.body;
  try {
    await sendEmail(to, subject, body);
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});


// Serve React Frontend (Production)
// In production, Vite builds to 'dist' (or similar), so we serve that.
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
