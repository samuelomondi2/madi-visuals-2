const db = require("../config/db");

exports.hero = async ({ title, name, description }) => {
    await db.query(
      `INSERT INTO hero_section (title, name, description) 
       VALUES (?, ?, ?)`,
      [title, name, description]
    );
  };
  
exports.getHero = async () => {
const [rows] = await db.query(
    `SELECT id, title, name, description, updated_at 
    FROM hero_section 
    ORDER BY updated_at DESC
    LIMIt 1`
);
return rows;
};