const db = require("../config/db");

exports.getAllServices = async () => {
    const [rows] = await db.execute(`
      SELECT id, name, duration, base_price, delivery, category
      FROM services
    `);
  
    return rows || null;
};

exports.getASingleService = async ({ id }) => {
    const [rows] = await db.execute(
        "SELECT * FROM services WHERE id = ?",
        [id]
      );
      return rows[0];
};

exports.addAService = async ({ name, duration, base_price, delivery, category }) => {
  const [result] = await db.query(
    `
    INSERT INTO services (name, duration, base_price, delivery, category)
    VALUES (?, ?, ?, ?, ?)
    `,
    [name, duration, base_price, delivery, category]
  );

  return result.insertId;
};

exports.updateAService = async (id, updates) => {

  const fields = [];
  const values = [];

  for (const key in updates) {
    fields.push(`${key} = ?`);
    values.push(updates[key]);
  }

  if (fields.length === 0) {
    return null;
  }

  values.push(id);

  const [result] = await db.query(
    `UPDATE services SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result;
};


