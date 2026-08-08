require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'algomage_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test Database Connection & Create Table
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
    connection.release();

    const createTableSql = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    db.query(createTableSql, (tableErr) => {
      if (tableErr) console.error('❌ Table creation failed:', tableErr.message);
      else console.log('✅ "messages" table is ready');
    });
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('AlgoMage API is running...');
});

// POST /api/contact - Save message & send email notification
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // 1. Save to Database
  const sql = 'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)';
  db.query(sql, [name, email, message], (err, result) => {
    if (err) {
      console.error('MySQL Error:', err);
      return res.status(500).json({ error: 'Database insert failed' });
    }

    // 2. Prepare Email Notification Options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
      subject: `📩 New Portfolio Contact Form Submission from ${name}`,
      html: `
        <h3>New Contact Message Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f4f4f4; padding: 12px; border-radius: 6px;">${message}</p>
      `
    };

    // 3. Send Email Notification asynchronously
    transporter.sendMail(mailOptions, (mailErr, info) => {
      if (mailErr) {
        console.error('⚠️ Message saved to DB, but email failed:', mailErr.message);
      } else {
        console.log('📧 Notification email sent:', info.response);
      }
    });

    // Respond immediately to the frontend
    res.status(201).json({
      success: true,
      message: 'Message stored and notification sent!',
      id: result.insertId
    });
  });
});

// GET /api/contact - Retrieve stored messages
app.get('/api/contact', (req, res) => {
  const sql = 'SELECT * FROM messages ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});