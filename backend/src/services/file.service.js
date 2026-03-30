const db = require("../config/db");

exports.createFile = async (file) => {
  const [result] = await db.execute(
    `INSERT INTO media (media_url, media_type, public_id, size)
     VALUES (?, ?, ?, ?)`,
    [file.media_url, file.media_type, file.public_id, file.size]
  );

  return {
    id: result.insertId,
    ...file
  };
};

exports.getAllFiles = async () => {
    const [rows] = await db.execute("SELECT * FROM media ORDER BY created_at DESC");
    return rows;
};

exports.getFileById = async (id) => {
    const [rows] = await db.execute(
      "SELECT * FROM media WHERE id = ?",
      [id]
    );
    return rows[0];
};

exports.deleteFile = async (id) => {
    await db.execute(
        "DELETE FROM media WHERE id = ?",
        [id]
    );
};

exports.getHero = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM media WHERE is_hero = TRUE LIMIT 1"
  );
  return rows[0] || null;
};

exports.setHero = async (id) => {
  if (!id) throw new Error("Media ID is required");

  await db.execute("UPDATE media SET is_hero = FALSE");

  await db.execute("UPDATE media SET is_hero = TRUE WHERE id = ?", [id]);

  return true;
};