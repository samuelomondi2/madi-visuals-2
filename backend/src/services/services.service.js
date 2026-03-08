const db = require("../config/db");

exports.getAllServices = async () => {
    const [rows] = await db.execute(`
      SELECT id, name, price, duration_minutes, description 
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