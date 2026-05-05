const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is required. Set it in your .env file.');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token autentikasi diperlukan.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
}

async function createUsersTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Skip demo user creation in production
  if (process.env.NODE_ENV === 'production') {
    console.log('Production environment: skipping demo user creation.');
    return;
  }

  const result = await db.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(result.rows[0].count) === 0) {
    const hash = await bcrypt.hash('password123', 10);
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      ['demo@dailyvit.com', hash]
    );
    const userId = userResult.rows[0].id;

    await db.query(`
      INSERT INTO user_baseline (user_id, avg_steps, avg_calories, avg_heart_rate)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO NOTHING
    `, [userId, 7000, 450, 75]);

    console.log('Default demo user created (demo@dailyvit.com / password123)');
  }
}

async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email dan password diperlukan.' });
    }

    const db = require('../config/db');
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Email atau password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({ success: true, token, email: user.email });
  } catch (error) {
    next(error);
  }
}

module.exports = { authenticateToken, loginHandler, createUsersTable };
