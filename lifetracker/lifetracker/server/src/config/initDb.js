/*
  Database initialization helper.
  - Runs schema creation from schema.sql
  - Ensures required columns exist
  - Seeds an admin user for local development
*/
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const initSchema = async () => {
  const schemaFile = path.resolve(__dirname, '../../schema.sql');
  const schema = fs.readFileSync(schemaFile, 'utf8');
  const statements = schema
    .split(';')
    .map((stmt) => stmt.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }
};

const ensureCompletedColumn = async () => {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed'`
  );

  if (result.rowCount === 0) {
    await pool.query('ALTER TABLE tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE');
    console.log('Added completed column to tasks table');
  }
};

const ensureProfilePictureColumn = async () => {
  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_picture_url'`
  );

  if (result.rowCount === 0) {
    await pool.query('ALTER TABLE users ADD COLUMN profile_picture_url TEXT');
    console.log('Added profile_picture_url column to users table');
  }
};

const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin';

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existing.rowCount === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
      [adminName, adminEmail, hashedPassword]
    );
    console.log('Admin user seeded:', adminEmail);
  }
};

const initDb = async () => {
  try {
    await initSchema();
    await ensureCompletedColumn();
    await ensureProfilePictureColumn();
    await seedAdminUser();
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('DB initialization error:', error);
    throw error;
  }
};

module.exports = initDb;
