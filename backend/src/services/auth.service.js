const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const emailRender = require("../middleware/email");

exports.register = async ({ name, email, password, role }) => {
  const hash = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, role]
  );
};

exports.login = async ({ email, password }) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (!rows.length) throw new Error('Invalid credentials');

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid credentials');

  return user;
};

exports.forgotPassword = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email]
  );

  if (!rows.length) return; 

  const user = rows[0];

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const expire = Date.now() + 3600000; 

  await db.query(
    'UPDATE users SET reset_token = ?, reset_token_expire = ? WHERE id = ?',
    [hashedToken, expire, user.id]
  );

  await emailRender.forgotPasswordTokenEmail({email, token});

  return token; 
};

exports.resetPassword = async (token, newPassword) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const [rows] = await db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expire > ?',
    [hashedToken, Date.now()]
  );

  if (!rows.length) throw new Error('Invalid or expired token');

  const user = rows[0];

  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  const hash = await bcrypt.hash(newPassword, 10);

  await db.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?',
    [hash, user.id]
  );

  return true;
};