const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async ({ email, password }) => {
  const hash = await bcrypt.hash(password, 10);

  await db.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [email, hash]
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
