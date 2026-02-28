const db = require("../config/db");

// Create hero
exports.createHero = async ({ title, name, description }) => {
  await db.execute(
    `INSERT INTO hero_section (title, name, description) 
     VALUES (?, ?, ?)`,
    [title, name, description]
  );
};

// Get latest hero
exports.getHero = async () => {
  const [rows] = await db.execute(`
    SELECT 
      h.id,
      h.title,
      h.name,
      h.description,
      f.url AS hero_image_url
    FROM hero_section h
    LEFT JOIN files f 
      ON h.hero_file_id = f.id
    ORDER BY h.updated_at DESC
    LIMIT 1
  `);

  return rows[0] || null;
};

// Update hero TEXT
exports.updateHeroContent = async ({ id, title, name, description }) => {
  await db.execute(
    `UPDATE hero_section 
     SET title = ?, name = ?, description = ?
     WHERE id = ?`,
    [title, name, description, id]
  );
};

// Update hero IMAGE
exports.updateHeroImage = async (id, fileId) => {
  await db.execute(
    `UPDATE hero_section 
     SET hero_file_id = ?
     WHERE id = ?`,
    [fileId, id]
  );
};

exports.updateHeroWithLatestImage = async () => {

  const [heroRows] = await db.execute(`
    SELECT id 
    FROM hero_section 
    ORDER BY updated_at DESC 
    LIMIT 1
  `);

  if (!heroRows.length) {
    throw new Error("No hero found");
  }

  const heroId = heroRows[0].id;

  const [fileRows] = await db.execute(`
    SELECT id 
    FROM files 
    WHERE file_type = 'image'
    ORDER BY created_at DESC 
    LIMIT 1
  `);

  if (!fileRows.length) {
    throw new Error("No image file found");
  }

  const fileId = fileRows[0].id;

  await db.execute(
    `UPDATE hero_section SET hero_file_id = ? WHERE id = ?`,
    [fileId, heroId]
  );
};