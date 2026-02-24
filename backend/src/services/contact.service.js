const db = require('../config/db');

exports.contact = async ({ name, email, phone, message }) => {
  const status = 'pending';       // default status
  const deleted_at = null;        // not deleted

  await db.query(
    `INSERT INTO contact (name, email, phone, message, status, deleted_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, phone, message, status, deleted_at]
  );
};