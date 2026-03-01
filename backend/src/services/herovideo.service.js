const db = require("../config/db");

exports.getHeroVideo = async () => {
    const [rows] = await db.execute(`
      SELECT *
      FROM hero_video 
      ORDER BY updated_at DESC
      LIMIT 1
    `);
  
    return rows[0] || null;
};

exports.createHeroVideo = async ({ url }) => {
    await db.execute(`
      INSERT INTO hero_video (id, url)
      VALUES (1, ?)
      ON DUPLICATE KEY UPDATE
        url = VALUES(url),
        updated_at = CURRENT_TIMESTAMP
    `, [url]);
  };