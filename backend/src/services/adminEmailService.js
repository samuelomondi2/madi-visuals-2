const db = require('../config/db');

exports.getEmailDetails = async () => {
    const [rows] = await db.execute(`
      SELECT email, password, updated_at
      FROM admin_email
      ORDER BY updated_at DESC
    `);
  
    return rows || null;
};

exports.updateEmailDetails = async ({ email, password }) => {
    const [latest] = await db.execute(`
      SELECT id FROM admin_email
      ORDER BY updated_at DESC
      LIMIT 1
    `);
  
    if (!latest.length) return null;
  
    const id = latest[0].id;
  
    const [result] = await db.execute(`
      UPDATE admin_email
      SET email = ?, password = ?
      WHERE id = ?
    `, [email, password, id]);
  
    return result;
  };
  