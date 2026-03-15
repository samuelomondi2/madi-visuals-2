const db = require('../config/db');
const adminEmail = require("./adminEmailService");

exports.contact = async ({ name, email, phone, message }) => {
  const emailDetails = await adminEmail.getEmailDetails(); // fetch latest row
  const adminEmailAddress = emailDetails?.[0]?.email;
  const adminPassword = emailDetails?.[0]?.password;

  if (!adminEmailAddress || !adminPassword) {
    throw new Error("Admin email credentials not configured");
  }

  const status = 'pending';      
  const deleted_at = null;        

  await db.query(
    `INSERT INTO contact (name, email, phone, message, status, deleted_at) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, phone, message, status, deleted_at]
  );

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: adminEmailAddress, 
      pass: adminPassword, 
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: adminEmailAddress,
    subject: `New Contact Message from ${name}`,
    text: `
    Name: ${name}
    Email: ${email}
    Phone: ${phone || "-"}
    Message:
    ${message}
    `,
  };

  await transporter.sendMail(mailOptions);
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

exports.reviewdContact = async ({ id }) => {
  await db.query(
    `
    UPDATE contact
    SET status = CASE
      WHEN status = 'pending' THEN 'reviewed'
      ELSE 'pending'
    END
    WHERE id = ?
    `,
    [id]
  );

  const [updatedRows] = await db.query(
    `SELECT * FROM contact WHERE id = ?`,
    [id]
  );

  return updatedRows[0]; 
};

exports.deleteContact = async ({ id }) => {
  const [result] = await db.query(
    `
    UPDATE contact
    SET deleted = 1, deleted_at = NOW()
    WHERE id = ? AND deleted = 0
    `,
    [id]
  );

  return result;
};

// Filtering
exports.getFilteredContacts = async ({ status, deleted }) => {
  let query = `SELECT * FROM contact WHERE 1=1`;
  const params = [];

  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (deleted !== undefined) {
    query += ` AND deleted = ?`;
    params.push(deleted);
  }

  const [rows] = await db.query(query, params);
  return rows;
};


// exports.deletedContacts = async() => {
//   const [rows] = await db.query(
//     `SELECT id, name, email, phone, message, status, created_at, updated_at 
//      FROM contact 
//      WHERE deleted = 1
//      ORDER BY created_at DESC`
//   );
//   return rows;
// };

// exports.activeContacts = async() => {
//   const [rows] = await db.query(
//     `SELECT id, name, email, phone, message, status, created_at, updated_at 
//      FROM contact 
//      WHERE deleted = 0
//      ORDER BY created_at DESC`
//   );
//   return rows;
// };

// exports.pendingStatusContacts = async() => {
//   const [rows] = await db.query(
//     `SELECT id, name, email, phone, message, status, created_at, updated_at 
//      FROM contact 
//      WHERE status = pending
//      AND deleted = 0
//      ORDER BY created_at DESC`
//   );
//   return rows;
// };

// exports.reviewedStatusContacts = async() => {
//   const [rows] = await db.query(
//     `SELECT id, name, email, phone, message, status, created_at, updated_at 
//      FROM contact 
//      WHERE status = reviewed
//      AND deleted = 0
//      ORDER BY created_at DESC`
//   );
//   return rows;
// };