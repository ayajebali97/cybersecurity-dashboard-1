const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
};

let pool;

async function getConnection() {
  if (!pool) {
    pool = mysql.createPool({
      ...dbConfig,
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    });
  }
  return pool;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const connection = await getConnection();
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );

    const token = jwt.sign(
      { userId: result.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await connection.end();

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, email }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
