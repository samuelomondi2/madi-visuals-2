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
    const [rows] = await db.execute("SELECT * FROM files ORDER BY created_at DESC");
    return rows;
};

exports.getFileById = async (id) => {
    const [rows] = await db.execute(
      "SELECT * FROM files WHERE id = ?",
      [id]
    );
    return rows[0];
};

exports.deleteFile = async (id) => {
    await db.execute(
        "DELETE FROM files WHERE id = ?",
        [id]
    );
};