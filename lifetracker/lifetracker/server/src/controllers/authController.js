const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ message: 'A user with that email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Unable to register user.' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const result = await pool.query('SELECT id, name, email, password FROM users WHERE email = $1', [email]);
    if (result.rowCount === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    delete user.password;

    return res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Unable to log in.' });
  }
};

const me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [req.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ message: 'Unable to fetch profile.' });
  }
};

module.exports = {
  register,
  login,
  me,
};
