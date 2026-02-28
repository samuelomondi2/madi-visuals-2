const db = require("../config/db");

exports.insertFile = async (fileData) => {
  const query = `
    INSERT INTO files 
    (filename, original_name, mimetype, size, file_type, url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    fileData.filename,
    fileData.originalName,
    fileData.mimetype,
    fileData.size,
    fileData.fileType,
    fileData.url,
  ];

  const [result] = await db.execute(query, values);
  return result.insertId;
};


exports.getAllFiles = async () => {
    const [rows] = await db.execute("SELECT * FROM files ORDER BY created_at DESC");
    return rows;
  };