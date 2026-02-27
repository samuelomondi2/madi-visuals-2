const db = require('../config/db');

exports.contact = async ({ name, email, phone, message }) => {
  const status = 'pending';      
  const deleted_at = null;        

  await db.query(
    `INSERT INTO contact (name, email, phone, message, status, deleted_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, phone, message, status, deleted_at]
  );
};

exports.getContacts = async () => {
  const [rows] = await db.query(
    `SELECT id, name, email, phone, message, status, created_at, updated_at 
     FROM contact 
     WHERE deleted_at IS NULL 
     ORDER BY created_at DESC`
  );
  return rows;
};

// ###Filtering by status
// const status = req.query.status;
// let query = `SELECT ... FROM contact WHERE deleted_at IS NULL`;
// const params = [];
// if (status) {
//   query += ` AND status = ?`;
//   params.push(status);
// }
// query += ` ORDER BY created_at DESC`;
// const [rows] = await db.query(query, params);